'use strict';
/**
 * 每日自动领取波点
 *
 * 机制（逆向前端 index_v5.js / user_app.js 得出）：
 *   boce 没有签到按钮，也没有 checkin/receive 接口。
 *   波点在 POST /apiHtml/login 成功时由服务端自动发放。
 *   member 接口返回 give.today_point / give.tomorrow_point 描述当日额度。
 *   所以「领取波点」= 每天调一次 login。
 *
 * 约束：
 *   - 同一账号同一天重复登录不会重复发放（服务端按 账号+日期 去重）
 *   - 必须存明文密码才能重建 session；只存 cookie 的账号只能被动等待失效
 *   - 每日 00:05 触发；也可手动触发
 */
const fs = require('fs');
const path = require('path');
const accounts = require('./accounts');
const space = require('./space');

/** 数据目录随当前访问口令的空间变化 */
const dataDir = () => space.current();
const logFile = () => path.join(dataDir(), 'daily-claim.json');
const historyDir = () => path.join(dataDir(), 'claim-history');

/** 本地日期 yyyy-mm-dd */
function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function ensureDirs() {
  if (!fs.existsSync(dataDir())) fs.mkdirSync(dataDir(), { recursive: true });
  if (!fs.existsSync(historyDir())) fs.mkdirSync(historyDir(), { recursive: true });
}

/** 读取当日领取状态 { date, results: { <uid>: {...} } } */
function loadState() {
  ensureDirs();
  if (!fs.existsSync(logFile())) return { date: today(), results: {} };
  try {
    const s = JSON.parse(fs.readFileSync(logFile(), 'utf8'));
    if (s.date !== today()) return { date: today(), results: {} }; // 跨天自动重置
    if (!s.results) s.results = {};
    return s;
  } catch {
    return { date: today(), results: {} };
  }
}

function saveState(s) {
  ensureDirs();
  const tmp = logFile() + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(s, null, 2));
  fs.renameSync(tmp, logFile());
}

