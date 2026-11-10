'use strict';

/* ================= 工具 ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function toast(msg, type = '') {
  let wrap = $('.toast-wrap');
  if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = '.3s'; setTimeout(() => el.remove(), 320); }, 2800);
}

/* 接口用相对路径：部署在 /boce/ 下与本地根路径都能命中同一个后端 */
const rel = (url) => String(url).replace(/^\//, '');

async function api(url, opts = {}) {
  const res = await fetch(rel(url), {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 401) {
    const j = await res.json().catch(() => null);
    // 登录接口的 401 是口令/邀请码错误，必须原样透出原因；
    // 其它接口的 401 才是「未登录」，统一弹登录框。
    if (/\/api\/login$/.test(String(url))) throw new Error(j?.error || '登录失败');
    showLogin(true);
    throw new Error('请先输入访问口令');
  }
  const j = await res.json().catch(() => ({ ok: false, error: '响应解析失败' }));
  if (!j.ok && j.error) throw new Error(j.error);
  return j;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** 手机号与邮箱中间打码，避免投屏/截图泄露完整账号 */
const maskAccount = (s) => {
  if (!s) return '';
  if (s.includes('@')) {
    const [name, domain] = s.split('@');
    return name.slice(0, 2) + '***@' + domain;
  }
  return s.replace(/^(\d{3})\d+(\d{4})/, '$1****$2');
};
const fmt = (v, d = 2) => (v == null || isNaN(v) ? '-' : Number(v).toFixed(d));
const pct = (a, b) => (b ? (a / b) * 100 : 0);

/* ================= 状态 ================= */
const state = {
  accounts: [],
  nodeType: '4',
  polling: null,
};

/* ================= 账号 ================= */
async function loadAccounts() {
  const r = await api('/api/accounts');
  state.accounts = r.accounts || [];
  renderAccounts();
  renderQuotaSummary();
}

function quotaClass(left, limit) {
  if (!limit) return 'zero';
  const p = left / limit;
  if (left <= 0) return 'zero';
  if (p < 0.35) return 'low';
  return 'ok';
}

function renderAccounts() {
  const box = $('#accountList');
  const q = state.accQuery || '';
  const list = q
    ? state.accounts.filter((a) => (a.label + ' ' + (a.account || '')).toLowerCase().includes(q))
    : state.accounts;

  const cntEl = $('#accCount');
  if (cntEl) cntEl.textContent = state.accounts.length;

  if (!state.accounts.length) {
    box.innerHTML = '<div class="empty">暂无账号，点击下方添加</div>';
    return;
  }
  if (!list.length) {
    box.innerHTML = '<div class="empty">没有匹配的账号</div>';
    return;
  }
  box.innerHTML = list.map((a) => {
    const q = a.quota || {};
    const left = q.left ?? 0, limit = q.limit ?? 0;
    const cls = quotaClass(left, limit);
    const barW = limit ? Math.min(100, pct(left, limit)) : 0;
    const barColor = cls === 'zero' ? 'var(--bad)' : cls === 'low' ? 'var(--orange)' : 'var(--good)';
    const acct = maskAccount(a.account);
    return `
    <div class="acc-card ${a.disabled ? 'disabled' : ''}" data-id="${a.id}" title="${esc(acct)}">
      <div class="acc-row1">
        <span class="acc-name">${esc(a.label)}</span>
        <span class="acc-left ${cls}">${left}<i>/${limit}</i></span>
        ${a.vip ? '<span class="acc-tag vip">VIP</span>' : ''}
      </div>
      <div class="acc-quota-bar"><div class="acc-bar-inner" style="width:${barW}%;background:${barColor}"></div></div>
      <div class="acc-row2">
        <span class="acc-sub">${esc(acct || ('uid ' + (a.uid ?? '-')))}</span>
        <span class="acc-sub">${q.point ?? 0} 波点</span>
        <span class="acc-ops">
          <button data-act="refresh" data-id="${a.id}" title="刷新额度（消耗 1 次拨测）">↻</button>
          <button data-act="toggle" data-id="${a.id}" title="${a.disabled ? '启用' : '停用'}">${a.disabled ? '○' : '●'}</button>
          <button data-act="del" data-id="${a.id}" title="删除">✕</button>
        </span>
      </div>
      ${a.lastError ? `<div class="acc-err">${esc(a.lastError)}</div>` : ''}
    </div>`;
  }).join('');

  $$('#accountList .acc-ops button').forEach((b) => {
    b.addEventListener('click', async () => {
      const id = +b.dataset.id, act = b.dataset.act;
      try {
        if (act === 'refresh') {
          const acc = state.accounts.find((x) => x.id === id);
          const left = acc?.quota?.left;
          const tip = `刷新额度需要向 boce 发起一次探测，会消耗 1 次拨测配额`
            + (left == null ? '' : `（该账号今日剩余 ${left} 次）`);
          if (!confirm(tip + '。\n\n确定继续？')) return;
          b.textContent = '…';
          await api(`/api/accounts/${id}/refresh`, { method: 'POST' });
          await loadAccounts();
          toast('额度已刷新', 'ok');
        } else if (act === 'toggle') {
          const acc = state.accounts.find((x) => x.id === id);
          await api(`/api/accounts/${id}/toggle`, { method: 'POST', body: { disabled: !acc.disabled } });
          await loadAccounts();
        } else if (act === 'del') {
          if (!confirm('确定删除该账号？')) return;
          await api(`/api/accounts/${id}`, { method: 'DELETE' });
          await loadAccounts();
          toast('已删除', 'ok');
        }
      } catch (e) { toast(e.message, 'err'); }
    });
  });
}

function renderQuotaSummary() {
  const active = state.accounts.filter((a) => !a.disabled);
  const left = active.reduce((s, a) => s + (a.quota?.left ?? 0), 0);
  const point = active.reduce((s, a) => s + (a.quota?.point ?? 0), 0);
  $('#qsAccounts').textContent = active.length;
  $('#qsLeft').textContent = left;
  $('#qsPoint').textContent = point;
}

/* ================= 添加账号 ================= */
function openModal() {
  $('#modalAccount').hidden = false;
  $('#modalMsg').textContent = '';
  $('#inAccount').value = '';
  $('#inPassword').value = '';
  $('#inCookie').value = '';
  $('#inLabel').value = '';
}

$$('.tab').forEach((t) => {
  t.addEventListener('click', () => {
    $$('.tab').forEach((x) => x.classList.remove('active'));
    t.classList.add('active');
    const tab = t.dataset.tab;
    $('#panePwd').hidden = tab !== 'pwd';
    $('#paneCookie').hidden = tab !== 'cookie';
  });
});

$('#btnAddAccount').addEventListener('click', openModal);
$('#btnCloseModal').addEventListener('click', () => ($('#modalAccount').hidden = true));
$('#btnCancelAdd').addEventListener('click', () => ($('#modalAccount').hidden = true));
$('#btnHelp').addEventListener('click', () => ($('#modalHelp').hidden = false));
$('#btnCloseHelp').addEventListener('click', () => ($('#modalHelp').hidden = true));
$('#modalHelp').addEventListener('click', (e) => {
  if (e.target.id === 'modalHelp') $('#modalHelp').hidden = true;
});

$('#btnSubmitAdd').addEventListener('click', async () => {
  const btn = $('#btnSubmitAdd');
  const msg = $('#modalMsg');
  const isCookie = !$$('.tab')[0].classList.contains('active');
  const body = {
    label: $('#inLabel').value.trim() || undefined,
    ...(isCookie
      ? { cookie: $('#inCookie').value.trim() }
      : { account: $('#inAccount').value.trim(), password: $('#inPassword').value }),
  };
  if (isCookie && !body.cookie) return (msg.textContent = '请填写 Cookie', msg.className = 'modal-msg err');
  if (!isCookie && (!body.account || !body.password)) return (msg.textContent = '请填写账号和密码', msg.className = 'modal-msg err');

  btn.disabled = true; btn.textContent = '验证中…';
  msg.textContent = ''; msg.className = 'modal-msg';
  try {
    const r = await api('/api/accounts', { method: 'POST', body });
    msg.className = 'modal-msg ok';
    msg.textContent = `添加成功：${r.account.label}（剩余 ${r.account.quota?.left ?? '?'} 次）`;
    await loadAccounts();
    setTimeout(() => ($('#modalAccount').hidden = true), 700);
    toast('账号已添加', 'ok');
  } catch (e) {
    msg.className = 'modal-msg err';
    msg.textContent = e.message;
  } finally {
    btn.disabled = false; btn.textContent = '添加';
  }
});

$('#btnRefreshAll').addEventListener('click', async () => {
  const n = state.accounts.length;
  if (!confirm(`全部刷新会为 ${n} 个账号各消耗 1 次拨测配额（合计 ${n} 次），且不可撤销。\n\n确定继续？`)) return;
  const b = $('#btnRefreshAll');
  b.textContent = '刷新中';
  b.disabled = true;
  try {
    await api('/api/accounts/refresh-all', { method: 'POST' });
    await loadAccounts();
    toast('全部额度已刷新', 'ok');
  } catch (e) { toast(e.message, 'err'); }
  finally { b.textContent = '刷新'; b.disabled = false; }
});

/* ================= 节点配置 ================= */
$$('#nodeTypeSeg .seg-btn').forEach((b) => {
  b.addEventListener('click', () => {
    $$('#nodeTypeSeg .seg-btn').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    state.nodeType = b.dataset.v;
  });
});

/* ================= 拨测 ================= */
function setProgress(text, indeterminate) {
  $('#progressWrap').hidden = false;
  $('#progressText').textContent = text;
  const inner = $('#progressInner');
  if (indeterminate) {
    inner.classList.add('indeterminate');
    inner.style.width = '';
  } else {
    inner.classList.remove('indeterminate');
  }
}
function stopProgress() {
  $('#progressWrap').hidden = true;
  const inner = $('#progressInner');
  inner.classList.remove('indeterminate');
  inner.style.width = '0';
}

$('#btnProbe').addEventListener('click', async () => {
  // 把输入框残留内容也转成词条
  const pending = $('#hostInput').value.trim();
  if (pending) {
    for (const p of pending.split(/[\s,，;；]+/).filter(Boolean)) addHost(p);
    $('#hostInput').value = '';
  }
  const hosts = [...state.hosts];
  if (!hosts.length) return toast('请先添加至少一个域名', 'warn');

  const isp = $$('#ispBox input:checked').map((c) => c.value);
  if (!isp.length) return toast('请至少选择一条线路', 'warn');

  const btn = $('#btnProbe');
  btn.disabled = true; btn.textContent = '检测中…';
  setProgress('正在准备任务…', true);

  // 结果区清空，看板置为「检测中」
  $('#resultArea').innerHTML = '<div class="placeholder"><div class="ph-icon">◎</div><p>正在拨测，节点数据实时到达…</p><p class="ph-sub">地图会随每一批结果即时更新</p></div>';
  await dashReset(hosts[0]);

  try {
    const { jobId } = await api('/api/probe', { method: 'POST', body: { hosts, isp, nodeType: state.nodeType, type: 'http' } });
    let cursor = 0;
    let done = false;
    let lastBatch = 0;

    while (!done) {
      await new Promise((r) => setTimeout(r, 600));
      const st = await api(`/api/probe/${jobId}?since=${cursor}`);
      cursor = st.nextCursor;

      for (const ev of st.events) {
        if (ev.type === 'batch') {
          dashPush(ev.rows, ev.total);
          lastBatch = ev.total;
          setProgress(`已收到 ${ev.total} 个节点，正在继续…（分批发推）`, true);
        } else if (ev.type === 'log') {
          setProgress(ev.msg, true);
        } else if (ev.type === 'quota') {
          setProgress(`账号额度 ${ev.count}/${ev.limit}，剩余 ${ev.left} 次`, true);
        } else if (ev.type === 'progress') {
          if (ev.got > lastBatch) lastBatch = ev.got;
        } else if (ev.type === 'status') {
          setProgress(ev.msg, true);
        } else if (ev.type === 'error') {
          toast(ev.msg, 'err');
        } else if (ev.type === 'quota_exhausted') {
          $('#dashState').textContent = '额度耗尽';
          $('#dashState').className = 'ds-v err';
          $('#dashDot').className = 'dash-dot err';
        }
      }

      if (st.done) {
        done = true;
        if (st.result && st.result.ok) {
          dashFinish(st.result);
          renderResult(st.result);
          loadHistory().catch(() => {});
          // 记录本次输入到「最近」并持久化当前词条
          for (const h of (st.result.hosts?.length ? st.result.hosts : hosts)) rememberHost(h);
          persistCurrentHosts();
          toast('检测完成', 'ok');
        } else {
          const msg = (st.result && st.result.error) || st.error || '检测失败';
          toast(msg, 'err');
          renderFail(msg);
          $('#dashState').textContent = '失败';
          $('#dashState').className = 'ds-v err';
          $('#dashDot').className = 'dash-dot err';
        }
      }
    }
    await loadAccounts();
  } catch (e) {
    toast(e.message, 'err');
    renderFail(e.message);
    $('#dashState').textContent = '失败';
    $('#dashState').className = 'ds-v err';
  } finally {
    btn.disabled = false; btn.textContent = '开始检测';
    stopProgress();
  }
});

/* ================= 导入结果页 ================= */
$('#btnImport').addEventListener('click', async () => {
  const url = prompt('粘贴拨测结果页链接（含 time_id）\n例如：https://www.boce.com/http/20261104_xxxx.html');
  if (!url) return;
  setProgress('正在读取结果页…', true);
  try {
    const r = await api('/api/import', { method: 'POST', body: { url } });
    // 把 rows 包装成一次假结果
    const hosts = [...new Set(r.rows.map((x) => (x.host || x.domain || '').replace(/^https?:\/\//, '')))];
    const perHost = hosts.map((h) => {
      const rows = r.rows.filter((x) => (x.host || x.domain || '').replace(/^https?:\/\//, '') === h);
      return { host: h, rows, stat: r.stat || aggregateClient(rows), resultUrl: r.url, timeId: r.timeId };
    });
    const result = { hosts: hosts.length ? hosts : ['(未识别)'], perHost, ok: true };

    // 同步看板：先重置，再一次性推入
    await dashReset(result.hosts[0]);
    dashPush(r.rows, r.rows.length);
    dashFinish(result);

    renderResult(result);
    for (const h of result.hosts) rememberHost(h);
    toast('已导入', 'ok');
  } catch (e) {
    toast(e.message, 'err');
  } finally {
    stopProgress();
  }
});

/* 前端侧聚合（导入时用） */
function aggregateClient(rows) {
  const cost = (r) => (typeof r.totalCost === 'number' && r.totalCost > 0 ? r.totalCost : null);
  const times = rows.map(cost).filter((v) => v != null).sort((a, b) => a - b);
  const okRows = rows.filter((r) => r.httpCode >= 200 && r.httpCode < 400);
  const codeDist = {};
  rows.forEach((r) => { const c = r.httpCode ?? '-'; codeDist[c] = (codeDist[c] || 0) + 1; });
  const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;
  return {
    count: rows.length, total: rows.length, codeDist,
    avg, min: times[0] ?? null, max: times[times.length - 1] ?? null,
    p50: times[Math.floor(times.length * .5)] ?? null,
    p95: times[Math.floor(times.length * .95)] ?? null,
    okCount: okRows.length,
    minMaxAvg: [],
    provinceArr: [],
    ipPre: [],
  };
}

/* ================= 渲染 ================= */
function renderFail(msg) {
  $('#resultArea').innerHTML = `
    <div class="placeholder" style="border-color:rgba(242,85,90,.4)">
      <div class="ph-icon" style="color:var(--bad)">✕</div>
      <p>检测失败</p>
      <p class="ph-sub">${esc(msg)}</p>
    </div>`;
}

const PROVINCE_AREA = {
  安徽:'华东',北京:'华北',福建:'华东',甘肃:'西北',广东:'华南',广西:'华南',贵州:'西南',
  海南:'华南',河北:'华北',河南:'华中',黑龙江:'东北',湖北:'华中',湖南:'华中',吉林:'东北',
  江苏:'华东',江西:'华东',辽宁:'东北',内蒙古:'华北',宁夏:'西北',青海:'西北',山东:'华东',
  山西:'华北',陕西:'西北',上海:'华东',四川:'西南',天津:'华北',西藏:'西南',新疆:'西北',
  云南:'西南',浙江:'华东',重庆:'西南',
};

function renderResult(result) {
  const area = $('#resultArea');
  area.innerHTML = '';
  for (const h of result.perHost) {
    area.appendChild(buildHostBlock(h));
  }
  if (!result.perHost.length) {
    area.innerHTML = '<div class="placeholder"><p>没有返回任何节点结果</p></div>';
    return;
  }
  activateMaps(area);
}

/**
 * 连通率 = 节点拿到 HTTP 响应（含 4xx/5xx）。
 * 与「2xx/3xx 通过率」严格区分：404 站点连通率 100%、通过率 0%。
 * httpCode <= 0 或缺失 = 节点没拿到响应（超时/DNS 失败）。
 */
function connRate(rows) {
  const total = rows.length;
  const alive = rows.filter((r) => Number(r.httpCode) > 0).length;
  const pass = rows.filter((r) => r.httpCode >= 200 && r.httpCode < 400).length;
  return { total, alive, pass, conn: total ? (alive / total) * 100 : 0, passRate: total ? (pass / total) * 100 : 0 };
}

function buildHostBlock(h) {
  const rows = h.rows || [];
  const stat = h.stat || aggregateClient(rows);
  const rt = connRate(rows);

  // 主指标用连通率：站点有真实响应就算通，404 不代表不可用
  const badgeCls = rt.conn >= 95 ? '' : rt.conn >= 60 ? 'warn' : 'err';
  // 4xx 占多数时提示「路径问题」而不是「站点故障」
  const many4xx = (stat.codeDist?.['404'] || 0) + (stat.codeDist?.['403'] || 0) > rt.total * 0.5;
  const note = many4xx
    ? `<span class="host-badge note" title="节点全部拿到响应，但响应码是 4xx。说明服务在线，是拨测路径本身返回了错误码（如站点根路径无页面）。">连通正常 · 响应 4xx</span>`
    : '';

  const wrap = document.createElement('div');
  wrap.className = 'host-block';

  // KPI
  const kpi = (label, val, unit, cls = '') =>
    `<div class="kpi"><div class="kpi-label">${label}</div><div class="kpi-val ${cls}">${val}${unit ? `<small>${unit}</small>` : ''}</div></div>`;

  const avgCls = stat.avg == null ? '' : stat.avg < 0.3 ? 'good' : stat.avg < 1 ? 'warn' : 'bad';

  wrap.innerHTML = `
    <div class="host-head">
      <span class="host-name">${esc(h.host)}</span>
      <span class="host-badge ${badgeCls}" title="拿到任意 HTTP 响应的节点占比，4xx/5xx 也算拿到响应">连通率 ${fmt(rt.conn, 1)}%</span>
      ${note}
      <span class="host-badge" style="background:rgba(61,139,253,.13);color:var(--brand)">${rows.length} 节点</span>
      ${h.resultUrl ? `<a class="host-link" href="${esc(h.resultUrl)}" target="_blank" rel="noopener">查看原始结果 ↗</a>` : ''}
    </div>
    <div class="host-body">
      <div class="kpis">
        ${kpi('连通节点', rt.alive, '/' + rt.total, rt.conn >= 95 ? 'good' : rt.conn >= 60 ? 'warn' : 'bad')}
        ${kpi('2xx/3xx 通过', rt.pass, '/' + rt.total, '')}
        ${kpi('平均响应', fmt(stat.avg), 's', avgCls)}
        ${kpi('最快', fmt(stat.min), 's', 'good')}
        ${kpi('最慢', fmt(stat.max), 's', 'bad')}
        ${kpi('P95', fmt(stat.p95), 's')}
      </div>
      ${buildStatTable(stat)}
      ${buildProvinceGrid(rows)}
      ${buildCodeDist(stat.codeDist, rows.length)}
      ${buildNodeTable(rows)}
    </div>`;
  return wrap;
}

function buildStatTable(stat) {
  const mm = stat.minMaxAvg || [];
  if (!mm.length) return '';
  const order = ['全部', '电信', '移动', '联通', '海外', '港澳台', '华东', '华北', '华南', '华中', '西北', '西南', '东北'];
  const sorted = [...mm].sort((a, b) => {
    const ia = order.indexOf(a.name), ib = order.indexOf(b.name);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  return `
  <div>
    <div class="sec-title">区域 / 运营商统计</div>
    <table class="stat-table">
      <thead><tr><th>区域/运营商</th><th>响应最快</th><th>响应最慢</th><th>平均响应</th></tr></thead>
      <tbody>
        ${sorted.map((r) => `
          <tr>
            <td class="area-name">${esc(r.name)}</td>
            <td class="cell-min">${fmt(r.min?.value)}s <span class="cell-sub">${esc(r.min?.name || '')}</span></td>
            <td class="cell-max">${fmt(r.max?.value)}s <span class="cell-sub">${esc(r.max?.name || '')}</span></td>
            <td class="cell-avg">${fmt(r.avg)}s</td>
          </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

function buildProvinceGrid(rows) {
  const by = {};
  for (const r of rows) {
    const p = r.province_name || '未知';
    (by[p] = by[p] || []).push(r);
  }
  const entries = Object.entries(by);
  if (!entries.length) return '';
  const vals = entries.map(([, arr]) => {
    const cs = arr.map((r) => r.totalCost).filter((v) => typeof v === 'number' && v > 0);
    return cs.length ? cs.reduce((a, b) => a + b, 0) / cs.length : null;
  }).filter((v) => v != null);
  const minV = Math.min(...vals), maxV = Math.max(...vals);

  // 绿 -> 黄 -> 红
  const colorOf = (v) => {
    if (v == null) return ['rgba(120,130,145,.16)', '#8b98a8'];
    const t = maxV === minV ? 0 : (v - minV) / (maxV - minV);
    if (t < 0.5) {
      const k = t / 0.5;
      return [`rgba(${Math.round(62 + (245 - 62) * k)},${Math.round(207 + (181 - 207) * k)},${Math.round(142 + (68 - 142) * k)},.17)`,
              `rgb(${Math.round(62 + (245 - 62) * k)},${Math.round(207 + (181 - 207) * k)},${Math.round(142 + (68 - 142) * k)})`];
    }
    const k = (t - 0.5) / 0.5;
    return [`rgba(${Math.round(245 + (242 - 245) * k)},${Math.round(181 + (85 - 181) * k)},${Math.round(68 + (90 - 68) * k)},.17)`,
            `rgb(${Math.round(245 + (242 - 245) * k)},${Math.round(181 + (85 - 181) * k)},${Math.round(68 + (90 - 68) * k)})`];
  };

  const cells = entries.sort((a, b) => a[0].localeCompare(b[0], 'zh')).map(([p, arr]) => {
    const cs = arr.map((r) => r.totalCost).filter((v) => typeof v === 'number' && v > 0);
    const avg = cs.length ? cs.reduce((a, b) => a + b, 0) / cs.length : null;
    const alive = arr.filter((r) => Number(r.httpCode) > 0).length;
    const [bg, fg] = colorOf(avg);
    return `<div class="prov-cell" style="background:${bg};color:${fg}" title="${esc(p)} · ${arr.length} 节点 · 连通 ${alive}/${arr.length} · 平均 ${avg == null ? '-' : avg.toFixed(3) + 's'}">
      <div class="prov-name">${esc(p)}</div>
      <div class="prov-val">${avg == null ? '-' : avg.toFixed(2)}<small>s</small></div>
    </div>`;
  }).join('');

  return `<div><div class="sec-title">各省平均响应</div><div class="province-grid">${cells}</div></div>`;
}

function buildCodeDist(dist, total) {
  const entries = Object.entries(dist || {}).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return '';
  const cls = (c) => {
    const n = +c;
    if (n >= 200 && n < 300) return 'code-2xx';
    if (n >= 300 && n < 400) return 'code-3xx';
    if (n >= 400 && n < 500) return 'code-4xx';
    if (n >= 500) return 'code-5xx';
    return 'code-err';
  };
  return `<div><div class="sec-title">状态码分布</div>
    <div class="code-dist">
      ${entries.map(([c, n]) => `<div class="code-chip">
        <span class="code-badge ${cls(c)}">${esc(c)}</span>
        <span class="cd-count">${n}</span>
        <span style="color:var(--text-3);font-size:11px">${fmt(pct(n, total), 0)}%</span>
      </div>`).join('')}
    </div></div>`;
}

function buildNodeTable(rows) {
  if (!rows.length) return '';
  const sorted = [...rows].sort((a, b) => (a.totalCost ?? 9e9) - (b.totalCost ?? 9e9));
  const codeCls = (c) => {
    const n = +c;
    if (n >= 200 && n < 300) return 'code-2xx';
    if (n >= 300 && n < 400) return 'code-3xx';
    if (n >= 400 && n < 500) return 'code-4xx';
    if (n >= 500) return 'code-5xx';
    return 'code-err';
  };
  return `<div>
    <div class="sec-title">节点明细（按响应时间排序）</div>
    <div class="table-scroll">
      <table class="node-table">
        <thead><tr>
          <th>节点</th><th>运营商</th><th>省份</th><th>状态码</th>
          <th class="num">DNS</th><th class="num">连接</th><th class="num">首包</th><th class="num">总耗时</th>
          <th>落地 IP</th>
        </tr></thead>
        <tbody>
          ${sorted.map((r) => `
            <tr>
              <td>${esc(r.node_name)}</td>
              <td><span class="isp-dot isp-${r.isp || 0}"></span>${esc(r.isp_name || '-')}</td>
              <td>${esc(r.province_name || '-')}</td>
              <td><span class="code-badge ${codeCls(r.httpCode)}">${esc(r.httpCode ?? '-')}</span></td>
              <td class="num">${fmt(r.dnsCost)}</td>
              <td class="num">${fmt(r.connCost)}</td>
              <td class="num">${fmt(r.firstCost)}</td>
              <td class="num" style="font-weight:600">${fmt(r.totalCost)}</td>
              <td class="ip-cell">${esc(r.ip || '-')}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}


/* ================= 中国地图（参照 boce 官方实现） ================= */

// boce 官方响应分级色（来自 index_v5.js splitConfigs.http）
const SPLIT_CONFIGS = {
  http: [
    { start: 0, end: 0.5, label: '< 0.5s', color: '#24aa1d' },
    { start: 0.5, end: 1, label: '0.5s-1s', color: '#42dd3f' },
    { start: 1, end: 3, label: '1s-3s', color: '#bef663' },
    { start: 3, end: 10, label: '3s-10s', color: '#f69833' },
    { start: 10, end: 999999, label: '> 10s', color: '#e61610' },
  ],
};

// boce 官方省份坐标（超时闪电图标定位）
const PROVINCE_COORD = {
  '北京': [116.40, 40.10], '天津': [117.35, 39.30], '上海': [121.47, 31.23], '重庆': [107.90, 30.10],
  '河北': [115.20, 38.20], '河南': [113.60, 33.90], '云南': [101.90, 24.80], '辽宁': [122.50, 41.30],
  '黑龙江': [127.70, 47.90], '湖南': [112.30, 27.60], '安徽': [117.20, 31.10], '山东': [118.00, 36.40],
  '新疆': [84.80, 41.80], '江苏': [119.20, 32.90], '浙江': [120.10, 29.20], '江西': [115.70, 27.60],
  '湖北': [112.30, 30.90], '广西': [108.30, 23.70], '甘肃': [103.80, 37.90], '山西': [112.30, 37.60],
  '内蒙古': [113.90, 44.10], '陕西': [108.80, 35.20], '吉林': [126.20, 43.60], '福建': [118.00, 26.00],
  '贵州': [106.70, 26.80], '广东': [113.40, 23.40], '青海': [96.00, 35.60], '西藏': [88.80, 31.70],
  '四川': [102.80, 30.60], '宁夏': [106.30, 37.30], '海南': [109.80, 19.20], '台湾': [120.90, 23.80],
  '香港': [114.17, 22.28], '澳门': [113.54, 22.19],
};

// 运营商色（boce 官方 isp_color）
const ISP_COLOR = { 1: '#9ccc65', 2: '#00acc1', 3: '#ffba57', 10: '#d181ff', 11: '#ff5252' };
const ISP_NAME = { 1: '电信', 2: '移动', 3: '联通', 10: '海外', 11: '港澳台' };

let mapRegistry = [];
let chinaRegistered = false;

async function ensureChinaMap() {
  if (chinaRegistered) return true;
  try {
    const geo = await fetch('vendor/china-geo.json').then((r) => r.json());
    echarts.registerMap('china', geo);
    chinaRegistered = true;
    return true;
  } catch (e) {
    console.error('地图加载失败', e);
    return false;
  }
}

function buildMapSection(rows, hostEl) {
  const id = 'map_' + Math.random().toString(36).slice(2, 9);
  const meta = encodeURIComponent(JSON.stringify(rows.map((r) => ({
    p: r.province_name, i: r.isp, n: r.node_name, c: r.totalCost,
  }))));
  return `
    <div>
      <div class="sec-title">全国响应分布</div>
      <div class="map-card">
        <div class="map-tabs">
          <button class="map-tab active" data-mode="avg">平均响应</button>
          <button class="map-tab" data-mode="fastest">最快响应</button>
        </div>
        <div class="chart-box" id="${id}" data-rows="${meta}"></div>
        <div class="map-legend">
          ${SPLIT_CONFIGS.http.map((c) => `<span class="lg"><i style="background:${c.color}"></i>${c.label}</span>`).join('')}
        </div>
      </div>
    </div>`;
}

/** 渲染完成后，激活所有待初始化的地图 */
async function activateMaps(root) {
  const boxes = root.querySelectorAll('.chart-box[data-rows]');
  if (!boxes.length) return;
  const ok = await ensureChinaMap();
  for (const el of boxes) {
    if (el.dataset.inited) continue;
    if (!ok) {
      el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-3)">地图资源加载失败</div>';
      continue;
    }
    let raw = [];
    try { raw = JSON.parse(decodeURIComponent(el.dataset.rows)); } catch {}
    const rows = raw.map((x) => ({ province_name: x.p, isp: x.i, node_name: x.n, totalCost: x.c }));
    const chart = echarts.init(el);
    el.dataset.inited = '1';
    mapRegistry.push(chart);

    const render = (mode) => {
      const data = buildMapData(rows, mode);
      chart.setOption(buildMapOption(data, rows, mode), true);
    };
    render('avg');

    el.parentElement.querySelectorAll('.map-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        el.parentElement.querySelectorAll('.map-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        render(tab.dataset.mode);
      });
    });
  }
}

function buildMapData(rows, mode) {
  const byProv = {};
  for (const r of rows) {
    const p = r.province_name;
    if (!p) continue;
    (byProv[p] = byProv[p] || []).push(r);
  }
  return Object.entries(byProv).map(([name, arr]) => {
    const costs = arr.map((r) => r.totalCost).filter((v) => typeof v === 'number' && v > 0);
    if (!costs.length) return { name, value: 999999 };
    const val = mode === 'fastest'
      ? Math.min(...costs)
      : costs.reduce((a, b) => a + b, 0) / costs.length;
    return { name, value: +val.toFixed(3) };
  });
}

function buildMapOption(data, rows, mode) {
  const unit = 's';
  // 超时省份 → 闪电图标
  const timeoutPoints = data
    .filter((d) => d.value === 999999 && PROVINCE_COORD[d.name])
    .map((d) => ({ name: d.name, coord: PROVINCE_COORD[d.name], value: 1 }));

  // 省份节点明细（tooltip）
  const byProv = {};
  for (const r of rows) {
    if (!r.province_name) continue;
    (byProv[r.province_name] = byProv[r.province_name] || []).push(r);
  }

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#ffffff',
      borderColor: '#e3e8ef',
      borderWidth: 1,
      padding: 0,
      textStyle: { color: '#1f2937', fontSize: 12 },
      extraCssText: 'box-shadow:0 8px 24px rgba(16,24,40,.14);border-radius:10px;overflow:hidden;',
      formatter: (params) => {
        if (!params.name || !byProv[params.name]) {
          return `<div style="padding:10px 14px;color:#8b9bb0">${params.name || ''}：无数据</div>`;
        }
        const list = [...byProv[params.name]].sort((a, b) => (a.totalCost ?? 9e9) - (b.totalCost ?? 9e9));
        const val = params.value === 999999 ? '超时' : params.value + unit;
        let h = `<div style="background:#128bff;color:#fff;padding:7px 14px;font-weight:600;font-size:12.5px">${params.name}</div>`;
        h += `<div style="padding:9px 14px">`;
        h += `<div style="color:#5a6b82;margin-bottom:7px">${mode === 'fastest' ? '最快响应' : '平均响应'}：<b style="color:#1f2937">${val}</b></div>`;
        for (const r of list) {
          const c = ISP_COLOR[r.isp] || '#8b9bb0';
          const t = r.totalCost == null || r.totalCost <= 0 ? '超时' : r.totalCost + unit;
          h += `<div style="line-height:1.9;white-space:nowrap">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${c};margin-right:6px"></span>
            <span style="color:${c};font-weight:600">${r.node_name || ''}</span>
            <span style="color:#5a6b82;margin-left:8px">${t}</span>
          </div>`;
        }
        h += `</div>`;
        return h;
      },
    },
    visualMap: {
      type: 'piecewise',
      min: 0,
      max: 999999,
      left: 12,
      bottom: 12,
      pieces: SPLIT_CONFIGS.http.map((c) => ({
        min: c.start, max: c.end, label: c.label, color: c.color,
      })).concat([{ value: 999999, label: '超时', color: '#e61610' }]),
      textStyle: { color: '#5a6b82', fontSize: 11 },
      itemWidth: 14,
      itemHeight: 11,
      itemGap: 6,
    },
    series: [{
      type: 'map',
      map: 'china',
      roam: false,
      zoom: 1.18,
      layoutCenter: ['50%', '52%'],
      layoutSize: '112%',
      selectedMode: false,
      label: { show: false },
      itemStyle: {
        areaColor: '#eef2f7',
        borderColor: '#ffffff',
        borderWidth: 1,
        shadowColor: 'rgba(180,196,214,.35)',
        shadowBlur: 4,
      },
      emphasis: {
        label: { show: true, color: '#fff', fontSize: 11, fontWeight: 600 },
        itemStyle: { areaColor: '#128bff', borderColor: '#fff', borderWidth: 1.5 },
      },
      data,
      markPoint: {
        symbol: 'path://M576 64L192 576h192l-64 384 384-512H512z',
        symbolSize: 13,
        silent: true,
        itemStyle: { color: '#ff2d2d' },
        data: timeoutPoints,
      },
    }],
  };
}

window.addEventListener('resize', () => {
  for (const c of mapRegistry) { try { c.resize(); } catch {} }
});

/* ============================================
   常驻看板：地图实时增量渲染
   ============================================ */
const dash = {
  el: null, chart: null, rows: [], host: '', mode: 'avg', inited: false,
};

function dashInit() {
  if (dash.inited) return;
  dash.el = $('#dashboard');
  dash.el.hidden = false;

  // 图例
  $('#dashLegend').innerHTML = SPLIT_CONFIGS.http
    .map((c) => `<span class="lg"><i style="background:${c.color}"></i>${c.label}</span>`)
    .join('');

  // tab
  $$('#dashMapCard .map-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('#dashMapCard .map-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      dash.mode = tab.dataset.mode;
      dashRender();
    });
  });

  dash.inited = true;
}

async function dashEnsureChart() {
  if (dash.chart) return true;
  const ok = await ensureChinaMap();
  if (!ok) return false;
  const el = $('#dashMap');
  dash.chart = echarts.init(el);
  mapRegistry.push(dash.chart);
  return true;
}

/** 重置看板（新一轮检测开始） */
async function dashReset(host) {
  dashInit();
  dash.rows = [];
  dash.host = host || '';
  $('#dashHost').textContent = dash.host || '等待检测';
  $('#dashGot').textContent = '0';
  $('#dashAvg').textContent = '-';
  $('#dashOk').textContent = '-';
  $('#dashState').textContent = '检测中';
  $('#dashState').className = 'ds-v running';
  $('#dashDot').className = 'dash-dot running';
  await dashEnsureChart();
  dashCollapse(false);
  dashRender();
}

/** 追加一批节点 */
function dashPush(rows, total) {
  dashInit();
  dash.rows.push(...rows);
  $('#dashGot').textContent = dash.rows.length;
  dashRender();
}

/** 检测完成 */
function dashFinish(result) {
  if (!result || !result.perHost || !result.perHost.length) {
    $('#dashState').textContent = '失败';
    $('#dashState').className = 'ds-v err';
    $('#dashDot').className = 'dash-dot err';
    return;
  }
  // 用最终权威结果覆盖增量数据
  const h = result.perHost[0];
  dash.rows = h.rows || dash.rows;
  dash.host = h.host || dash.host;
  $('#dashHost').textContent = dash.host;
  $('#dashGot').textContent = dash.rows.length;

  const stat = h.stat || aggregateClient(dash.rows);
  $('#dashAvg').textContent = stat.avg == null ? '-' : stat.avg.toFixed(2) + 's';
  const rt = connRate(dash.rows);
  $('#dashOk').textContent = `${rt.alive}/${rt.total}`;
  $('#dashOk').title = `连通 ${rt.alive} · 2xx/3xx 通过 ${rt.pass}`;
  $('#dashState').textContent = '完成';
  $('#dashState').className = 'ds-v ok';
  $('#dashDot').className = 'dash-dot done';
  dashRender();
  // 地图默认保持展开，用户可手动收起
  dashCollapse(false);
}

/** 折叠/展开看板地图体 */
function dashCollapse(collapsed) {
  const body = document.querySelector('.dash-body');
  if (!body) return;
  body.hidden = !!collapsed;
  const head = document.querySelector('.dash-head');
  if (!head) return;
  let toggle = head.querySelector('.dash-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.className = 'mini dash-toggle';
    toggle.textContent = '展开地图';
    toggle.addEventListener('click', () => {
      const nowCollapsed = !document.querySelector('.dash-body').hidden;
      dashCollapse(nowCollapsed);
    });
    head.appendChild(toggle);
  }
  toggle.textContent = collapsed ? '展开地图' : '收起地图';
}

/** 渲染地图（增量安全） */
async function dashRender() {
  if (!dash.chart) { const ok = await dashEnsureChart(); if (!ok) return; }
  if (!dash.rows.length) {
    dash.chart.clear();
    dash.chart.setOption({
      series: [{ type: 'map', map: 'china', roam: false, zoom: 1.18,
        layoutCenter: ['50%', '52%'], layoutSize: '112%',
        itemStyle: { areaColor: '#eef2f7', borderColor: '#fff', borderWidth: 1 },
        data: [], label: { show: false } }],
    }, true);
    return;
  }
  const data = buildMapData(dash.rows, dash.mode);
  dash.chart.setOption(buildMapOption(data, dash.rows, dash.mode), true);

  // 实时更新平均
  const costs = dash.rows.map((r) => r.totalCost).filter((v) => typeof v === 'number' && v > 0);
  if (costs.length && !$('#dashAvg').dataset.final) {
    $('#dashAvg').textContent = (costs.reduce((a, b) => a + b, 0) / costs.length).toFixed(2) + 's';
  }
}


/* ============================================
   侧栏 Tab：账号池 / 历史记录
   ============================================ */
state.accQuery = '';
state.histQuery = '';
state.history = [];

function switchSidePane(pane) {
  $$('.side-tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.pane === pane);
  });
  // 三个面板都显式设置 hidden，避免遗漏导致布局错位
  const showAcc = pane === 'accounts';
  $('#paneAccounts').hidden = !showAcc;
  $('#paneQuota').hidden = !showAcc;
  $('#paneHistory').hidden = showAcc;
  if (!showAcc) loadHistory();
}

$$('.side-tab').forEach((tab) => {
  tab.addEventListener('click', () => switchSidePane(tab.dataset.pane));
});

/* ---- 账号搜索 & 计数 ---- */
$('#accSearch').addEventListener('input', (e) => {
  state.accQuery = e.target.value.trim().toLowerCase();
  renderAccounts();
});

/* ---- 历史记录 ---- */
async function loadHistory() {
  try {
    const r = await api('/api/history?limit=100' + (state.histQuery ? '&host=' + encodeURIComponent(state.histQuery) : ''));
    state.history = r.items || [];
    $('#histTotal').textContent = r.total ?? state.history.length;
    renderHistory();
  } catch (e) { toast(e.message, 'err'); }
}

function renderHistory() {
  const box = $('#histList');
  if (!state.history.length) {
    box.innerHTML = '<div class="empty">' + (state.histQuery ? '没匹配的记录' : '暂无记录，跑一次检测就有了') + '</div>';
    return;
  }
  box.innerHTML = state.history.map((it) => {
    const d = new Date(it.createdAt);
    const ts = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const first = it.hosts[0] || {};
    const avg = first.avg == null ? '-' : first.avg.toFixed(2) + 's';
    // 历史记录里的 ok 是 2xx/3xx 通过数；连通率另算（4xx 也算连通）
    const aliveN = first.alive != null ? first.alive : first.ok;
    const connRateV = first.count ? Math.round((aliveN / first.count) * 100) : 0;
    const cls = connRateV >= 95 ? '' : connRateV >= 60 ? 'warn' : 'err';
    const src = it.source === 'import' ? '导入' : '拨测';
    return `
    <div class="hist-item" data-id="${it.id}">
      <div class="hist-top">
        <span class="hist-host" title="${esc(it.hostNames.join(', '))}">${esc(first.host || '-')}${it.hostNames.length > 1 ? ` +${it.hostNames.length - 1}` : ''}</span>
        <span class="hist-src ${it.source === 'import' ? 'imp' : ''}">${src}</span>
      </div>
      <div class="hist-meta">
        <span class="hist-avg">${avg}</span>
        <span class="hist-ok ${cls}" title="连通率：拿到任意 HTTP 响应的节点占比（4xx/5xx 也算连通）">${connRateV}%</span>
        <span class="hist-cnt">${first.count ?? 0}节点</span>
        <span class="hist-time">${ts}</span>
        <button class="hist-trend" data-trend="${esc(first.host || '')}" title="查看趋势">↗</button>
        <button class="hist-del" data-del="${it.id}" title="删除">✕</button>
      </div>
    </div>`;
  }).join('');

  box.querySelectorAll('.hist-item').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.target.dataset.del || e.target.dataset.trend) return;
      openHistory(el.dataset.id);
    });
  });
  box.querySelectorAll('.hist-trend').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      showTrend(b.dataset.trend);
    });
  });
  box.querySelectorAll('.hist-del').forEach((b) => {
    b.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm('删除这条记录？')) return;
      await api('/api/history/' + b.dataset.del, { method: 'DELETE' });
      await loadHistory();
      toast('已删除', 'ok');
    });
  });
}

