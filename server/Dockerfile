FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY boce ./boce

ENV NODE_ENV=production
ENV TZ=Asia/Shanghai

EXPOSE 8899
CMD ["node", "boce/index.js"]
