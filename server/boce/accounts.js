'use strict';
/**
 * 账号管理：登录、会话持久化、额度查询、自动轮换
 *
 * 实测要点：
 *  - POST /apiHtml/login 需加密信封，无滑块
 *  - Set-Cookie 返回 XSRF-TOKEN + dns_boce7_session
 *  - POST /apiHtml/member 校验会话，data.member.balance = 波点余额
 *  - build_url 返回的 limit/count 才是真实额度（limit=20 域名次/天）
 */
const fs = require('fs');
const path = require('path');
const { BASE, encryptRequest, pickUA } = require('./boce');
const space = require('./space');

/** 数据目录随当前访问口令的空间变化 */
const dataDir = () => space.current();
const dbFile = () => path.join(dataDir(), 'accounts.json');

function ensureDir() {
  const dir = dataDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/* ---------------- 存储 ---------------- */
function load() {
  ensureDir();
  if (!fs.existsSync(dbFile())) return { seq: 1, accounts: [] };
  try {
    const raw = JSON.parse(fs.readFileSync(dbFile(), 'utf8'));
    if (!raw.accounts) raw.accounts = [];
    if (!raw.seq) raw.seq = raw.accounts.length + 1;
    return raw;
  } catch {
    return { seq: 1, accounts: [] };
  }
}

function save(db) {
  ensureDir();
  const tmp = dbFile() + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, dbFile());
}

/* ---------------- 登录 ---------------- */
async function warmupCookies() {
  const res = await fetch(BASE + '/user/', { headers: { 'User-Agent': pickUA() } });
  return (res.headers.getSetCookie?.() || []).map((c) => c.split(';')[0]).join('; ');
}

async function login(account, password) {
  const ua = pickUA();
  const preCookie = await warmupCookies();
  const enc = encryptRequest({ email_or_phone: account, password });

  const headers = {
    'User-Agent': ua,
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-Requested-With': 'XMLHttpRequest',
    Referer: BASE + '/user/',
    Origin: BASE,
  };
  if (preCookie) headers.Cookie = preCookie;

  const res = await fetch(BASE + '/apiHtml/login', {
    method: 'POST', headers, body: new URLSearchParams(enc).toString(),
  });
  const setCookies = (res.headers.getSetCookie?.() || []).map((c) => c.split(';')[0]);
  const cookie = [preCookie, ...setCookies].filter(Boolean).join('; ');
  let json;
  const text = await res.text();
  try { json = JSON.parse(text); } catch { throw new Error('非JSON: ' + text.slice(0, 120)); }

  if (json.code !== 0) {
    const e = new Error(json.message || ('code=' + json.code));
    e.code = json.code;
    throw e;
  }
  return { cookie, ua };
}

