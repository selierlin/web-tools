'use strict';
/**
 * IP 归属地与域名反查
 *
 * xdb 数据文件约 11MB，不进仓库，运行时从数据目录加载：
 *   IPDB_PATH 优先，否则 ${BOCE_DATA_DIR}/ip2region_v4.xdb
 *   本地开发回退到仓库根 data/ip2region_v4.xdb
 * 文件缺失时接口返回 503，不影响其他接口。
 */
const fs = require('fs');
const path = require('path');
const net = require('net');
const dns = require('dns').promises;

const { newWithBuffer } = require('./ipdb/searcher');
const { IPv4 } = require('./ipdb/util');

const DB_PATH = process.env.IPDB_PATH
  || path.join(process.env.BOCE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'ip2region_v4.xdb');

let searcher = null;
let loadError = null;
try {
  searcher = newWithBuffer(IPv4, fs.readFileSync(DB_PATH));
} catch (e) {
  loadError = e.message;
  console.warn(`[ip] 未加载 IP 库 ${DB_PATH}: ${e.message}`);
}

/* ---------------- 限流 ---------------- */

const WINDOW_MS = 60 * 1000;
const MAX_HITS = 60;
const hits = new Map();

// express 已按 trust proxy 解完代理链，直接用算好的 IP
// 双栈监听时 IPv4 客户端会带 ::ffff: 前缀，先剥掉再判版本
function clientIp(req) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return ip.startsWith('::ffff:') ? ip.slice(7) : ip;
}

function rateLimit(req, res, next) {
  const now = Date.now();
  const key = clientIp(req);
  let list = hits.get(key);
  if (!list) {
    list = [];
    hits.set(key, list);
  }
  while (list.length && now - list[0] > WINDOW_MS) list.shift();
  if (list.length >= MAX_HITS) {
    res.set('Retry-After', String(Math.ceil(WINDOW_MS / 1000)));
    return res.status(429).json({ ok: false, error: '请求过于频繁，请稍后再试' });
  }
  list.push(now);
  next();
}

// 定期清掉长时间不活跃的来源 IP，避免 Map 无限增长
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;
  for (const [key, list] of hits) {
    if (!list.length || list[list.length - 1] < cutoff) hits.delete(key);
  }
}, WINDOW_MS).unref();

/* ---------------- 归属地 ---------------- */

// ip2region 返回「国家|省|市|ISP|国家码」，内网/保留地址是 Reserved
function parseRegion(region) {
  const parts = String(region || '').split('|');
  const at = (i) => {
    const v = (parts[i] || '').trim();
    return v === '0' ? '' : v;
  };
  const country = at(0);
  if (!country || country === 'Reserved') return null;
  return {
    country,
    province: at(1),
    city: at(2),
    isp: at(3),
    countryCode: at(4),
  };
}

async function geoOf(ip) {
  if (!searcher) {
    const err = new Error('IP 库未安装，请把 ip2region_v4.xdb 放到数据目录');
    err.status = 503;
    err.code = loadError;
    throw err;
  }
  return parseRegion(await searcher.search(ip));
}

/* ---------------- 接口 ---------------- */

async function whoami(req, res) {
  const ip = clientIp(req);
  const ver = net.isIP(ip);
  if (ver !== 4) {
    return res.json({ ok: true, ip, geo: null, note: ver === 6 ? '暂不支持 IPv6 归属地' : '无法识别来源 IP' });
  }
  const geo = await geoOf(ip);
  res.json({ ok: true, ip, geo });
}

async function lookupIp(req, res) {
  const ip = String(req.query.ip || '').trim();
  const ver = net.isIP(ip);
  if (!ver) return res.status(400).json({ ok: false, error: '请输入合法的 IP 地址' });
  if (ver === 6) return res.status(400).json({ ok: false, error: '暂只支持 IPv4 归属地查询' });
  res.json({ ok: true, ip, geo: await geoOf(ip) });
}

/* ---------------- 域名反查 ---------------- */