$('#histSearch')?.addEventListener('input', (e) => {
  state.histQuery = e.target.value.trim();
  clearTimeout(window.__histTimer);
  window.__histTimer = setTimeout(loadHistory, 350);
});
$('#btnRefreshHist')?.addEventListener('click', loadHistory);

/** 打开一条历史记录，还原完整结果视图 */
async function openHistory(id) {
  try {
    const r = await api('/api/history/' + id);
    const rec = r.record;
    state.currentHistoryId = id;
    state.currentHistoryHost = rec.hostNames[0] || '';
    const result = {
      hosts: rec.hostNames,
      perHost: rec.perHost,
      ok: true,
    };
    await dashReset(rec.hostNames[0] || '');
    const all = (rec.perHost || []).flatMap((h) => h.rows || []);
    dashPush(all, all.length);
    dashFinish(result);
    renderResult(result);

    const d = new Date(rec.createdAt);
    const ts = d.toLocaleString('zh-CN', { hour12: false });
    $('#viewingBanner').hidden = false;
    $('#viewingText').textContent = `正在查看历史记录 · ${rec.hostNames.join(', ')} · ${ts} · ${rec.source === 'import' ? '导入' : '实拨'}`;
    // 滚动到看板（地图 + 状态条）处，而不是结果区标题
    const target = $('#dashboard') || $('#resultArea');
    const main = document.querySelector('.main');
    if (target && main) {
      const top = target.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop;
      main.scrollTo({ top: Math.max(0, top - 24), behavior: 'smooth' });
    }
  } catch (e) {
    toast(e.message, 'err');
  }
}

