ARG NODE_IMAGE=node:20-alpine
FROM ${NODE_IMAGE}

# 内网构建机出不去 docker.io，Jenkins 用 --build-arg NODE_IMAGE 指向 Harbor 内的 node 镜像。
# 本机/zzw 直接 docker build 时用默认值即可。
#
# 依赖不走 npm ci：构建容器里没有外网 DNS（npm 报 getaddrinfo EAI_AGAIN 后崩溃，
# 表现为 node_modules 只剩空目录），改为解包随仓库提交的 server/vendor/node_modules.tgz。
# 改了依赖请先在有外网的机器执行：bash server/scripts/vendor-deps.sh

WORKDIR /app

COPY package.json package-lock.json ./
COPY vendor/node_modules.tgz /tmp/node_modules.tgz
# 解包后校验一次，避免坏包一路带到运行期（表现是容器反复重启、Cannot find module）
RUN tar -xzf /tmp/node_modules.tgz -C /app && rm -f /tmp/node_modules.tgz \
 && node -e "require.resolve('express')"

COPY boce ./boce

ENV NODE_ENV=production
ENV TZ=Asia/Shanghai

EXPOSE 8899
CMD ["node", "boce/index.js"]