/** 追加一条领取历史（按日期分文件，便于追溯） */
function appendHistory(record) {
  ensureDirs();
  const file = path.join(historyDir(), today() + '.json');
  let arr = [];
  if (fs.existsSync(file)) {
    try { arr = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { arr = []; }
  }
  if (!Array.isArray(arr)) arr = [];
  arr.push(record);
  fs.writeFileSync(file, JSON.stringify(arr, null, 2));
}

/**
 * 对单个账号执行「登录领波点」
 * @returns {{ok:boolean, uid, label, action, balance, todayPoint, tomorrowPoint, error?}}
 */
async function claimOne(acc) {
  const base = {
    uid: acc.uid,
    label: acc.label,
    account: acc.account,
    at: new Date().toISOString(),
  };

  // 1. 先看当前 session 与余额
  let before = null;
  try {
    before = await accounts.sessionInfo(acc.cookie, acc.ua);
  } catch (e) {
    before = { error: e.message, code: e.code };
  }

  // 2. 没有密码 → 只能报告状态，无法主动重建 session
  if (!acc.password) {
    if (before && !before.error) {
      return {
        ...base, ok: true, action: 'observed',
        balance: before.balance,
        todayPoint: before.todayPoint,
        tomorrowPoint: before.tomorrowPoint,
        note: 'session 有效，但未存密码，无法主动登录领奖',
      };
    }
    return {
      ...base, ok: false, action: 'no-password',
      error: '未存储密码，session 已失效（' + (before?.error || '未知') + '）',
    };
  }

  // 3. 有密码 → 重新登录领波点
  try {
    const r = await accounts.login(acc.account, acc.password);
    const after = await accounts.sessionInfo(r.cookie, r.ua);

    // 回写新 cookie / ua / 余额
    const db = accounts.load();
    const target = db.accounts.find((a) => a.id === acc.id);
    if (target) {
      target.cookie = r.cookie;
      target.ua = r.ua;
      target.quota = { ...target.quota, point: after.balance };
      target.lastCheckAt = new Date().toISOString();
      target.lastError = '';
      accounts.save(db);
    }

    return {
      ...base, ok: true, action: 'login',
      balance: after.balance,
      balanceBefore: before && !before.error ? before.balance : null,
      todayPoint: after.todayPoint,
      tomorrowPoint: after.tomorrowPoint,
      gained: before && !before.error ? after.balance - before.balance : null,
    };
  } catch (e) {
    // 登录失败：可能密码错误或今日已领过上限
    return {
      ...base, ok: false, action: 'login-failed',
      error: e.message,
      balance: before && !before.error ? before.balance : null,
    };
  }
}

/**
 * 执行每日领取
 * @param {{force?:boolean, ids?:number[]}} opts
 */
async function claimAll(opts = {}) {
  const db = accounts.load();
  const list = db.accounts.filter((a) => {
    if (a.disabled) return false;
    if (opts.ids && opts.ids.length) return opts.ids.includes(a.id);
    return true;
  });

  const state = loadState();
  const results = [];
  const skipped = [];

  for (const acc of list) {
    // 今天已经成功领过就跳过（除非 force）
    const prev = state.results[acc.uid];
    if (!opts.force && prev && prev.ok && prev.action === 'login') {
      skipped.push({ uid: acc.uid, label: acc.label, reason: '今日已领取' });
      continue;
    }
    let r = await claimOne(acc);
    // 登录被频控时退避重试一次
    if (!r.ok && r.error && /频繁|稍后/.test(r.error)) {
      await new Promise((res) => setTimeout(res, 6000));
      r = await claimOne(acc);
      r.retried = true;
    }
    r.id = acc.id;
    results.push(r);
    state.results[acc.uid] = { ok: r.ok, action: r.action, at: r.at, error: r.error || '' };
    saveState(state);
    appendHistory(r);
    await new Promise((res) => setTimeout(res, 4000)); // 实测 1s 即触发频控
  }

  saveState(state);
  return {
    date: today(),
    claimed: results.filter((r) => r.ok && r.action === 'login').length,
    observed: results.filter((r) => r.action === 'observed').length,
    failed: results.filter((r) => !r.ok).length,
    skipped,
    results,
  };
}

/** 当日状态摘要（供 UI 展示） */
function status() {
  const state = loadState();
  const db = accounts.load();
  return {
    date: state.date,
    accounts: db.accounts.map((a) => {
      const r = state.results[a.uid] || null;
      return {
        id: a.id,
        uid: a.uid,
        label: a.label,
        hasPassword: !!a.password,
        point: a.quota?.point ?? 0,
        claimedToday: !!(r && r.ok && r.action === 'login'),
        lastAction: r ? r.action : null,
        lastError: r ? r.error : '',
        at: r ? r.at : null,
      };
    }),
  };
}

/** 领取历史（最近 N 天） */
function history(limit = 14) {
  ensureDirs();
  const files = fs.readdirSync(historyDir())
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort()
    .reverse()
    .slice(0, limit);
  const out = [];
  for (const f of files) {
    try {
      const arr = JSON.parse(fs.readFileSync(path.join(historyDir(), f), 'utf8'));
      out.push({ date: f.replace('.json', ''), records: Array.isArray(arr) ? arr : [] });
    } catch {}
  }
  return out;
}

/* ---------------- 定时器 ---------------- */
let timer = null;
let lastRun = null;

/** 启动每日定时：每天 00:05 自动登录领波点 */
function startScheduler() {
  stopScheduler();
  const TARGET_H = 0, TARGET_M = 5;

  const schedule = () => {
    const now = new Date();
    const next = new Date(now);
    next.setHours(TARGET_H, TARGET_M, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    const delay = next - now;
    timer = setTimeout(async () => {
      // 遍历所有空间，各自独立领取
      const spaces = space.list();
      let claimed = 0, failed = 0;
      for (const sid of spaces) {
        try {
          const r = await space.run(sid, () => claimAll());
          claimed += r.claimed;
        } catch (e) {
          failed += 1;
          console.error(`[daily] 空间 ${sid.slice(0, 8)} 领取失败`, e.message);
        }
      }
      lastRun = { at: new Date().toISOString(), spaces: spaces.length, claimed, failed };
      console.log(`[daily] 自动领取完成：${spaces.length} 个空间，${claimed} 个账号${failed ? `，${failed} 个空间失败` : ''}`);
      schedule(); // 递归排下一次
    }, delay);
    if (timer.unref) timer.unref();
    console.log(`[daily] 下次自动领取: ${next.toLocaleString('zh-CN')}`);
  };

  schedule();
}

function stopScheduler() {
  if (timer) { clearTimeout(timer); timer = null; }
}

module.exports = {
  claimAll, claimOne, status, history,
  startScheduler, stopScheduler,
  get lastRun() { return lastRun; },
};