$('#btnExitView')?.addEventListener('click', () => {
  $('#viewingBanner').hidden = true;
  $('#resultArea').innerHTML = '<div class="placeholder"><div class="ph-icon">◎</div><p>输入域名后点击「开始检测」</p><p class="ph-sub">支持全国 31 省 × 电信/移动/联通 共 92 个探测节点</p></div>';
  const dash = $('#dashboard');
  if (dash) dash.hidden = true;
});


/* ============================================
   域名输入：词条 + 上次输入记忆 + 历史快捷
   ============================================ */
const HOST_STORE = 'boce_host_history';
const HOST_LAST = 'boce_host_last';
const HOST_MAX_RECENT = 5;

state.hosts = [];

function loadHostHistory() {
  try {
    const arr = JSON.parse(localStorage.getItem(HOST_STORE) || '[]');
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string' && x) : [];
  } catch { return []; }
}


/** 归一化域名：去协议、去路径、去空白 */
function normalizeHost(raw) {
  let h = String(raw || '').trim();
  if (!h) return '';
  h = h.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').replace(/\s+/g, '');
  return h;
}

function renderHostChips() {
  const box = $('#hostChips');
  if (!box) return;
  box.innerHTML = state.hosts.map((h, i) => `
    <span class="host-chip" data-i="${i}" title="${esc(h)}">
      <span class="chip-text">${esc(h)}</span>
      <button class="chip-x" data-del="${i}" title="移除">✕</button>
    </span>`).join('');

  box.querySelectorAll('.chip-x').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      state.hosts.splice(+b.dataset.del, 1);
      renderHostChips();
      syncHostHint();
      persistCurrentHosts();
    });
  });

  // 点击词条可回填到输入框（便于编辑）
  box.querySelectorAll('.host-chip').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.target.dataset.del !== undefined) return;
      const i = +el.dataset.i;
      const v = state.hosts[i];
      state.hosts.splice(i, 1);
      renderHostChips();
      persistCurrentHosts();
      const input = $('#hostInput');
      input.value = v;
      input.focus();
      syncHostHint();
    });
  });
  syncHostHint();
}

