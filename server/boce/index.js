'use strict';
const express = require('express');
const path = require('path');
const accounts = require('./accounts');
const { runProbe } = require('./probe');
const { fetchResult } = require('./boce');
const history = require('./history');
const daily = require('./daily');
const auth = require('./auth');

const app = express();
const PORT = process.env.PORT || 8899;

app.set('trust proxy', 1);
// 页面在 /boce/ 下用相对路径请求 api/xxx，浏览器会带上 /boce 前缀；
// 统一削掉，保证容器直接访问（不经 nginx 改写）也能命中同一套接口。
app.use((req, res, next) => {
  if (req.url.startsWith('/boce/api/')) req.url = req.url.slice('/boce'.length);
  next();
});
app.use(express.json({ limit: '2mb' }));
// 静态页随镜像发布（BOCE_WEB_DIR=/app/web），本地 npm start 时回退到仓库里的 boce/
app.use(express.static(process.env.BOCE_WEB_DIR || path.join(__dirname, '..', '..', 'boce')));

/* ---------------- 鉴权 ---------------- */
/** 存活检查：供容器部署后的健康探测使用，不需要口令 */
app.get('/api/health', (req, res) => res.json({ ok: true, uptime: Math.round(process.uptime()) }));

/** 口令换会话，首次使用自动建空间 */
app.post('/api/login', auth.login);
app.post('/api/logout', auth.logout);

// 以下所有 /api 接口都要求已登录，并把请求绑定到对应空间
app.use('/api', auth.guard);

app.get('/api/me', (req, res) => {
  res.json({ ok: true, spaceId: req.sid.slice(0, 8), needInvite: auth.hasInvite() });
});

const wrap = (fn) => (req, res) => {
  Promise.resolve(fn(req, res)).catch((e) => {
    res.status(500).json({ ok: false, error: e.message, code: e.code });
  });
};

/* ---------------- 账号 ---------------- */
app.get('/api/accounts', wrap(async (req, res) => {
  res.json({ ok: true, accounts: accounts.listAccounts() });
}));

app.post('/api/accounts', wrap(async (req, res) => {
  const { account, password, cookie, label } = req.body || {};
  const acc = await accounts.addAccount({ account, password, cookie, label });
  res.json({
    ok: true,
    account: {
      id: acc.id, label: acc.label, account: acc.account, uid: acc.uid,
      vip: acc.vip, quota: acc.quota,
    },
  });
}));

app.post('/api/accounts/:id/refresh', wrap(async (req, res) => {
  const acc = await accounts.refreshAccount(+req.params.id);
  res.json({ ok: true, account: { id: acc.id, quota: acc.quota, lastError: acc.lastError } });
}));

app.post('/api/accounts/refresh-all', wrap(async (req, res) => {
  const list = await accounts.refreshAll();
  res.json({ ok: true, count: list.length });
}));

app.delete('/api/accounts/:id', wrap(async (req, res) => {
  accounts.removeAccount(+req.params.id);
  res.json({ ok: true });
}));

/** 补设密码（用于只存了 cookie 的账号，启用每日自动领波点） */
app.post('/api/accounts/:id/password', wrap(async (req, res) => {
  const { password } = req.body || {};
  const acc = await accounts.setPassword(+req.params.id, password);
  res.json({ ok: true, account: { id: acc.id, label: acc.label, hasPassword: true } });
}));

/** 每日领取波点状态 */
app.get('/api/daily/status', wrap(async (req, res) => {
  res.json(daily.status());
}));

/** 手动触发领取 */
app.post('/api/daily/claim', wrap(async (req, res) => {
  const { force, ids } = req.body || {};
  const r = await daily.claimAll({ force: !!force, ids });
  res.json(r);
}));

/** 领取历史 */
app.get('/api/daily/history', wrap(async (req, res) => {
  res.json({ days: daily.history(Number(req.query.limit) || 14) });
}));

app.post('/api/accounts/:id/toggle', wrap(async (req, res) => {
  const acc = accounts.toggleAccount(+req.params.id, req.body.disabled);
  res.json({ ok: true, disabled: acc.disabled });
}));

/* ---------------- 拨测 ---------------- */
const jobs = new Map();
let jobSeq = 1;

app.post('/api/probe', wrap(async (req, res) => {
  const { hosts, isp, nodeType, type } = req.body || {};
  const list = (Array.isArray(hosts) ? hosts : String(hosts || '').split(/[\n,]/))
    .map((s) => String(s).trim()).filter(Boolean);
  if (!list.length) return res.status(400).json({ ok: false, error: '请填写至少一个域名' });
  if (list.length > 200) return res.status(400).json({ ok: false, error: '单次最多 200 个域名' });

  const jobId = 'job' + (jobSeq++);
  const events = [];
  const job = { id: jobId, createdAt: Date.now(), events, result: null, done: false };
  jobs.set(jobId, job);

  // 异步执行
  runProbe({
    hosts: list,
    isp: isp && isp.length ? isp : ['1', '2', '3'],
    nodeType: nodeType || '4',
    type: type || 'http',
    onEvent: (e) => {
      events.push(e);
      if (e.type === 'done') {
        job.result = e.result;
        job.done = true;
        // 成功才入库，失败不占历史
        if (e.result && e.result.ok) {
          try {
            e.result.source = 'probe';
            job.historyId = history.save(e.result).id;
          } catch (err) { console.error('历史写入失败', err.message); }
        }
      }
    },
  }).catch((e) => {
    job.error = e.message;
    job.done = true;
    events.push({ type: 'error', msg: e.message });
  });

  res.json({ ok: true, jobId });
}));

