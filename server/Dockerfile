ARG NODE_IMAGE=node:20-alpine
FROM ${NODE_IMAGE}

# 内网构建机出不去 docker.io，Jenkins 用 --build-arg NODE_IMAGE 指向 Harbor 内的 node 镜像。
# 本机/zzw 直接 docker build 时用默认值即可。
ARG NPM_REGISTRY=https://registry.npmmirror.com

WORKDIR /app

COPY package.json package-lock.json ./
# 内网构建机出现过 npm ci 返回 0、node_modules 只有空目录的情况（依赖文件没落盘），
# 这里显式校验一次，让问题停在构建阶段，而不是部署后容器重启循环。
RUN npm ci --omit=dev --registry=${NPM_REGISTRY} \
 && node -e "require.resolve('express')"

COPY boce ./boce

ENV NODE_ENV=production
ENV TZ=Asia/Shanghai

EXPOSE 8899
CMD ["node", "boce/index.js"]
