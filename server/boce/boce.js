'use strict';
/**
 * BOCE 拨测协议核心
 * 逆向自 https://www.boce.com/ (2026-11)
 *
 * 关键事实（均经实测）：
 *  - 请求体需加密：params(DES-CBC) + params_enc(AES-CBC + HMAC-SHA256 信封)
 *  - 加密 key 内联在页面：32b85ab5b8cfe30c06b8bff43765f707，legacyIv: 01020304
 *  - node_type=4 或不传 → 93 节点（电信31/联通31/移动31，全国31省）
 *  - node_type=1     → 12 节点（电信3/移动9）
 *  - 额度按「域名个数」计，与节点数无关
 *  - 批量模式下 task_token 是数组
 *  - 结果页 /http/<time_id>.html 公开可读，内嵌完整 result JSON
 */
const C = require('crypto-js');
const WebSocket = require('ws');

const BASE = 'https://www.boce.com';
const ENCRYPT_KEY = '32b85ab5b8cfe30c06b8bff43765f707';
const LEGACY_IV = '01020304';

const UA_POOL = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
];
const pickUA = () => UA_POOL[Math.floor(Math.random() * UA_POOL.length)];

/* ---------------- 加密 ---------------- */
const deriveKey = (k, p) => C.HmacSHA256('boce-request-' + p + '-v1', C.enc.Utf8.parse(k));
const b64 = (v) => C.enc.Base64.stringify(v);

function encryptAes(pt, key) {
  const iv = C.lib.WordArray.random(16);
  const ct = C.AES.encrypt(C.enc.Utf8.parse(pt), deriveKey(key, 'enc'), {
    iv, mode: C.mode.CBC, padding: C.pad.Pkcs7,
  }).ciphertext;
  const body = 'v1.' + b64(iv) + '.' + b64(ct);
  return body + '.' + b64(C.HmacSHA256(body, deriveKey(key, 'mac')));
}

function encryptRequest(obj) {
  const pt = JSON.stringify(obj);
  const legacy = C.DES.encrypt(C.enc.Utf8.parse(pt), C.enc.Utf8.parse(ENCRYPT_KEY), {
    iv: C.enc.Utf8.parse(LEGACY_IV), mode: C.mode.CBC, padding: C.pad.Pkcs7,
  }).ciphertext.toString();
  return { params: legacy, params_enc: encryptAes(pt, ENCRYPT_KEY) };
}

/* ---------------- 结果页解析 ---------------- */
const RESULT_PATH = {
  http: '/http/', ping: '/ping/', tcping: '/tcping/', udping: '/udping/',
  dns: '/dns/', hijack: '/hijack/', pollute: '/pollute/', wall: '/wall/',
  traceroute: '/traceroute/', mtr: '/mtr/', ip_state: '/ip_state/',
  ssl: '/ssl/', whois: '/whois/', ip_city: '/ip_city/',
};

function extractVar(html, name) {
  const re = new RegExp('var\\s+' + name + '\\s*=\\s*');
  const m = re.exec(html);
  if (!m) return null;
  let i = m.index + m[0].length;
  const ch = html[i];
  if (ch !== '[' && ch !== '{') {
    const end = html.indexOf(';', i);
    return html.slice(i, end).trim();
  }
  const open = ch, close = ch === '[' ? ']' : '}';
  let depth = 0, inStr = false, esc = false;
  for (let j = i; j < html.length; j++) {
    const c = html[j];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') { inStr = true; continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) return html.slice(i, j + 1); }
  }
  return null;
}

