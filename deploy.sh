#!/usr/bin/env bash
set -euo pipefail

# ========== 配置区域（修改这里） ==========
REMOTE_USER=""     # 例: docker
REMOTE_HOST=""         # 例: 192.168.1.100
REMOTE_PORT="22"       # SSH 端口
REMOTE_PATH="/usr/Projects/web-tools"         # 例: /usr/Projects/web-tools
# ==========================================

if [ -z "$REMOTE_USER" ] || [ -z "$REMOTE_HOST" ]; then
  echo "❌ 请先编辑 deploy.sh 填写 REMOTE_USER 和 REMOTE_HOST"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "📦 同步文件到 ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH} ..."

rsync -avz --delete \
  --exclude='.git' \
  --exclude='.DS_Store' \
  --exclude='.idea' \
  --exclude='.venv' \
  --exclude='.claude' \
  --exclude='node_modules' \
  --exclude='.gitignore' \
  --exclude='deploy.sh' \
  --exclude='deploy-private.sh' \
  -e "ssh -p ${REMOTE_PORT}" \
  "${SCRIPT_DIR}/" \
  "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/"

echo "🔐 设置权限 ..."
ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" "chmod -R 755 ${REMOTE_PATH}"

echo "✅ 部署完成！"
