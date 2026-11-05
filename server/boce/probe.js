'use strict';
/**
 * 拨测调度器：选账号 → 建任务 → 收结果 → 统计聚合
 *
 * 额度规则（实测）：按域名个数计，与节点数无关。
 * 账号选择：优先 quota.left 最大且未禁用的账号；额度耗尽自动换下一个。
 */
const { buildTask, waitTask, fetchResult } = require('./boce');
const accounts = require('./accounts');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 挑账号：left 最大优先 */
function pickAccount(excludeIds = new Set()) {
  const list = accounts.load().accounts
    .filter((a) => !a.disabled && !excludeIds.has(a.id))
    .map((a) => ({ ...a, left: a.quota?.left ?? 0 }))
    .sort((a, b) => b.left - a.left);
  return list[0] || null;
}

const PROVINCES = [
  '安徽', '北京', '福建', '甘肃', '广东', '广西', '贵州', '海南', '河北', '河南',
  '黑龙江', '湖北', '湖南', '吉林', '江苏', '江西', '辽宁', '内蒙古', '宁夏', '青海',
  '山东', '山西', '陕西', '上海', '四川', '天津', '西藏', '新疆', '云南', '浙江', '重庆',
];
const SEVEN_AREA = {
  hua_dong: '华东', hua_bei: '华北', hua_nan: '华南', hua_zhong: '华中',
  xi_bei: '西北', xi_nan: '西南', dong_bei: '东北',
};
const AREA_OF_PROVINCE = {
  安徽: 'hua_dong', 北京: 'hua_bei', 福建: 'hua_dong', 甘肃: 'xi_bei', 广东: 'hua_nan',
  广西: 'hua_nan', 贵州: 'xi_nan', 海南: 'hua_nan', 河北: 'hua_bei', 河南: 'hua_zhong',
  黑龙江: 'dong_bei', 湖北: 'hua_zhong', 湖南: 'hua_zhong', 吉林: 'dong_bei', 江苏: 'hua_dong',
  江西: 'hua_dong', 辽宁: 'dong_bei', 内蒙古: 'hua_bei', 宁夏: 'xi_bei', 青海: 'xi_bei',
  山东: 'hua_dong', 山西: 'hua_bei', 陕西: 'xi_bei', 上海: 'hua_dong', 四川: 'xi_nan',
  天津: 'hua_bei', 西藏: 'xi_nan', 新疆: 'xi_bei', 云南: 'xi_nan', 浙江: 'hua_dong',
  重庆: 'xi_nan',
};