/** 轮询进度 */
app.get('/api/probe/:jobId', wrap(async (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ ok: false, error: 'job 不存在' });
  const since = +(req.query.since || 0);
  res.json({
    ok: true,
    done: job.done,
    error: job.error || null,
    events: job.events.slice(since),
    nextCursor: job.events.length,
    result: job.done ? job.result : null,
  });
}));

/** 导入已有结果页（公开，不耗额度） */
app.post('/api/import', wrap(async (req, res) => {
  const { url } = req.body || {};
  const m = String(url || '').match(/(\d{8}_[a-f0-9]{32})/i) || String(url || '').trim().match(/^(\d{8}_[a-f0-9]{32})$/i);
  if (!m) return res.status(400).json({ ok: false, error: '无法从链接解析出 time_id' });
  const r = await fetchResult(m[1], { type: 'http' });
  const { aggregate } = require('./probe');
  const stat = aggregate(r.rows, []);

  // 导入的结果也入历史，标记 source=import
  const hosts = [...new Set(r.rows.map((x) => (x.host || x.domain || '').replace(/^https?:\/\//, '')))].filter(Boolean);
  const perHost = hosts.map((h) => {
    const rows = r.rows.filter((x) => (x.host || x.domain || '').replace(/^https?:\/\//, '') === h);
    return { host: h, rows, stat: aggregate(rows, []), timeId: m[1], resultUrl: r.url };
  });
  let historyId = null;
  try {
    historyId = history.save({
      perHost: perHost.length ? perHost : [{ host: hosts[0] || '未知', rows: r.rows, stat, timeId: m[1], resultUrl: r.url }],
      nodeType: '4', isp: [], account: null, ok: true, source: 'import',
    }).id;
  } catch {}

  res.json({ ok: true, timeId: m[1], rows: r.rows, url: r.url, stat, historyId });
}));

/* ---------------- 历史记录 ---------------- */
app.get('/api/history', wrap(async (req, res) => {
  const { host, limit, offset } = req.query;
  res.json({ ok: true, ...history.list({ host, limit: +(limit || 50), offset: +(offset || 0) }) });
}));

app.get('/api/history/:id', wrap(async (req, res) => {
  const d = history.get(req.params.id);
  if (!d) return res.status(404).json({ ok: false, error: '记录不存在' });
  res.json({ ok: true, record: d });
}));

app.delete('/api/history/:id', wrap(async (req, res) => {
  const ok = history.remove(req.params.id);
  res.json({ ok });
}));

/** 导出单条记录为 CSV */
app.get('/api/history/:id/csv', wrap(async (req, res) => {
  const d = history.get(req.params.id);
  if (!d) return res.status(404).json({ ok: false, error: '记录不存在' });

  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [];
  lines.push(['域名', '节点名称', '运营商', '省份', '状态码', 'DNS(s)', '连接(s)', '首包(s)', '总耗时(s)', '落地IP', '检测时间'].join(','));
  for (const h of d.perHost || []) {
    for (const r of h.rows || []) {
      lines.push([
        h.host, r.node_name, r.isp_name, r.province_name, r.httpCode,
        r.dnsCost, r.connCost, r.firstCost, r.totalCost, r.ip, d.createdAt,
      ].map(esc).join(','));
    }
  }
  const name = `boce-${(d.hostNames || ['result']).join('_')}-${req.params.id}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
  res.send('\uFEFF' + lines.join('\n'));   // BOM 保证 Excel 正确识别 UTF-8
}));

/** 导出历史汇总为 CSV */
app.get('/api/export/summary', wrap(async (req, res) => {
  const { host } = req.query;
  const { items } = history.list({ host, limit: 1000 });
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [['时间', '域名', '节点数', '平均(s)', '最快(s)', '最慢(s)', '成功节点', '可用率', '来源', '结果页'].join(',')];
  for (const it of items) {
    for (const h of it.hosts) {
      const rate = h.count ? ((h.ok / h.count) * 100).toFixed(1) + '%' : '-';
      lines.push([it.createdAt, h.host, h.count, h.avg, h.min, h.max, h.ok, rate, it.source, h.resultUrl].map(esc).join(','));
    }
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="boce-history.csv"');
  res.send('\uFEFF' + lines.join('\n'));
}));

app.delete('/api/history', wrap(async (req, res) => {
  const { source } = req.query;
  const n = source ? history.clearBySource(source.split(',')) : history.clear();
  res.json({ ok: true, removed: n });
}));

app.get('/api/trend', wrap(async (req, res) => {
  const { host, limit } = req.query;
  if (!host) return res.status(400).json({ ok: false, error: '缺少 host' });
  res.json({ ok: true, rows: history.trend(host, +(limit || 30)) });
}));

/* 历史任务列表 */
app.get('/api/jobs', wrap(async (req, res) => {
  res.json({
    ok: true,
    jobs: [...jobs.values()].map((j) => ({
      id: j.id, createdAt: j.createdAt, done: j.done,
      hosts: j.result ? j.result.hosts : [],
      ok: j.result ? j.result.ok : null,
    })).sort((a, b) => b.createdAt - a.createdAt).slice(0, 30),
  });
}));

app.listen(PORT, () => {
  daily.startScheduler();
  console.log(`\n  BOCE 拨测工具已启动: http://127.0.0.1:${PORT}\n`);
});