function syncHostHint() {
  const n = state.hosts.length;
  const hint = $('#hostHint');
  if (!hint) return;
  hint.textContent = n ? `已添加 ${n} 个域名` : '支持多个域名';
  hint.className = 'host-hint' + (n ? ' has' : '');
}

/** 添加一个域名到词条区（同时写入最近记录） */
function addHost(raw, { silent = false } = {}) {
  const h = normalizeHost(raw);
  if (!h) return false;
  if (!/^[\w.-]+\.[a-zA-Z]{2,}(:\d+)?$/.test(h)) return false;
  if (state.hosts.includes(h)) return false;
  state.hosts.push(h);
  renderHostChips();
  if (!silent) rememberHost(h);
  persistCurrentHosts();
  return true;
}

/** 写入「最近输入」列表（去重、最多 5 条、置顶） */
function rememberHost(h) {
  if (!h) return;
  const prev = loadHostHistory().filter((x) => x !== h);
  const merged = [h, ...prev].slice(0, HOST_MAX_RECENT);
  try { localStorage.setItem(HOST_STORE, JSON.stringify(merged)); } catch {}
  renderHostRecent();
}

/** 持久化当前词条，供下次打开恢复 */
function persistCurrentHosts() {
  try { localStorage.setItem(HOST_LAST, JSON.stringify(state.hosts)); } catch {}
}

