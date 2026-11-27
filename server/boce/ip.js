'use strict';
/**
 * IP 归属地与域名反查
 *
 * xdb 数据文件不进仓库，运行时从数据目录加载（v4 约 11MB、v6 约 36MB）：
 *   v4：IPDB_PATH 优先，否则 ${BOCE_DATA_DIR}/ip2region_v4.xdb
 *   v6：IPDB_PATH_V6 优先，否则 ${BOCE_DATA_DIR}/ip2region_v6.xdb
 *   本地开发回退到仓库根 data/
 * 单版本文件缺失时该版本接口返回 503，另一个版本和其他接口不受影响。
 */
const fs = require('fs');
const path = require('path');
const net = require('net');
const dns = require('dns').promises;

const { newWithBuffer } = require('./ipdb/searcher');
const { IPv4, IPv6 } = require('./ipdb/util');

const DB_DIR = process.env.BOCE_DATA_DIR || path.join(__dirname, '..', '..', 'data');
const DB_V4 = process.env.IPDB_PATH || path.join(DB_DIR, 'ip2region_v4.xdb');
const DB_V6 = process.env.IPDB_PATH_V6 || path.join(DB_DIR, 'ip2region_v6.xdb');

// 两个版本各一个 searcher，全内存；加载失败只影响对应版本
const searchers = { 4: null, 6: null };
const loadErrors = {};

function loadDb(ver, Version, file) {
  try {
    searchers[ver] = newWithBuffer(Version, fs.readFileSync(file));
  } catch (e) {
    loadErrors[ver] = e.message;
    console.warn(`[ip] 未加载 IPv${ver} 库 ${file}: ${e.message}`);
  }
}

loadDb(4, IPv4, DB_V4);
loadDb(6, IPv6, DB_V6);

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

async function geoOf(ip, ver) {
  const searcher = searchers[ver];
  if (!searcher) {
    const err = new Error(`IP 库未安装，请把 ip2region_v${ver}.xdb 放到数据目录`);
    err.status = 503;
    err.code = loadErrors[ver];
    throw err;
  }
  return parseRegion(await searcher.search(ip));
}

/* ---------------- 反向解析（PTR） ---------------- */

function isPrivateV4(ip) {
  const o = ip.split('.').map(Number);
  if (o.length !== 4 || o.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  if (o[0] === 0 || o[0] === 10 || o[0] === 127) return true;
  if (o[0] === 169 && o[1] === 254) return true;              // 链路本地
  if (o[0] === 172 && o[1] >= 16 && o[1] <= 31) return true;  // 172.16/12
  if (o[0] === 192 && o[1] === 168) return true;              // 192.168/16
  if (o[0] === 100 && o[1] >= 64 && o[1] <= 127) return true; // 100.64/10 CGNAT
  if (o[0] >= 224) return true;                               // 组播/保留
  return false;
}

function isPrivate(ip, ver) {
  if (ver === 4) return isPrivateV4(ip);
  const v = ip.toLowerCase();
  if (v === '::1' || v === '::') return true;
  if (/^f[cd][0-9a-f]{0,2}:/.test(v)) return true;  // fc00::/7 ULA
  if (/^fe[89ab][0-9a-f]?:/.test(v)) return true;   // fe80::/10 链路本地
  if (v.startsWith('::ffff:')) {
    const v4 = v.slice(7);
    return net.isIP(v4) === 4 ? isPrivateV4(v4) : true;
  }
  return false;
}

// PTR 只是锦上添花：内网/保留地址直接跳过，超时按「没有」处理
async function reverseOf(ip) {
  const ver = net.isIP(ip);
  if (!ver || isPrivate(ip, ver)) return [];
  try {
    const names = await withTimeout(dns.reverse(ip), 2500);
    return (names || []).map((n) => String(n).replace(/\.$/, '')).slice(0, 5);
  } catch (e) {
    return [];
  }
}

/* ---------------- 接口 ---------------- */

async function whoami(req, res) {
  const ip = clientIp(req);
  const ver = net.isIP(ip);
  if (ver !== 4 && ver !== 6) {
    return res.json({ ok: true, ip, geo: null, note: '无法识别来源 IP' });
  }
  if (!searchers[ver]) {
    // 库没装时不报错中断，只说明该版本不可用
    return res.json({ ok: true, ip, geo: null, note: `暂不支持 IPv${ver} 归属地（库未安装）` });
  }
  res.json({ ok: true, ip, geo: await geoOf(ip, ver), ptr: await reverseOf(ip) });
}

async function lookupIp(req, res) {
  const ip = String(req.query.ip || '').trim();
  const ver = net.isIP(ip);
  if (!ver) return res.status(400).json({ ok: false, error: '请输入合法的 IP 地址' });

  // 归属地和 PTR 并行查；PTR 慢/不存在都不该拖住归属地
  const [geo, ptr] = await Promise.all([geoOf(ip, ver), reverseOf(ip)]);
  res.json({ ok: true, ip, geo, ptr });
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
