# 使用 Node.js 18 版本
FROM node:18 AS build-stage

WORKDIR /app

COPY package*.json ./

# 删除 package-lock.json 并重新安装
RUN rm -f package-lock.json && npm install

COPY . .

RUN npm run build

# 使用 nginx 作为生产环境
FROM nginx:alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]