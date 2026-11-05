ARG NODE_IMAGE=node:20-alpine
FROM ${NODE_IMAGE}

# 内网构建机出不去 docker.io，也没有外网 DNS（npm 报 getaddrinfo EAI_AGAIN 后崩溃），
# 所以两项外部依赖都靠本地资源：
#   基础镜像：Jenkins 用 --build-arg NODE_IMAGE 指向 Harbor 内的 node 镜像
#   npm 依赖：解包随仓库提交的 server/vendor/node_modules.tgz
#             改了依赖先在有外网的机器执行 bash server/scripts/vendor-deps.sh
#
# 构建上下文是仓库根目录（静态页一起打进镜像），不是 server/。

WORKDIR /app

COPY server/package.json server/package-lock.json ./
COPY server/vendor/node_modules.tgz /tmp/node_modules.tgz
# 解包后校验一次，避免坏包一路带到运行期（表现是容器反复重启、Cannot find module）
RUN tar -xzf /tmp/node_modules.tgz -C /app && rm -f /tmp/node_modules.tgz \
 && node -e "require.resolve('express')"

COPY server/boce ./boce

# 前端静态页随镜像发布，由 Node 直接托管（BOCE_WEB_DIR），部署不再 rsync 到宿主机。
# 整个上下文一次性拷贝再剔除后端源码，而不是逐个目录 COPY：main 与 lite 的静态目录
# 并不一致（lite 没有 json/ 等），逐目录 COPY 缺一个就构建失败。
COPY . ./web/
# server 是后端源码，不能留在静态目录里（express.static 会直接下发这些文件）
RUN rm -rf /app/web/server

ENV NODE_ENV=production \
    TZ=Asia/Shanghai \
    BOCE_WEB_DIR=/app/web

EXPOSE 56095
CMD ["node", "boce/index.js"]
