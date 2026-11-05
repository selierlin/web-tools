ARG NODE_IMAGE=node:20-alpine
FROM ${NODE_IMAGE}

# 内网构建机出不去 docker.io，也没有外网 DNS（npm 报 getaddrinfo EAI_AGAIN 后崩溃），
# 所以两项外部依赖都靠本地资源：
#   基础镜像：Jenkins 用 --build-arg NODE_IMAGE 指向 Harbor 内的 node 镜像
#   npm 依赖：解包随仓库提交的 server/vendor/node_modules.tgz
#             改了依赖先在有外网的机器执行 bash server/scripts/vendor-deps.sh
#
# 构建上下文是仓库根目录（静态页一起打进镜像），不是 server/。
# 新增顶层静态目录/文件时，记得在下面补一条 COPY，否则线上 404。

WORKDIR /app

COPY server/package.json server/package-lock.json ./
COPY server/vendor/node_modules.tgz /tmp/node_modules.tgz
# 解包后校验一次，避免坏包一路带到运行期（表现是容器反复重启、Cannot find module）
RUN tar -xzf /tmp/node_modules.tgz -C /app && rm -f /tmp/node_modules.tgz \
 && node -e "require.resolve('express')"

COPY server/boce ./boce

# 前端静态页随镜像发布，由 Node 直接托管（BOCE_WEB_DIR），部署不再 rsync 到宿主机
COPY *.html ./web/
COPY boce ./web/boce
COPY styles ./web/styles
COPY scripts ./web/scripts
COPY vendor ./web/vendor
COPY json ./web/json
COPY map ./web/map

ENV NODE_ENV=production \
    TZ=Asia/Shanghai \
    BOCE_WEB_DIR=/app/web

EXPOSE 56091
CMD ["node", "boce/index.js"]