/** 最近输入快捷条 */
function renderHostRecent() {
  const box = $('#hostRecent');
  if (!box) return;
  const recent = loadHostHistory();
  if (!recent.length) {
    box.innerHTML = '';
    box.hidden = true;
    return;
  }
  box.hidden = false;
  box.innerHTML = `<span class="recent-label">最近</span>` + recent.map((h) => `
    <button class="recent-chip" data-host="${esc(h)}" title="点击填入">${esc(h)}</button>`).join('') +
    `<button class="recent-clear" title="清空历史">清空</button>`;

  box.querySelectorAll('.recent-chip').forEach((b) => {
    b.addEventListener('click', () => {
      addHost(b.dataset.host);
      const input = $('#hostInput');
      input.value = '';
      input.focus();
    });
  });
  box.querySelector('.recent-clear')?.addEventListener('click', () => {
    try { localStorage.removeItem(HOST_STORE); } catch {}
    renderHostRecent();
    toast('已清空最近输入', 'ok');
  });
}

/* ---- 输入框事件 ---- */
const hostInput = $('#hostInput');

hostInput?.addEventListener('keydown', (e) => {
  const v = hostInput.value;

  // 回车 / 逗号 / 空格 → 添加
  if (e.key === 'Enter' || e.key === ',' || e.key === '，') {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { $('#btnProbe').click(); return; }
    e.preventDefault();
    // 支持一次粘贴多个
    const parts = v.split(/[\s,，;；]+/).filter(Boolean);
    let added = 0;
    for (const p of parts) { if (addHost(p)) added++; }
    hostInput.value = '';
    if (!added && parts.length) toast('域名格式不对或已存在', 'warn');
    return;
  }

  // 退格删词条
  if (e.key === 'Backspace' && !v && state.hosts.length) {
    e.preventDefault();
    state.hosts.pop();
    renderHostChips();
    persistCurrentHosts();
  }
});

