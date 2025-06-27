# 小紫书前端项目 (Purple Note Frontend)

一个基于 Vue 3 的现代化社交分享平台前端应用，类似小红书的内容分享社区。

## 📱 项目简介

小紫书是一个内容分享社交平台，用户可以发布图片、视频等多媒体内容，与其他用户互动交流。项目采用现代化的前端技术栈，提供流畅的用户体验和美观的界面设计。

## ✨ 核心功能

### 🔐 用户模块
- 用户注册/登录
- 个人主页查看/编辑
- 头像上传

### 📝 内容模块
- 内容发布（支持媒体上传）
- 内容浏览（分页加载）
- 内容详情查看（按时间降序）
- 具体用户内容详情查看
- 内容编辑/删除

### ❤️ 点赞模块
- 内容点赞/取消点赞
- 点赞状态查询
- 用户点赞列表
- 点赞排行榜

### 👥 关注模块
- 关注/取消关注用户
- 关注状态查询
- 关注列表/粉丝列表
- 共同关注
- 关注数/粉丝数统计

## 🛠️ 技术栈

### 核心框架
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 现代化构建工具
- **Vue Router 4** - 官方路由管理器
- **Pinia** - 状态管理库

### UI 组件库
- **Element Plus** - Vue 3 组件库
- **Tailwind CSS** - 原子化 CSS 框架
- **Element Plus Icons** - 图标库

### 网络请求
- **Axios** - HTTP 客户端库
- 支持跨域访问（CORS）
- 请求/响应拦截器

### 开发工具
- **PostCSS** - CSS 后处理器
- **Autoprefixer** - CSS 前缀自动添加

## 📁 项目结构

```
src/
├── api/                 # API 接口封装
│   ├── content.js       # 内容相关接口
│   ├── follow.js        # 关注相关接口
│   ├── like.js          # 点赞相关接口
│   ├── request.js       # 请求配置
│   └── user.js          # 用户相关接口
├── assets/              # 静态资源
├── components/          # 公共组件
│   ├── ContentCard.vue      # 内容卡片
│   ├── ContentGrid.vue      # 内容网格
│   ├── EmptyState.vue       # 空状态
│   ├── LoadingState.vue     # 加载状态
│   ├── NavigationBar.vue    # 导航栏
│   ├── PageHeader.vue       # 页面头部
│   ├── TabNavigation.vue    # 标签导航
│   ├── UserProfileHeader.vue # 用户资料头部
│   └── WaterfallContainer.vue # 瀑布流容器
├── layouts/             # 布局组件
│   ├── MainLayout.vue   # 主布局
│   └── PublishLayout.vue # 发布页布局
├── router/              # 路由配置
├── stores/              # 状态管理
│   ├── content.js       # 内容状态
│   └── user.js          # 用户状态
├── views/               # 页面组件
│   ├── ContentDetail.vue # 内容详情
│   ├── EditProfile.vue   # 编辑资料
│   ├── Home.vue          # 首页
│   ├── Hot.vue           # 热门
│   ├── Login.vue         # 登录
│   ├── NotFound.vue      # 404页面
│   ├── Profile.vue       # 个人主页
│   ├── Publish.vue       # 发布页面
│   └── Register.vue      # 注册
├── App.vue              # 根组件
├── main.js              # 入口文件
└── style.css            # 全局样式
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 🔧 配置说明

### 代理配置
项目配置了开发环境代理，将 `/api` 请求代理到后端服务：
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^/api/, '')
    }
  }
}
```

### 路径别名
配置了 `@` 别名指向 `src` 目录：
```javascript
resolve: {
  alias: {
    '@': resolve(__dirname, 'src')
  }
}
```

## 🎨 设计规范

### 字体规范
- **标题**：18px-24px，加粗
- **正文**：14px-16px，常规
- **辅助文字**：12px，浅色
- **按钮文字**：14px-16px，加粗

### 间距规范
- **页面边距**：16px
- **组件间距**：12px
- **内容间距**：8px
- **按钮内边距**：12px 24px

## 📱 主要页面

### 首页
- 瀑布流内容展示
- 下拉刷新/上拉加载
- 双击点赞功能
- 内容搜索

### 发布页面
- 多媒体内容上传
- 拖拽排序
- 实时预览
- 自动保存草稿

### 个人主页
- 用户信息展示
- 关注/粉丝统计
- 个人作品网格
- 资料编辑

## 🔗 API 接口

项目与后端 API 进行交互，主要接口包括：

- **用户相关**：注册、登录、资料管理
- **内容相关**：发布、浏览、编辑、删除
- **点赞相关**：点赞、取消点赞、排行榜
- **关注相关**：关注管理、列表查询

详细接口文档请参考 `doc/default_OpenAPI.json`。

## 📄 开发规范

### 代码规范
- 遵循 Vue 3 Composition API 最佳实践
- 使用 ESLint 进行代码检查
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件
- 项目讨论区

---

**小紫书前端团队** ❤️
        