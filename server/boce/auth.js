'use strict';
/**
 * 访问口令鉴权
 *
 * 没有注册流程：用户输入任意口令，口令经 scrypt 派生出稳定的空间 ID，
 * 首次使用即创建空间，之后同一口令回到同一空间。
 *
 * 安全边界：
 *  - 口令只用于派生空间 ID 与门禁，不落盘、不写日志
 *  - 会话是 HMAC 签名 cookie，无状态，重启不掉线
 *  - 口令 ≥ MIN_LEN 位；可选 BOCE_INVITE 邀请码拦截陌生访客
 *  - 单 IP 登录失败与新建空间均限流，防止暴力枚举与刷盘
 */
const crypto = require('crypto');
const space = require('./space');

const SECRET = process.env.BOCE_SECRET || '';
const INVITE = process.env.BOCE_INVITE || '';
const MIN_LEN = 8;
const SESSION_DAYS = 30;
const COOKIE = 'boce_sess';

if (!SECRET) {
  console.warn('[auth] 未设置 BOCE_SECRET，会话密钥将每次启动随机生成（重启后全部下线）');
}
const KEY = SECRET || crypto.randomBytes(32).toString('hex');
/**
 * 固定盐：空间 ID 只由口令决定。
 * 若把盐绑到 BOCE_SECRET 上，一旦轮换密钥，所有口令算出的空间 ID 都会变，
 * 数据还在盘上却谁也进不去。
 */
const SALT = 'boce-space-v1';

/** 口令 → 空间 ID（稳定、不可逆、不暴露口令特征） */
function spaceIdOf(password) {
  return crypto
    .scryptSync(String(password), SALT, 16, { N: 16384, r: 8, p: 1 })
    .toString('hex');
}

/**
 * 空间级加密密钥：用于加密各空间下的小体量凭据（如 Nacos 操作令牌）。
 * 由 BOCE_SECRET 派生，且不含随机成分——否则重启后密钥变化、已存密文全部解不开。
 */
function spaceKey(sid) {
  return crypto.scryptSync(KEY, 'nacos-config:' + sid, 32, { N: 16384, r: 8, p: 1 });
}

function sign(payload) {
  return crypto.createHmac('sha256', KEY).update(payload).digest('base64url');
}

function issueCookie(sid) {
  const exp = Date.now() + SESSION_DAYS * 86400_000;
  const payload = `${sid}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

/** 校验 cookie，返回 sid 或 null */
function verifyCookie(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const parts = raw.split('.');
  if (parts.length !== 3) return null;
  const [sid, exp, sig] = parts;
  const expected = sign(`${sid}.${exp}`);
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  if (!/^[a-f0-9]{32}$/.test(sid)) return null;
  if (Number(exp) < Date.now()) return null;
  return sid;
}

function readCookie(req) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    if (part.slice(0, i).trim() === COOKIE) return part.slice(i + 1).trim();
  }
  return null;
}

function isSecure(req) {
  return req.secure || req.headers['x-forwarded-proto'] === 'https';
}

function setSessionCookie(req, res, sid) {
  const attrs = [
    `${COOKIE}=${issueCookie(sid)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_DAYS * 86400}`,
  ];
  if (isSecure(req)) attrs.push('Secure');
  res.setHeader('Set-Cookie', attrs.join('; '));
}

function clearSessionCookie(req, res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

/* ---------------- 限流 ---------------- */
const hits = new Map();          // ip -> { fail, failUntil, created, day }

function bucket(ip) {
  const day = new Date().toISOString().slice(0, 10);
  let b = hits.get(ip);
  if (!b || b.day !== day) { b = { day, fail: 0, failUntil: 0, created: 0 }; hits.set(ip, b); }
  return b;
}

function clientIp(req) {
  // 不能用 X-Forwarded-For：nginx 是「追加」真实 IP，第一段永远是客户端伪造的。
  // express 已按 trust proxy 把可信代理链解完，直接用它算好的。
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/* ---------------- 中间件 ---------------- */
/** 未登录一律 401，前端据此弹登录框 */
function guard(req, res, next) {
  const sid = verifyCookie(readCookie(req));
  if (!sid) return res.status(401).json({ ok: false, needAuth: true, error: '请先输入访问口令' });
  req.sid = sid;
  space.ensure(sid);
  space.run(sid, next);
}

/** 登录：口令即身份，首次使用自动建空间 */
function login(req, res) {
  const { password, invite } = req.body || {};
  const pwd = String(password || '');
  const ip = clientIp(req);
  const b = bucket(ip);

  if (b.failUntil > Date.now()) {
    const wait = Math.ceil((b.failUntil - Date.now()) / 1000);
    return res.status(429).json({ ok: false, error: `尝试过于频繁，请 ${wait} 秒后再试` });
  }

  const reject = (msg) => {
    b.fail += 1;
    if (b.fail >= 5) { b.failUntil = Date.now() + 10 * 60_000; b.fail = 0; }
    return res.status(401).json({ ok: false, error: msg });
  };

  if (pwd.length < MIN_LEN) return reject(`访问口令至少 ${MIN_LEN} 位`);

  const sid = spaceIdOf(pwd);
  const isNew = !space.exists(sid);

  // 邀请码只拦「陌生口令新建空间」。已存在的空间只要口令对就放行：
  // sid 是口令的慢哈希，能算出一个已存在的 sid 本身就已证明口令正确，
  // 这时再要邀请码既防不了刷（空间早建好了），又凭空多一道必填。
  if (INVITE && isNew && String(invite || '') !== INVITE) return reject('邀请码不正确');

  if (isNew) {
    if (b.created >= 3) return reject('今日新建空间次数已达上限，请明天再试');
    b.created += 1;
  }

  space.ensure(sid);
  setSessionCookie(req, res, sid);
  b.fail = 0;

  res.json({ ok: true, spaceId: sid.slice(0, 8), isNew, needInvite: !!INVITE });
}

function logout(req, res) {
  clearSessionCookie(req, res);
  res.json({ ok: true });
}

module.exports = {
  guard, login, logout, spaceIdOf, spaceKey,
  MIN_LEN, hasInvite: () => !!INVITE,
};