// 粘贴多域名
hostInput?.addEventListener('paste', (e) => {
  const text = (e.clipboardData || window.clipboardData).getData('text');
  if (!/[\s,，;；\n]/.test(text)) return;
  e.preventDefault();
  const parts = text.split(/[\s,，;；\n]+/).filter(Boolean);
  let added = 0;
  for (const p of parts) { if (addHost(p)) added++; }
  hostInput.value = '';
  if (added) toast(`已添加 ${added} 个域名`, 'ok');
});

// 失焦时把残留内容转成词条
hostInput?.addEventListener('blur', () => {
  const v = hostInput.value.trim();
  if (!v) return;
  const parts = v.split(/[\s,，;；]+/).filter(Boolean);
  let added = 0;
  for (const p of parts) { if (addHost(p)) added++; }
  hostInput.value = '';
});

// 点击输入区聚焦
$('#hostInputWrap')?.addEventListener('click', (e) => {
  if (e.target === $('#hostInputWrap') || e.target === $('#hostChips')) hostInput.focus();
});


/* ============================================
   启动（必须放在文件末尾：此时所有函数与常量已初始化）
   ============================================ */
(function boot() {
  // 1. 恢复上次输入的域名
  try {
    const last = JSON.parse(localStorage.getItem(HOST_LAST) || '[]');
    if (Array.isArray(last)) {
      for (const h of last) addHost(h, { silent: true });
    }
  } catch (e) {
    console.warn('恢复上次输入失败', e);
  }

  // 2. 渲染最近输入
  renderHostRecent();

  // 3. 登录后加载账号与历史
  checkAuth();
})();