/** 把原始 rows 聚合成前端要的统计结构（对齐 boce 结果页） */
function aggregate(rows, allNodes) {
  const ispName = { 1: '电信', 2: '移动', 3: '联通', 10: '海外', 11: '港澳台' };
  const alive = rows.filter((r) => r.totalCost != null && r.httpCode !== undefined);

  // 按 ISP 统计
  const byIsp = { 0: [], 1: [], 2: [], 3: [], 10: [], 11: [] };
  for (const r of alive) {
    const k = r.isp ?? 1;
    (byIsp[k] = byIsp[k] || []).push(r);
  }

  // 按省统计
  const byProvince = {};
  for (const r of alive) {
    const p = r.province_name || '';
    if (!byProvince[p]) byProvince[p] = [];
    byProvince[p].push(r);
  }

  // 按七大区
  const byArea = {};
  for (const r of alive) {
    const p = r.province_name || '';
    const a = AREA_OF_PROVINCE[p] || r.continent_type || 'unknown';
    (byArea[a] = byArea[a] || []).push(r);
  }

  const stat = (arr) => {
    if (!arr.length) return null;
    const costs = arr.map((r) => r.totalCost).filter((v) => typeof v === 'number' && v > 0);
    if (!costs.length) return null;
    let minI = 0, maxI = 0;
    costs.forEach((v, i) => { if (v < costs[minI]) minI = i; if (v > costs[maxI]) maxI = i; });
    const minRow = arr[alive.indexOf(arr[0])] && null;
    return {
      min: { value: costs[minI], name: arr[minI]?.province_name, ispName: arr[minI]?.isp_name },
      max: { value: costs[maxI], name: arr[maxI]?.province_name, ispName: arr[maxI]?.isp_name },
      avg: costs.reduce((a, b) => a + b, 0) / costs.length,
      count: arr.length,
    };
  };

  const minMaxAvg = [];
  const allStat = stat(alive);
  if (allStat) minMaxAvg.push({ name: '全部', isp: 0, areaType: '0', ...allStat });
  for (const k of [1, 2, 3, 10, 11]) {
    const s = stat(byIsp[k] || []);
    if (s) minMaxAvg.push({ name: ispName[k], isp: k, areaType: String(k), ...s });
  }
  for (const [a, arr] of Object.entries(byArea)) {
    const s = stat(arr);
    if (s) minMaxAvg.push({ name: SEVEN_AREA[a] || a, isp: 0, areaType: a, ...s });
  }

  // 省份热力数据（地图用）
  const provinceArr = Object.entries(byProvince).map(([name, arr]) => {
    const costs = arr.map((r) => r.totalCost).filter((v) => typeof v === 'number' && v > 0);
    const avg = costs.length ? costs.reduce((a, b) => a + b, 0) / costs.length : null;
    return { name, value: avg == null ? null : +avg.toFixed(3), seven_area_name: AREA_OF_PROVINCE[name] || '', count: arr.length };
  });

  // 落地 IP 分布
  const ipMap = {};
  for (const r of rows) {
    if (!r.ip) continue;
    if (!ipMap[r.ip]) ipMap[r.ip] = { ip: r.ip, count: 0, isp: new Set(), from: r.ip_from || '', pollute: false };
    ipMap[r.ip].count++;
    if (r.isp) ipMap[r.ip].isp.add(r.isp);
  }
  const ipPre = Object.values(ipMap)
    .map((x) => ({ ip: x.ip, is_pollute: x.pollute, isp: [...x.isp], pre: +((x.count / rows.length) * 100).toFixed(1), count: x.count, from: x.from }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 状态码分布
  const codeDist = {};
  for (const r of rows) {
    const c = r.httpCode ?? '-';
    codeDist[c] = (codeDist[c] || 0) + 1;
  }

  const ipIsp = [1, 2, 3].map((k) => ({
    isp: ispName[k], key: k, count: new Set(rows.filter((r) => r.isp === k).map((r) => r.ip)).size,
  })).filter((x) => x.count > 0);

  const times = alive.map((r) => r.totalCost).filter((v) => typeof v === 'number' && v > 0).sort((a, b) => a - b);

  return {
    minMaxAvg,
    provinceArr,
    ipPre,
    ipIsp,
    ipPollute: rows.filter((r) => r.is_pollute_ip && Object.values(r.is_pollute_ip).some(Boolean)).length,
    count: rows.length,
    total: rows.length,
    codeDist,
    p50: times.length ? times[Math.floor(times.length * 0.5)] : null,
    p95: times.length ? times[Math.floor(times.length * 0.95)] : null,
    avg: times.length ? times.reduce((a, b) => a + b, 0) / times.length : null,
    max: times.length ? times[times.length - 1] : null,
    min: times.length ? times[0] : null,
  };
}

/**
 * 执行拨测
 * @param {object} opt
 * @param {string[]} opt.hosts      目标域名（可多个，一次批量）
 * @param {string[]} opt.isp        线路 ['1','2','3']
 * @param {string}   opt.nodeType   '4'=全节点(92) '1'=精简(12)
 * @param {function} opt.onEvent    进度回调 {type, ...}
 *
 * 注意（实测）：超额账号的 build_url 仍可能返回 code=200 但任务不执行，
 * 表现为 WS 收不到任何结果。因此 here 以「是否真的收到结果」为准，
 * 收不到就判定该账号不可用并换号重试。
 */
async function runProbe({ hosts, isp = ['1', '2', '3'], nodeType = '4', type = 'http', onEvent = () => {} }) {
  const result = { startedAt: new Date().toISOString(), hosts, isp, nodeType, perHost: [], account: null, errors: [] };

  // 候选账号：按剩余额度降序；额度为 0 的排最后（仍保留机会，因为计数可能不准）
  const pool = accounts.load().accounts
    .filter((a) => !a.disabled)
    .map((a) => ({ ...a, left: a.quota?.left ?? 0 }));

  // 优先后额度 > 0 的账号；额度 0 的排最后，仅在全部为 0 时才尝试（计数可能不准）
  const withQuota = pool.filter((a) => a.left > 0).sort((a, b) => b.left - a.left);
  const noQuota = pool.filter((a) => a.left <= 0).sort((a, b) => b.left - a.left);
  const candidates = [...withQuota, ...noQuota];

  if (!candidates.length) {
    result.ok = false;
    result.error = '没有可用账号，请先添加账号并确保未被停用';
    onEvent({ type: 'error', msg: result.error });
    return result;
  }

  if (!withQuota.length) {
    const tip = '所有账号今日额度均已耗尽（次日 00:00 重置）。可添加新账号继续。';
    onEvent({ type: 'log', msg: tip });
    result.ok = false;
    result.error = tip;
    result.quotaExhausted = true;
    onEvent({ type: 'quota_exhausted', msg: tip });
    onEvent({ type: 'error', msg: tip });
    return result;
  }

  let task = null;
  let rows = null;
  let usedAcc = null;

  let rateTries = 0;
  for (const acc of candidates) {
    onEvent({ type: 'log', msg: `尝试账号 #${acc.id} ${acc.label}（剩余 ${acc.left} 次）` });

    let t;
    try {
      t = await buildTask({
        type, host: hosts, isp, node_type: nodeType,
        batch: hosts.length > 1, get_token: 1,
      }, { cookie: acc.cookie, ua: acc.ua });
    } catch (e) {
      onEvent({ type: 'log', msg: `账号 #${acc.id} 建任务失败：${e.message}（code=${e.code}）` });
      result.errors.push({ account: acc.id, code: e.code, message: e.message });
      if (e.limit !== undefined) {
        accounts.updateQuota(acc.id, {
          limit: e.limit, count: e.count,
          left: Math.max(0, (e.limit ?? 0) - (e.count ?? 0)),
          point: e.point,
        });
      }
      // code=1 是频控：退避等待后重试同一账号，而不是直接换号
      if (e.code === 1) {
        rateTries += 1;
        if (rateTries <= 3) {
          const wait = 3000 * Math.pow(2, rateTries - 1); // 3s / 6s / 12s
          onEvent({ type: 'log', msg: `账号 #${acc.id} 触发频控，${wait / 1000}s 后重试（${rateTries}/3）` });
          await sleep(wait);
          candidates.unshift(acc);
          continue;
        }
        onEvent({ type: 'log', msg: `账号 #${acc.id} 频控重试 3 次仍失败，换下一个账号` });
      }
      await sleep(2500);
      continue;
    }

    onEvent({ type: 'log', msg: `账号 #${acc.id} 任务已下发，${t.nodeCount} 个节点` });
    onEvent({ type: 'quota', limit: t.limit, count: t.count, left: Math.max(0, (t.limit ?? 0) - (t.count ?? 0)), point: t.point });

    onEvent({ type: 'status', msg: '正在收集节点结果…' });
    const streamed = [];
    const got = await waitTask(t.tokens, {
      timeoutMs: 120_000,
      // 每批实时推给前端，前端可立即渲染增量结果
      onBatch: (fresh, total) => {
        streamed.push(...fresh);
        onEvent({ type: 'batch', rows: fresh, total });
      },
      onProgress: (n) => onEvent({ type: 'progress', got: n }),
    });

    // 更新额度（以服务端返回的 count 为准）
    accounts.updateQuota(acc.id, {
      limit: t.limit, count: t.count,
      left: Math.max(0, (t.limit ?? 0) - (t.count ?? 0)),
      point: t.point,
    });

    if (got.length) {
      if (streamed.length === 0) {
        // 结果页兜底路径：一次性推送全部
        onEvent({ type: 'batch', rows: got, total: got.length });
      }
      task = t; rows = got; usedAcc = acc;
      onEvent({ type: 'log', msg: `账号 #${acc.id} 收到 ${got.length} 条结果` });
      break;
    }

    onEvent({ type: 'log', msg: `账号 #${acc.id} 未返回任何结果（额度可能已耗尽），换下一个账号` });
    result.errors.push({ account: acc.id, code: 'NO_RESULT', message: '任务未产生结果，疑似额度耗尽' });
  }

  if (!task || !rows || !rows.length) {
    result.ok = false;
    result.error = '所有账号均未能返回结果（额度耗尽或触发频控）';
    onEvent({ type: 'error', msg: result.error });
    return result;
  }

  result.account = { id: usedAcc.id, label: usedAcc.label, uid: usedAcc.uid };

  // 按 host 分组
  const groups = {};
  for (const r of rows) {
    const k = (r.host || r.domain || '').replace(/^https?:\/\//, '');
    (groups[k] = groups[k] || []).push(r);
  }

  const hostList = Object.keys(groups).length ? Object.keys(groups) : hosts;
  for (const h of hostList) {
    const r = groups[h] || [];
    const stat = aggregate(r, task.nodes);
    const tid = r[0]?.time_id || task.tokens[0];
    result.perHost.push({
      host: h,
      rows: r,
      stat,
      timeId: tid,
      resultUrl: `https://www.boce.com/http/${tid}.html`,
    });
  }

  result.ok = true;
  result.finishedAt = new Date().toISOString();
  result.nodes = task.nodes;
  onEvent({ type: 'done', result });
  return result;
}

module.exports = { runProbe, aggregate, pickAccount, PROVINCES, SEVEN_AREA, AREA_OF_PROVINCE };