/** 从结果页 HTML 里挖出主体 JSON（含 result 数组） */
function extractBody(html) {
  const m = /"result"\s*:\s*\[/.exec(html);
  if (!m) return null;
  let start = -1, depth = 0;
  for (let i = m.index; i >= 0; i--) {
    const c = html[i];
    if (c === '}') depth++;
    else if (c === '{') {
      if (depth === 0) { start = i; break; }
      depth--;
    }
  }
  if (start < 0) return null;
  let d = 0, inS = false, e2 = false;
  for (let j = start; j < html.length; j++) {
    const c = html[j];
    if (inS) {
      if (e2) e2 = false;
      else if (c === '\\') e2 = true;
      else if (c === '"') inS = false;
      continue;
    }
    if (c === '"') { inS = true; continue; }
    if (c === '{') d++;
    else if (c === '}') { d--; if (d === 0) { try { return JSON.parse(html.slice(start, j + 1)); } catch { return null; } } }
  }
  return null;
}

/** 拉结果页（公开，不耗额度） */
async function fetchResult(time_id, { type = 'http' } = {}) {
  const path = RESULT_PATH[type] || '/http/';
  const url = `${BASE}${path}${time_id}.html`;
  const res = await fetch(url, { headers: { 'User-Agent': pickUA() } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const body = extractBody(html);
  const out = { url, time_id, body: body || {}, rows: (body && body.result) || [] };

  // allNodes（节点池全景，用于地图/节点名映射）
  let an = extractVar(html, 'allNodes');
  if (an) { try { out.allNodes = JSON.parse(an); } catch {} }
  return out;
}

/* ---------------- 建任务 ---------------- */
async function buildTask(obj, { cookie = '', ua } = {}) {
  const enc = encryptRequest(obj);
  const headers = {
    'User-Agent': ua || pickUA(),
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-Requested-With': 'XMLHttpRequest',
    Referer: BASE + '/http',
    Origin: BASE,
    'Accept-Language': 'zh-CN,zh;q=0.9',
  };
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(BASE + '/build_url', {
    method: 'POST', headers, body: new URLSearchParams(enc).toString(),
  });
  let json;
  const text = await res.text();
  try { json = JSON.parse(text); } catch { throw new Error('非JSON响应: ' + text.slice(0, 120)); }

  const d = Array.isArray(json.data) ? {} : (json.data || {});
  if (json.code !== 200) {
    const err = new Error(json.message || ('code=' + json.code));
    err.code = json.code;
    err.count = d.count; err.limit = d.limit; err.point = d.total_point;
    throw err;
  }
  const raw = d.task_token;
  const tokens = Array.isArray(raw) ? raw : (raw ? [raw] : []);
  return {
    tokens,
    nodes: d.nodes || [],
    nodeCount: (d.nodes || []).length,
    limit: d.limit,
    count: d.count,
    point: d.total_point,
    domainNum: d.domain_num,
  };
}

/* ---------------- WS 结果流 ---------------- */
/**
 * 订阅任务结果流。服务端分多批发推，每批立即通过 onBatch 回调送出。
 *
 * 实测推送时序（92 节点任务）：
 *   208ms  code=100  1 条   任务元信息（不是节点数据！）
 *   1080ms code=0    83 条  第一批
 *   ...    多次 code=0 小批
 *   6245ms code=102  finish
 *
 * @param {string} task_token
 * @param {object} opt
 * @param {number} opt.timeoutMs
 * @param {(rows:Array, total:number)=>void} opt.onBatch  每批节点数据到达时立即调用
 * @returns {Promise<{rows:Array, timeout:boolean}>}
 */
function streamResult(task_token, { timeoutMs = 90_000, onBatch } = {}) {
  return new Promise((resolve) => {
    const rows = [];
    const seen = new Set();          // 去重键，防重复推送
    let ws, settled = false, idleTimer = null;

    const finish = (timeout) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearTimeout(idleTimer);
      try { ws && ws.close(); } catch {}
      resolve({ rows, timeout });
    };

    try {
      ws = new WebSocket('wss://www.boce.com/websocket/node_task', {
        headers: { Origin: BASE, 'User-Agent': UA_POOL[0] },
      });
    } catch { return resolve({ rows, timeout: true }); }

    const timer = setTimeout(() => finish(true), timeoutMs);

    // 空闲收尾：已收到过数据，且 8 秒内没有新批次 → 认为推送结束
    const armIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { if (rows.length) finish(false); }, 8000);
    };

    ws.on('open', () => {
      try { ws.send(JSON.stringify({ task_token })); } catch { finish(true); }
    });

    ws.on('message', (m) => {
      let d; try { d = JSON.parse(m.toString()); } catch { return; }

      // 结束信号
      if (d.code === 102 || d.message === 'finish') return finish(false);

      // 终止类错误码：立即结束，不空等超时
      // -3 波点相关错误 / 1 参数过期 / -10 游客限制 等
      if (d.code !== 0 && d.code !== 100) {
        if (d.message && d.message !== 'curl') {
          try { (ws._errs = ws._errs || []).push(d.message); } catch {}
        }
        return finish(false);
      }

      // 只收 code=0 的节点数据；code=100 是任务元信息，不能当节点行
      if (d.code !== 0 || !Array.isArray(d.data) || !d.data.length) return;

      // 过滤出真正的节点结果（必须有 node_id / node_name）
      const fresh = [];
      for (const row of d.data) {
        if (!row || typeof row !== 'object') continue;
        if (row.node_id === undefined && row.node_name === undefined) continue;
        const key = `${row.node_id}|${row.isp}|${row.host || row.domain || ''}`;
        if (seen.has(key)) continue;
        seen.add(key);
        fresh.push(row);
      }
      if (!fresh.length) return;

      rows.push(...fresh);
      if (onBatch) { try { onBatch(fresh, rows.length); } catch {} }
      armIdle();
    });

    ws.on('error', () => finish(true));
    ws.on('close', () => { if (!settled) finish(false); });
  });
}

/**
 * 等任务结果：WS 实时收流，每批通过 onBatch 立即回调；失败时用结果页兜底。
 * @param {string[]} tokens
 * @param {object} opt
 * @param {(rows:Array, total:number)=>void} opt.onBatch  节点数据分批到达
 * @param {(total:number)=>void} opt.onProgress
 */
async function waitTask(tokens, { timeoutMs = 150_000, onBatch, onProgress } = {}) {
  const all = [];
  let reported = 0;

  const settled = await Promise.all(tokens.map(async (tok) => {
    const { rows, timeout } = await streamResult(tok, {
      timeoutMs,
      onBatch: (fresh, total) => {
        all.push(...fresh);
        reported = all.length;
        if (onBatch) { try { onBatch(fresh, all.length); } catch {} }
        if (onProgress) { try { onProgress(all.length); } catch {} }
      },
    });
    if (rows.length) return rows;

    // 仅当 WS 是真超时（不是明确错误码）才用结果页兜底，且最多 8 秒。
    // 收到 -3/-10 这类错误码说明任务根本没下发，轮询结果页毫无意义。
    if (!timeout) return rows;

    const start = Date.now();
    while (Date.now() - start < 8_000) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const p = await fetchResult(tok, { type: 'http' });
        if (p.rows.length) {
          if (onBatch) { try { onBatch(p.rows, all.length + p.rows.length); } catch {} }
          return p.rows;
        }
      } catch { /* 结果页未生成 */ }
    }
    return rows;
  }));

  // 合并（若走了兜底路径，避免重复）
  if (all.length === 0) {
    for (const s of settled) all.push(...s);
    if (onProgress) { try { onProgress(all.length); } catch {} }
  }
  return all;
}

module.exports = {
  BASE, ENCRYPT_KEY, UA_POOL, pickUA,
  encryptRequest, buildTask, streamResult, waitTask,
  fetchResult, extractBody, extractVar, RESULT_PATH,
};