/* ============================================
   访问口令
   ============================================ */
function showLogin(show) {
  const mask = $('#loginMask');
  if (!mask) return;
  mask.hidden = !show;
  if (show) setTimeout(() => $('#loginPwd')?.focus(), 60);
}

async function checkAuth() {
  try {
    const me = await api('/api/me');
    state.spaceId = me.spaceId;
    showLogin(false);
    bootstrapData();
  } catch (e) {
    showLogin(true);
  }
}

function bootstrapData() {
  loadAccounts().catch((e) => toast(e.message, 'err'));
  loadHistory().catch(() => {});
  loadDailyStatus().catch(() => {});
}

$('#loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#loginBtn');
  const err = $('#loginErr');
  const password = $('#loginPwd').value;
  const invite = $('#loginInvite').value;
  err.textContent = '';
  btn.disabled = true;
  btn.textContent = '验证中…';
  try {
    const r = await api('/api/login', { method: 'POST', body: { password, invite } });
    state.spaceId = r.spaceId;
    showLogin(false);
    toast(r.isNew ? `已创建新空间 ${r.spaceId}` : `已进入空间 ${r.spaceId}`, 'ok');
    bootstrapData();
  } catch (ex) {
    err.textContent = ex.message;
    showLogin(true);
  } finally {
    btn.disabled = false;
    btn.textContent = '进入';
  }
});

