'use strict';
/**
 * 历史拨测记录
 *
 * 存储策略：
 *  - 索引文件 data/history/index.json（列表，轻量）
 *  - 明细文件 data/history/<id>.json（含 92 行完整结果）
 *  - 目的：额度用完后仍可回看；同域名多次检测可对比
 */
const fs = require('fs');
const path = require('path');
const space = require('./space');

/** 数据目录随当前访问口令的空间变化 */
const dir = () => path.join(space.current(), 'history');
const indexPath = () => path.join(dir(), 'index.json');

function ensure() {
  const d = dir();
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function loadIndex() {
  ensure();
  if (!fs.existsSync(indexPath())) return { seq: 1, items: [] };
  try {
    const j = JSON.parse(fs.readFileSync(indexPath(), 'utf8'));
    if (!Array.isArray(j.items)) j.items = [];
    if (!j.seq) j.seq = j.items.length + 1;
    return j;
  } catch {
    return { seq: 1, items: [] };
  }
}

function saveIndex(idx) {
  ensure();
  const tmp = indexPath() + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(idx, null, 2));
  fs.renameSync(tmp, indexPath());
}

/** 保存一次拨测记录，返回摘要 */
function save(result) {
  const idx = loadIndex();
  const id = 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  const hosts = (result.perHost || []).map((h) => ({
    host: h.host,
    count: h.stat?.count ?? h.rows?.length ?? 0,
    avg: h.stat?.avg ?? null,
    min: h.stat?.min ?? null,
    max: h.stat?.max ?? null,
    // ok    = 2xx/3xx 通过数（内容可用）
    ok: (h.rows || []).filter((r) => r.httpCode >= 200 && r.httpCode < 400).length,
    // alive = 拿到任意 HTTP 响应（含 4xx/5xx），用于计算连通率
    alive: (h.rows || []).filter((r) => Number(r.httpCode) > 0).length,
    timeId: h.timeId || '',
    resultUrl: h.resultUrl || '',
  }));

  const summary = {
    id,
    createdAt: new Date().toISOString(),
    hosts,
    hostNames: hosts.map((h) => h.host),
    nodeType: result.nodeType || '4',
    isp: result.isp || [],
    account: result.account || null,
    ok: !!result.ok,
    source: result.source || 'probe',   // probe | import
    totalRows: hosts.reduce((s, h) => s + h.count, 0),
  };

  // 明细
  const detail = {
    ...summary,
    perHost: (result.perHost || []).map((h) => ({
      host: h.host,
      stat: h.stat,
      rows: h.rows,
      timeId: h.timeId,
      resultUrl: h.resultUrl,
    })),
  };
  fs.writeFileSync(path.join(dir(), id + '.json'), JSON.stringify(detail));

  idx.items.unshift(summary);
  // 只保留最近 500 条索引
  if (idx.items.length > 500) {
    const dropped = idx.items.splice(500);
    for (const d of dropped) {
      try { fs.unlinkSync(path.join(dir(), d.id + '.json')); } catch {}
    }
  }
  saveIndex(idx);
  return summary;
}

function list({ host, limit = 50, offset = 0 } = {}) {
  const idx = loadIndex();
  let items = idx.items;
  if (host) {
    const q = host.toLowerCase();
    items = items.filter((it) => it.hostNames.some((h) => h.toLowerCase().includes(q)));
  }
  return { total: items.length, items: items.slice(offset, offset + limit) };
}

/** 读取明细 */
function get(id) {
  ensure();
  const f = path.join(dir(), id + '.json');
  if (!fs.existsSync(f)) return null;
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; }
}

function remove(id) {
  const idx = loadIndex();
  const i = idx.items.findIndex((x) => x.id === id);
  if (i < 0) return false;
  idx.items.splice(i, 1);
  saveIndex(idx);
  try { fs.unlinkSync(path.join(dir(), id + '.json')); } catch {}
  return true;
}

/** 某域名的历史趋势 */
function trend(host, limit = 30) {
  const idx = loadIndex();
  const rows = [];
  for (const it of idx.items) {
    const h = it.hosts.find((x) => x.host === host);
    if (!h) continue;
    rows.push({
      id: it.id, createdAt: it.createdAt, avg: h.avg, min: h.min, max: h.max,
      count: h.count, ok: h.ok, resultUrl: h.resultUrl,
    });
    if (rows.length >= limit) break;
  }
  return rows.reverse();
}

/** 清空全部历史（含明细文件） */
function clear() {
  ensure();
  const idx = loadIndex();
  const n = idx.items.length;
  for (const it of idx.items) {
    try { fs.unlinkSync(path.join(dir(), it.id + '.json')); } catch {}
  }
  saveIndex({ seq: 1, items: [] });
  return n;
}

/** 按条件清理：只保留指定来源 */
function clearBySource(sources) {
  ensure();
  const idx = loadIndex();
  const keep = [];
  let removed = 0;
  for (const it of idx.items) {
    if (sources.includes(it.source)) {
      try { fs.unlinkSync(path.join(dir(), it.id + '.json')); } catch {}
      removed++;
    } else keep.push(it);
  }
  idx.items = keep;
  saveIndex(idx);
  return removed;
}

module.exports = { save, list, get, remove, trend, clear, clearBySource };
