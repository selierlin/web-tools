'use strict';
/**
 * Nacos 管理页的配置数据（服务器地址 / namespace / actuator 操作令牌）
 *
 * 以前这些值硬编码在 Nacos 服务管理.html 里，页面源码即配置，等于对
 * 每个访客公开了内网地址和操作令牌。现在改成登录后由后端下发：
 *
 *  - 配置按访问口令分空间，存在 data/spaces/<sid>/nacos.json
 *  - stateToken 用 BOCE_SECRET 派生的空间密钥加密落盘，不存明文
 *  - 首次登录时若空间内还没有配置，用 env 里的 NACOS_SERVER / NACOS_NAMESPACES
 *    种子初始化一次；stateToken 不提供站点级默认值，必须由用户自己填
 *  - 落盘用 0600，避免同机其他用户读走密文
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const space = require('./space');
const { spaceKey } = require('./auth');

const fileOf = () => path.join(space.current(), 'nacos.json');

/** env 里的初始配置（首次进空间时写入，之后以用户修改的为准） */
function seed() {
  let namespaces = [];
  const raw = process.env.NACOS_NAMESPACES || '';
  if (raw.trim()) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        namespaces = arr
          .filter((n) => n && (n.namespace !== undefined))
          .map((n) => ({
            namespace: String(n.namespace || ''),
            namespaceShowName: String(n.namespaceShowName || n.namespace || 'public'),
          }));
      }
    } catch (e) {
      console.warn('[nacos] NACOS_NAMESPACES 不是合法 JSON，已忽略:', e.message);
    }
  }
  return {
    server: (process.env.NACOS_SERVER || '').trim(),
    namespaces,
  };
}

function empty() {
  return { server: '', namespaces: [], stateTokenEnc: '', updatedAt: null };
}

function readRaw() {
  const f = fileOf();
  if (!fs.existsSync(f)) return null;
  try {
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (!Array.isArray(j.namespaces)) j.namespaces = [];
    return j;
  } catch {
    return null;
  }
}

function writeRaw(data) {
  const dir = space.current();
  fs.mkdirSync(dir, { recursive: true });
  const tmp = fileOf() + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, fileOf());
}

/** 读取（没有就用 env 种子建一份），返回明文结构 */
function load(sid) {
  let data = readRaw();
  if (!data) {
    const s = seed();
    data = {
      server: s.server,
      namespaces: s.namespaces,
      // stateToken 不做站点默认值，只接受用户在页面上填
      stateTokenEnc: '',
      updatedAt: new Date().toISOString(),
    };
    try { writeRaw(data); } catch (e) { console.error('[nacos] 写入初始配置失败:', e.message); }
  }
  return {
    server: data.server || '',
    namespaces: Array.isArray(data.namespaces) ? data.namespaces : [],
    stateToken: data.stateTokenEnc ? decrypt(sid, data.stateTokenEnc) : '',
    updatedAt: data.updatedAt || null,
  };
}

/* ---------------- 令牌加解密（AES-256-GCM） ---------------- */
// scrypt 派生一次约几十毫秒，按 sid 缓存，避免每个请求都算
const keyCache = new Map();
function keyOf(sid) {
  let k = keyCache.get(sid);
  if (!k) { k = spaceKey(sid); keyCache.set(sid, k); }
  return k;
}

function encrypt(sid, plain) {
  const key = keyOf(sid);
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([c.update(String(plain), 'utf8'), c.final()]);
  // iv.tag.cipher，都 base64url，方便直接塞进 JSON
  return [iv, c.getAuthTag(), enc].map((b) => b.toString('base64url')).join('.');
}

function decrypt(sid, packed) {
  try {
    const [iv, tag, enc] = String(packed || '').split('.');
    if (!iv || !tag || !enc) return '';
    const d = crypto.createDecipheriv('aes-256-gcm', keyOf(sid), Buffer.from(iv, 'base64url'));
    d.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([d.update(Buffer.from(enc, 'base64url')), d.final()]).toString('utf8');
  } catch {
    return '';   // 密钥轮换过就解不开，当作没配
  }
}

/* ---------------- HTTP handlers ---------------- */

/** 下发当前空间的配置。token 明文只在已登录会话里返回，由前端存内存 */
function getConfig(req, res) {
  const c = load(req.sid);
  res.json({
    ok: true,
    config: {
      server: c.server,
      namespaces: c.namespaces,
      stateToken: c.stateToken,
      hasToken: !!c.stateToken,
      updatedAt: c.updatedAt,
    },
  });
}

/**
 * 保存配置。三个字段都是可选的：
 *  - stateToken 传空字符串表示清除
 *  - 传 undefined（不传该键）表示保持原值
 */
function saveConfig(req, res) {
  const body = req.body || {};
  const old = load(req.sid);
  const next = {
    server: body.server !== undefined ? String(body.server || '').trim() : old.server,
    namespaces: body.namespaces !== undefined
      ? (Array.isArray(body.namespaces) ? body.namespaces : [])
        .filter((n) => n && n.namespace !== undefined)
        .map((n) => ({
          namespace: String(n.namespace || ''),
          namespaceShowName: String(n.namespaceShowName || n.namespace || 'public'),
        }))
      : old.namespaces,
    stateTokenEnc: old.stateToken ? encrypt(req.sid, old.stateToken) : '',
    updatedAt: new Date().toISOString(),
  };

  if (body.stateToken !== undefined) {
    const t = String(body.stateToken || '').trim();
    next.stateTokenEnc = t ? encrypt(req.sid, t) : '';
  }

  writeRaw(next);
  res.json({
    ok: true,
    config: {
      server: next.server,
      namespaces: next.namespaces,
      hasToken: !!next.stateTokenEnc,
      updatedAt: next.updatedAt,
    },
  });
}

module.exports = { getConfig, saveConfig };