/* ============================================
   趋势图：同一域名多次检测的响应时间曲线
   ============================================ */
state.trendChart = null;
state.trendHost = '';

async function showTrend(host) {
  if (!host) return;
  state.trendHost = host;
  $('#trendBox').hidden = false;
  $('#trendTitle').textContent = `${host} 响应趋势`;

  let rows = [];
  try {
    const r = await api('/api/trend?host=' + encodeURIComponent(host) + '&limit=30');
    rows = r.rows || [];
  } catch (e) { toast(e.message, 'err'); return; }

  const el = $('#trendChart');
  if (!rows.length) {
    el.innerHTML = '<div class="trend-empty">该域名暂无历史记录</div>';
    return;
  }
  el.innerHTML = '';
  if (!state.trendChart) {
    state.trendChart = echarts.init(el, null, { renderer: 'canvas' });
  }
  state.trendChart.resize();

  // 标签精度自适应：跨度小于 1 小时显示到秒，小于 1 天显示到分，否则只显示日期
  const times = rows.map((r) => new Date(r.createdAt).getTime());
  const span = times.length > 1 ? times[times.length - 1] - times[0] : 0;
  const pad = (n) => String(n).padStart(2, '0');
  const labels = rows.map((r) => {
    const d = new Date(r.createdAt);
    const date = `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const sec = pad(d.getSeconds());
    if (span < 3600_000) return `${hm}:${sec}`;          // <1h：到秒
    if (span < 86400_000) return `${date} ${hm}`;        // <1d：到分
    return `${date}`;                                     // >=1d：只到日
  });

  state.trendChart.resize();
  state.trendChart.setOption({
    grid: { left: 38, right: 14, top: 26, bottom: 42 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff', borderColor: '#e3e8ef', borderWidth: 1,
      textStyle: { color: '#1f2937', fontSize: 11.5 },
      extraCssText: 'box-shadow:0 8px 24px rgba(16,24,40,.14);border-radius:8px;',
      formatter: (ps) => {
        const i = ps[0].dataIndex;
        const r = rows[i];
        return `<div style="font-weight:600;margin-bottom:4px">${labels[i]}</div>
          平均 <b>${fmt(r.avg)}s</b><br>最快 ${fmt(r.min)}s · 最慢 ${fmt(r.max)}s<br>
          节点 ${r.count} · 可用率 ${r.count ? Math.round((r.ok / r.count) * 100) : 0}%`;
      },
    },
    xAxis: {
      type: 'category', data: labels,
      axisLine: { lineStyle: { color: '#e3e8ef' } },
      axisTick: { show: false },
      axisLabel: { color: '#8b9bb0', fontSize: 9, interval: 'auto', rotate: labels.length > 6 ? 38 : 0 },
    },
    yAxis: {
      type: 'value', name: '秒', nameTextStyle: { color: '#8b9bb0', fontSize: 9 },
      axisLine: { show: false }, axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f3f7' } },
      axisLabel: { color: '#8b9bb0', fontSize: 9, formatter: (v) => v.toFixed(1) },
    },
    series: [
      {
        name: '平均响应', type: 'line', data: rows.map((r) => r.avg),
        smooth: true, symbol: 'circle', symbolSize: 5,
        lineStyle: { width: 2, color: '#128bff' },
        itemStyle: { color: '#128bff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(18,139,255,.22)' },
            { offset: 1, color: 'rgba(18,139,255,.02)' },
          ]),
        },
      },
      {
        name: '最慢', type: 'line', data: rows.map((r) => r.max),
        smooth: true, symbol: 'none',
        lineStyle: { width: 1.2, color: '#f69833', type: 'dashed' },
      },
    ],
  }, true);
}

$('#btnCloseTrend')?.addEventListener('click', () => {
  $('#trendBox').hidden = true;
});

$('#btnShowTrend')?.addEventListener('click', () => {
  const host = (state.currentHistoryHost || '').trim();
  if (!host) return toast('没有可用的域名', 'warn');
  showTrend(host).then(() => {
    const el = $('#trendBox');
    const main = document.querySelector('.main');
    if (el && main) {
      const top = el.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop;
      main.scrollTo({ top: Math.max(0, top - 20), behavior: 'smooth' });
    }
  });
});

/* ============================================
   CSV 导出
   ============================================ */
function download(url, filename) {
  const a = document.createElement('a');
  a.href = rel(url);
  a.download = filename || '';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => a.remove(), 200);
}

$('#btnExportSummary')?.addEventListener('click', () => {
  const q = state.histQuery ? '?host=' + encodeURIComponent(state.histQuery) : '';
  download('/api/export/summary' + q, 'boce-history.csv');
  toast('已导出历史汇总', 'ok');
});

$('#btnExportCsv')?.addEventListener('click', () => {
  const id = state.currentHistoryId;
  if (!id) return toast('没有可导出的记录', 'warn');
  download(`/api/history/${id}/csv`, `boce-${id}.csv`);
  toast('已导出 CSV', 'ok');
});

/* ============================================
   每日波点领取
   ============================================ */
async function loadDailyStatus() {
  try {
    const s = await api('/api/daily/status');
    renderDailyBar(s);
    return s;
  } catch { return null; }
}

function renderDailyBar(s) {
  const bar = $('#dailyBar');
  if (!bar) return;
  const list = s.accounts || [];
  const claimed = list.filter((a) => a.claimedToday).length;
  const total = list.length;
  const pts = list.reduce((n, a) => n + (a.point || 0), 0);
  const noPwd = list.filter((a) => !a.hasPassword).length;

  const txt = $('#dailyText');
  const btn = $('#btnClaim');

  if (!total) {
    txt.innerHTML = '<span class="d-strong">暂无账号</span>';
    btn.disabled = true;
    return;
  }

  const allDone = claimed >= list.filter((a) => a.hasPassword).length && noPwd <= (total - claimed);
  txt.innerHTML = `今日已领 <b class="d-strong">${claimed}</b>/${total}` +
    ` · 余额 <b class="d-point">${pts}</b> 波点` +
    (noPwd ? ` · <span class="d-warn" title="这些账号没有保存密码，无法自动登录">${noPwd} 个无密码</span>` : '');

  btn.disabled = false;
  btn.textContent = claimed >= total ? '再领一次' : '领取';
  bar.classList.toggle('done', claimed > 0);
}

$('#btnClaim')?.addEventListener('click', async () => {
  const btn = $('#btnClaim');
  const old = btn.textContent;
  btn.disabled = true;
  let sec = 0;
  btn.textContent = '领取中 0s';
  const tick = setInterval(() => { sec++; btn.textContent = `领取中 ${sec}s`; }, 1000);
  try {
    const r = await api('/api/daily/claim', { method: 'POST', body: { force: true } });
    const parts = [];
    if (r.claimed) parts.push(`登录领取 ${r.claimed} 个`);
    if (r.observed) parts.push(`观察 ${r.observed} 个`);
    if (r.failed) parts.push(`失败 ${r.failed} 个`);
    const gained = (r.results || []).reduce((n, x) => n + Math.max(0, x.gained || 0), 0);
    toast(gained > 0 ? `已领取，新增 ${gained} 波点` : (parts.join('，') || '已完成'),
      r.failed ? 'warn' : 'ok');
    await loadDailyStatus();
    await loadAccounts();
  } catch (e) {
    toast(e.message, 'err');
  } finally {
    clearInterval(tick);
    btn.disabled = false;
    btn.textContent = old;
  }
});
