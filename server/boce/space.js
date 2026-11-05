'use strict';
/**
 * 空间隔离
 *
 * 每个访问口令对应一个独立空间：data/spaces/<sid>/，互不可见。
 * sid 由口令慢哈希派生，因此同一口令在任何设备上都会落到同一空间，
 * 也意味着口令无法找回——忘了就是新空间。
 *
 * 目录用 AsyncLocalStorage 注入，避免给每个业务函数加参数，
 * 同时保证并发请求不会串空间。
 */
const { AsyncLocalStorage } = require('async_hooks');
const fs = require('fs');
const path = require('path');

const ROOT = process.env.BOCE_DATA_DIR || path.join(__dirname, '..', '..', 'data', 'boce');
const SPACES = path.join(ROOT, 'spaces');

const als = new AsyncLocalStorage();

const dirOf = (sid) => path.join(SPACES, sid);

/** 当前请求所属空间目录，未登录上下文调用会抛错 */
function current() {
  const sid = als.getStore();
  if (!sid) throw new Error('缺少空间上下文');
  return dirOf(sid);
}

function run(sid, fn) {
  return als.run(sid, fn);
}

function exists(sid) {
  return fs.existsSync(dirOf(sid));
}

function ensure(sid) {
  fs.mkdirSync(dirOf(sid), { recursive: true });
}

/** 列出所有空间（供每日定时任务遍历） */
function list() {
  if (!fs.existsSync(SPACES)) return [];
  return fs
    .readdirSync(SPACES, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

module.exports = { ROOT, current, run, exists, ensure, list };