/** 用 cookie 校验会话并拿余额 */
async function sessionInfo(cookie, ua) {
  const res = await fetch(BASE + '/apiHtml/member', {
    method: 'POST',
    headers: {
      'User-Agent': ua || pickUA(),
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      Referer: BASE + '/user/',
      Origin: BASE,
      Cookie: cookie,
    },
    body: '{}',
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { throw new Error('非JSON'); }
  if (json.code !== 0) {
    const e = new Error(json.message || 'code=' + json.code);
    e.code = json.code;
    throw e;
  }
  const d = json.data || {};
  return {
    uid: d.member?.id,
    accountName: d.member?.emailNoHide || d.member?.phone || d.member?.email || '',
    balance: d.member?.balance ?? 0,
    isReal: d.member?.is_real === 1,
    vip: !!(d.vip && d.vip.status),
    todayPoint: d.give?.today_point ?? 0,
    tomorrowPoint: d.give?.tomorrow_point ?? 0,
  };
}

/** 用一次不消耗额度的手段查额度：build_url 会被拒时仍能拿到 limit/count */
/**
 * 频控退避查额度：code=1 时按 3s/6s/12s 重试
 * 实测 boce 频控很敏感，1 秒间隔就会触发，退避后约 5~8 秒恢复
 */
async function quotaInfoWithRetry(cookie, ua, { retries = 3, base = 3000 } = {}) {
  let last = null;
  for (let i = 0; i <= retries; i++) {
    last = await quotaInfo(cookie, ua);
    if (last.code !== 1) return last;
    if (i < retries) await new Promise((r) => setTimeout(r, base * Math.pow(2, i)));
  }
  return last;
}

async function quotaInfo(cookie, ua) {
  // 用一个必然较便宜的探测对象；即便额度耗尽，返回体里仍带 limit/count
  const obj = { type: 'http', host: ['www.boce.com'], isp: ['1'], node_type: '1', batch: false, get_token: 1 };
  const enc = encryptRequest(obj);
  const headers = {
    'User-Agent': ua || pickUA(),
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-Requested-With': 'XMLHttpRequest',
    Referer: BASE + '/http', Origin: BASE, Cookie: cookie,
  };
  const res = await fetch(BASE + '/build_url', {
    method: 'POST', headers, body: new URLSearchParams(enc).toString(),
  });
  const json = await res.json();
  const d = Array.isArray(json.data) ? {} : (json.data || {});
  return {
    ok: json.code === 200,
    code: json.code,
    message: json.message || '',
    limit: d.limit ?? 0,
    count: d.count ?? 0,
    left: Math.max(0, (d.limit ?? 0) - (d.count ?? 0)),
    point: d.total_point ?? 0,
    isFree: d.isFree,
    domainNum: d.domain_num,
  };
}

/* ---------------- CRUD ---------------- */
async function addAccount({ account, password, cookie: rawCookie, label }) {
  const db = load();

  let cookie = rawCookie, ua, info;

  if (rawCookie) {
    // 直接贴 cookie 模式
    ua = pickUA();
    info = await sessionInfo(rawCookie, ua);
  } else {
    if (!account || !password) throw new Error('需要账号密码或已有 cookie');
    const r = await login(account, password);
    cookie = r.cookie; ua = r.ua;
    info = await sessionInfo(cookie, ua);
  }

  const dup = db.accounts.find((a) => a.uid && a.uid === info.uid);
  if (dup) throw new Error(`该账号已存在（uid=${info.uid}）`);

  const acc = {
    id: db.seq++,
    label: label || info.accountName || account || `账号${db.seq}`,
    account: account || info.accountName || '',
    uid: info.uid,
    password: password || '',   // 用于每日自动登录领波点
    cookie,
    ua,
    vip: info.vip,
    createdAt: new Date().toISOString(),
    lastCheckAt: new Date().toISOString(),
    // 缓存额度，定期刷新
    quota: { limit: 0, count: 0, left: 0, point: info.balance },
    disabled: false,
  };
  // 立刻拉真实额度（登录后易触发频控，重试 3 次并退避）
  for (let i = 0; i < 3; i++) {
    try {
      const q = await quotaInfoWithRetry(cookie, ua);
      if (q.limit > 0) {
        acc.quota = { limit: q.limit, count: q.count, left: q.left, point: q.point };
        acc.lastError = q.ok ? '' : (q.message || '');
        break;
      }
      acc.lastError = q.message || '额度查询未返回 limit';
    } catch (e) {
      acc.lastError = e.message;
    }
    await new Promise((r) => setTimeout(r, 3000 * (i + 1)));
  }

  db.accounts.push(acc);
  renumber(db);
  save(db);
  // 返回重排后的实例（id 可能变化）
  return db.accounts.find((a) => a.uid === acc.uid) || acc;
}

async function refreshAccount(id) {
  const db = load();
  const acc = db.accounts.find((a) => a.id === id);
  if (!acc) throw new Error('账号不存在');
  const q = await quotaInfo(acc.cookie, acc.ua);
  acc.quota = { limit: q.limit, count: q.count, left: q.left, point: q.point };
  acc.lastCheckAt = new Date().toISOString();
  acc.lastError = q.ok ? '' : (q.message || 'code=' + q.code);
  save(db);
  return acc;
}

async function refreshAll() {
  const db = load();
  const out = [];
  for (const acc of db.accounts) {
    if (acc.disabled) { out.push(acc); continue; }
    try {
      const q = await quotaInfoWithRetry(acc.cookie, acc.ua);
      acc.quota = { limit: q.limit, count: q.count, left: q.left, point: q.point };
      acc.lastError = q.code === 1 ? '频控中，稍后重试' : (q.ok ? '' : (q.message || 'code=' + q.code));
    } catch (e) {
      acc.lastError = e.message;
    }
    acc.lastCheckAt = new Date().toISOString();
    out.push(acc);
    await new Promise((r) => setTimeout(r, 3500)); // 实测 1s 即触发频控，留足间隔
  }
  save(db);
  return out;
}

function listAccounts() {
  const db = load();
  return db.accounts.map((a) => ({
    id: a.id, label: a.label, account: a.account, uid: a.uid,
    vip: a.vip, quota: a.quota, disabled: a.disabled,
    hasPassword: !!a.password,
    lastCheckAt: a.lastCheckAt, lastError: a.lastError || '',
    createdAt: a.createdAt,
  }));
}

function getAccount(id) {
  return load().accounts.find((a) => a.id === id);
}

function removeAccount(id) {
  const db = load();
  const i = db.accounts.findIndex((a) => a.id === id);
  if (i < 0) throw new Error('账号不存在');
  const [acc] = db.accounts.splice(i, 1);
  renumber(db);
  save(db);
  return acc;
}

/**
 * 重排 ID：删除账号后把 id 压成 1..N，消除空洞
 * 否则删掉 3 再加新账号会变成 4，容易误认为「有四个账号」。
 * 按 createdAt 排序保证顺序稳定，同日创建的按原 id。
 */
function renumber(db) {
  db.accounts.sort((a, b) => {
    const ta = Date.parse(a.createdAt || 0) || 0;
    const tb = Date.parse(b.createdAt || 0) || 0;
    if (ta !== tb) return ta - tb;
    return (a.id || 0) - (b.id || 0);
  });
  db.accounts.forEach((a, i) => { a.id = i + 1; });
  db.seq = db.accounts.length + 1;
  return db;
}

function toggleAccount(id, disabled) {
  const db = load();
  const acc = db.accounts.find((a) => a.id === id);
  if (!acc) throw new Error('账号不存在');
  acc.disabled = !!disabled;
  save(db);
  return acc;
}

/** 为已存账号补设密码（用于账号池里只有 cookie 的账号） */
async function setPassword(id, password) {
  const db = load();
  const acc = db.accounts.find((a) => a.id === id);
  if (!acc) throw new Error('账号不存在');
  if (!password) throw new Error('密码不能为空');

  // 先验证密码能登录，避免存错
  const r = await login(acc.account, password);
  const info = await sessionInfo(r.cookie, r.ua);
  if (acc.uid && info.uid && acc.uid !== info.uid) {
    throw new Error(`账号不匹配：该密码登录后 uid=${info.uid}，与原账号 uid=${acc.uid} 不一致`);
  }

  acc.password = password;
  acc.cookie = r.cookie;
  acc.ua = r.ua;
  acc.lastCheckAt = new Date().toISOString();
  acc.lastError = '';
  acc.quota = { ...acc.quota, point: info.balance };
  save(db);
  return acc;
}

function updateQuota(id, patch) {
  const db = load();
  const acc = db.accounts.find((a) => a.id === id);
  if (!acc) return;
  acc.quota = { ...acc.quota, ...patch };
  acc.lastCheckAt = new Date().toISOString();
  save(db);
}

module.exports = {
  load, save, login, sessionInfo, quotaInfo, quotaInfoWithRetry,
  addAccount, refreshAccount, refreshAll, listAccounts, getAccount,
  removeAccount, toggleAccount, updateQuota, setPassword,
};
