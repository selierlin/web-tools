'use strict';
/**
 * 把旧版 boce-tool/data 迁进指定口令对应的空间
 *
 * 旧版是全局单池，新版按访问口令分空间，因此旧数据必须落到
 * 「你第一次输入的那个口令」算出的空间里，否则会看不见。
 *
 * 用法：
 *   BOCE_SECRET=xxx BOCE_DATA_DIR=/path/to/data/boce \
 *     node server/scripts/migrate-legacy.js /path/to/boce-tool/data '你的访问口令'
 *
 * 注意：BOCE_SECRET 必须与线上一致，否则算出的空间 ID 对不上。
 */
const fs = require('fs');
const path = require('path');
const space = require('../boce/space');
const { spaceIdOf } = require('../boce/auth');

const [, , legacyDir, password] = process.argv;

if (!legacyDir || !password) {
  console.error('用法: node migrate-legacy.js <旧 data 目录> <访问口令>');
  process.exit(1);
}
if (!process.env.BOCE_SECRET) {
  console.error('缺少 BOCE_SECRET：必须与线上一致，否则空间 ID 对不上');
  process.exit(1);
}
if (!fs.existsSync(legacyDir)) {
  console.error('旧数据目录不存在:', legacyDir);
  process.exit(1);
}

const sid = spaceIdOf(password);
const target = path.join(space.ROOT, 'spaces', sid);

const items = ['accounts.json', 'daily-claim.json', 'claim-history', 'history'];
const copied = [];

fs.mkdirSync(target, { recursive: true });
for (const name of items) {
  const src = path.join(legacyDir, name);
  if (!fs.existsSync(src)) continue;
  fs.cpSync(src, path.join(target, name), { recursive: true });
  copied.push(name);
}

console.log(`空间 ID: ${sid.slice(0, 8)}  →  ${target}`);
console.log(copied.length ? `已迁入: ${copied.join(', ')}` : '旧目录里没有可迁的数据');
console.log('请用同一个口令登录核对账号与历史是否完整。');