const DOMAIN_RE = /^(?=.{1,253}$)(?!-)[a-z0-9-]{1,63}(?<!-)(?:\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/i;
const BLOCKED_DOMAIN = /(?:^|\.)(?:local|localhost|internal|lan|home\.arpa)$/i;

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(Object.assign(new Error('DNS 查询超时'), { code: 'DNS_TIMEOUT' })), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// 原生 DNS 接口不返回 Authority/Additional 段和 flags，这里只把能拿到的记录结构化
function formatRecord(type, value) {
  switch (type) {
    case 'A':
    case 'AAAA':
      return { value: typeof value === 'string' ? value : value.address, ttl: typeof value === 'string' ? null : value.ttl };
    case 'CNAME':
    case 'NS':
      return { value };
    case 'MX':
      return { value: value.exchange, priority: value.priority };
    case 'TXT':
      return { value: value.join('') };
    case 'SOA':
      return {
        value: `${value.nsname} ${value.hostmaster} ${value.serial}`,
        nsname: value.nsname,
        hostmaster: value.hostmaster,
        serial: value.serial,
      };
    default:
      return { value: String(value) };
  }
}

// resolveCname 只返回「当前名字自己」的一条 CNAME，要还原整条链只能逐跳追问
const MAX_CHAIN = 8;
async function resolveChain(domain) {
  const chain = [];
  let name = domain;
  for (let i = 0; i < MAX_CHAIN; i++) {
    let list;
    try {
      list = await withTimeout(dns.resolveCname(name), 3000);
    } catch (e) {
      break;
    }
    if (!list || !list.length) break;
    chain.push({ from: name, to: list[0] });
    name = list[0];
  }
  return { chain, finalName: name };
}

// NS/SOA 是区级别记录，子域查不到；从链尾名字逐级向上找到真正持有该区的名字
async function atZone(name, lookup) {
  let cur = name;
  for (let i = 0; i < 6; i++) {
    try {
      const value = await withTimeout(lookup(cur), 3000);
      const has = Array.isArray(value) ? value.length > 0 : !!value;
      if (has) return { zone: cur, value };
    } catch (e) { /* 这一级没有，继续向上 */ }
    const dot = cur.indexOf('.');
    if (dot < 1) break;
    cur = cur.slice(dot + 1);
    if (cur.indexOf('.') < 1) break; // 不再查 TLD
  }
  return null;
}

async function resolveDomain(req, res) {
  const domain = String(req.query.domain || '').trim().replace(/\.$/, '');
  // more=1 时才查 MX/TXT/NS/SOA，首屏只查地址记录，快一些
  const more = req.query.more === '1';
  if (!DOMAIN_RE.test(domain)) return res.status(400).json({ ok: false, error: '请输入合法的域名' });
  if (BLOCKED_DOMAIN.test(domain)) return res.status(400).json({ ok: false, error: '不支持解析内网或保留域名' });

  const started = Date.now();
  const queries = [
    ['A', dns.resolve4(domain, { ttl: true })],
    ['AAAA', dns.resolve6(domain, { ttl: true })],
  ];
  if (more) {
    queries.push(
      ['MX', dns.resolveMx(domain)],
      ['TXT', dns.resolveTxt(domain)],
    );
  }

  const [settled, chain] = await Promise.all([
    Promise.allSettled(queries.map(([, p]) => withTimeout(p, 3000))),
    resolveChain(domain),
  ]);

  const records = {};
  settled.forEach((r, i) => {
    if (r.status !== 'fulfilled') return;
    const type = queries[i][0];
    // SOA 返回单个对象，其余记录类型返回数组
    const list = Array.isArray(r.value) ? r.value : [r.value];
    records[type] = list.slice(0, 20).map((v) => formatRecord(type, v));
  });
  if (chain.chain.length) records.CNAME = chain.chain.map((h) => ({ value: h.to }));

  // NS/SOA 从链尾开始找，和 dig 的 AUTHORITY 段对齐
  const zones = {};
  if (more) {
    const [ns, soa] = await Promise.all([
      atZone(chain.finalName, (n) => dns.resolveNs(n)),
      atZone(chain.finalName, (n) => dns.resolveSoa(n)),
    ]);
    if (ns) {
      records.NS = ns.value.slice(0, 20).map((v) => formatRecord('NS', v));
      zones.NS = ns.zone;
    }
    if (soa) {
      records.SOA = [formatRecord('SOA', soa.value)];
      zones.SOA = soa.zone;
    }
  }

  // 状态以 A/AAAA 为准：都失败时再区分不存在、超时和服务端故障
  const addr = [settled[0], settled[1]];
  const codes = addr.filter((r) => r.status === 'rejected').map((r) => r.reason && r.reason.code);
  let status = 'NOERROR';
  if (addr.every((r) => r.status === 'rejected')) {
    if (codes.includes('ETIMEOUT') || codes.includes('DNS_TIMEOUT')) status = 'TIMEOUT';
    else if (codes.includes('ESERVFAIL')) status = 'SERVFAIL';
    else if (codes.includes('ENOTFOUND')) status = 'NXDOMAIN';
  }

  res.json({
    ok: true,
    domain,
    status,
    elapsed: Date.now() - started,
    records,
    cnameChain: chain.chain,
    zones,
  });
}

// 这几个接口挂在 auth.guard 之前，自己兜住异常，避免未处理 rejection 打崩进程
const safe = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((e) => {
  res.status(e.status || 500).json({ ok: false, error: e.message, code: e.code });
});

module.exports = { rateLimit, whoami: safe(whoami), lookupIp: safe(lookupIp), resolveDomain: safe(resolveDomain) };
