#!/usr/bin/env bash
# 重新生成 server/vendor/node_modules.tgz
#
# 内网构建机没有外网 DNS，镜像构建不能跑 npm ci，依赖改为随仓库打包。
# 只要改了 package.json / package-lock.json，就必须在有外网的机器上执行本脚本，
# 并把 vendor/node_modules.tgz 一起提交，否则线上/内网构建出来的镜像会缺依赖。
#
# 用法：bash server/scripts/vendor-deps.sh
set -euo pipefail
cd "$(dirname "$0")/.."

REGISTRY="${NPM_REGISTRY:-https://mirrors.huaweicloud.com/repository/npm/}"

rm -rf node_modules vendor
npm ci --omit=dev --registry="$REGISTRY"
mkdir -p vendor
tar -czf vendor/node_modules.tgz node_modules
rm -rf node_modules
ls -lh vendor/node_modules.tgz
