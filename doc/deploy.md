# 使用 Docker 部署小紫书前端项目

根据项目结构分析，这是一个基于 Vue 3 + Vite 的前端项目。目前项目中还没有 Docker 配置文件，我将为您提供完整的 Docker 部署方案。

## 1. 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile:d:/repo/purple_note_frontend/PurpleNoteFrontend/Dockerfile
# 使用官方 Node.js 镜像作为构建环境
FROM node:18-alpine as build-stage

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 使用 nginx 作为生产环境
FROM nginx:alpine as production-stage

# 复制构建产物到 nginx 目录
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制 nginx 配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
```

## 2. 创建 nginx 配置文件

创建 `nginx.conf` 文件：

```nginx:d:/repo/purple_note_frontend/PurpleNoteFrontend/nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    sendfile        on;
    keepalive_timeout  65;
    
    # 启用 gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    server {
        listen       80;
        server_name  localhost;
        
        # 设置根目录
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        
        # 处理 Vue Router 的 history 模式
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # API 代理到后端服务
        location /api/ {
            proxy_pass http://backend:8080/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

## 3. 创建 .dockerignore 文件

创建 `.dockerignore` 文件以排除不必要的文件：

```plaintext:d:/repo/purple_note_frontend/PurpleNoteFrontend/.dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.vscode
.idea
*.log
dist
```

## 4. 创建 docker-compose.yml（可选）

如果需要与后端服务一起部署，可以创建 `docker-compose.yml`：

```yaml:d:/repo/purple_note_frontend/PurpleNoteFrontend/docker-compose.yml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - purple-note-network

  # 后端服务配置（需要根据实际后端项目调整）
  backend:
    # image: your-backend-image:latest
    # 或者如果有后端 Dockerfile
    # build: ../backend
    ports:
      - "8080:8080"
    networks:
      - purple-note-network
    environment:
      - NODE_ENV=production

networks:
  purple-note-network:
    driver: bridge
```

## 5. 部署命令

### 方式一：直接使用 Docker

```bash
# 构建镜像
docker build -t purple-note-frontend .

# 运行容器
docker run -d -p 3000:80 --name purple-note-frontend purple-note-frontend
```

### 方式二：使用 docker-compose

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f frontend

# 停止服务
docker-compose down
```

## 6. 环境变量配置（可选）

如果需要配置不同环境的 API 地址，可以创建 `.env` 文件：

```env:d:/repo/purple_note_frontend/PurpleNoteFrontend/.env.production
VITE_API_BASE_URL=http://your-backend-domain.com
VITE_APP_TITLE=小紫书
```

然后在 `vite.config.js` 中使用：

```javascript:d:/repo/purple_note_frontend/PurpleNoteFrontend/vite.config.js
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^/api/, '')
        }
      }
    }
  }
})
```

## 7. 访问应用

部署完成后，可以通过以下地址访问：
- 本地访问：http://localhost:3000
- 如果部署到服务器，将 localhost 替换为服务器 IP 地址

## 注意事项

1. **后端服务**：确保后端服务已经部署并可访问
2. **CORS 配置**：后端需要正确配置 CORS 以允许前端访问
3. **环境变量**：根据实际部署环境调整 API 地址
4. **SSL 证书**：生产环境建议配置 HTTPS
5. **资源优化**：可以考虑使用 CDN 加速静态资源加载

这样就完成了小紫书前端项目的 Docker 化部署配置。
        