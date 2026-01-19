# 寻源家谱 - 微信小程序

<p align="center">
  <img src="https://img.shields.io/badge/Taro-3.6.28-blue" alt="Taro Version" />
  <img src="https://img.shields.io/badge/React-18.x-61dafb" alt="React Version" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6" alt="TypeScript Version" />
  <img src="https://img.shields.io/badge/Platform-微信小程序%20|%20H5-green" alt="Platform" />
</p>

> 传承家族记忆，延续血脉亲情

寻源家谱是一款专注于家谱管理的跨平台应用，本项目为**微信小程序版本**，基于 Taro 框架开发，支持微信小程序和 H5 双端运行。

---

## 📋 目录

- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [快速开始](#-快速开始)
- [开发指南](#-开发指南)
- [配置说明](#-配置说明)
- [核心功能说明](#-核心功能说明)
- [API 对接](#-api-对接)
- [发布部署](#-发布部署)
- [更新日志](#-更新日志)

---

## ✨ 功能特性

### 核心功能
- 🔐 **用户认证** - 支持邮箱注册/登录，验证码验证
- 📖 **家族管理** - 创建、编辑、删除家族
- 🌳 **家谱展示** - 按世代展示家族成员，支持横向滚动浏览
- 👤 **成员详情** - 查看成员照片、生卒年份、籍贯、简介等信息
- 📷 **头像上传** - 支持从相册或相机上传成员头像
- ✏️ **信息编辑** - 直接在小程序内编辑成员信息
- 💬 **意见反馈** - 用户可提交问题反馈和建议

### 高级特性
- 💑 **夫妻关系显示** - 夫妻放在同一容器内，支持元配/继室/侧室标签
- 🔗 **血脉连接线** - 世代间金色渐变连接线，夫妻彩虹渐变连线
- 📊 **智能排序** - 按父母顺序 → 排行 → 出生年份自动排序
- 🌓 **暗色主题** - 精心设计的深色 UI，金色点缀，典雅大气

---

## 🛠 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| [Taro](https://taro.zone/) | 3.6.28 | 跨平台开发框架 |
| [React](https://react.dev/) | 18.x | UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | 类型安全 |
| [Sass](https://sass-lang.com/) | - | CSS 预处理器 |
| [Webpack](https://webpack.js.org/) | 5.78 | 构建工具 |

---

## 📁 项目结构

```
XunYuanMiniPro/
├── src/
│   ├── api/                    # API 接口封装
│   │   ├── index.ts            # 业务 API（auth, families, feedback）
│   │   └── request.ts          # 请求封装（Taro.request + 代理配置）
│   ├── contexts/               # React Context
│   │   └── auth.tsx            # 认证上下文（用户状态管理）
│   ├── pages/                  # 页面组件
│   │   ├── index/              # 首页 - 家族列表
│   │   ├── login/              # 登录/注册页
│   │   ├── family/             # 家谱详情页（含夫妻分组、连接线）
│   │   └── mine/               # 个人中心页
│   ├── types/                  # TypeScript 类型定义
│   │   └── family.ts           # 家族相关类型
│   ├── utils/                  # 工具函数
│   │   └── storage.ts          # 存储工具（封装 Taro Storage）
│   ├── app.config.ts           # 全局配置（页面路由、TabBar）
│   ├── app.tsx                 # 应用入口
│   └── app.scss                # 全局样式
├── config/                     # Taro 编译配置
│   ├── index.ts                # 主配置（含 H5 代理）
│   ├── dev.ts                  # 开发环境配置
│   └── prod.ts                 # 生产环境配置
├── dist/                       # 编译输出目录
├── .env.development            # 开发环境变量
├── .env.production             # 生产环境变量
├── project.config.json         # 微信小程序配置（AppID 等）
├── MIGRATION_GUIDE.md          # Web 到小程序迁移指南
├── PUBLISH_GUIDE.md            # 微信小程序发布指南
└── package.json                # 项目依赖
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)（可选，用于小程序调试）

### 安装依赖

```bash
cd XunYuanMiniPro
npm install
```

### 启动开发

```bash
# H5 浏览器预览（推荐开发时使用）
npm run dev:h5

# 微信小程序开发模式
npm run dev:weapp
```

### 访问应用

- **H5 模式**: 浏览器打开 http://localhost:10086/
- **小程序模式**: 微信开发者工具导入项目目录

---

## 📖 开发指南

### 命令说明

| 命令 | 说明 |
|------|------|
| `npm run dev:h5` | 🌐 H5 开发模式（浏览器预览，支持热更新） |
| `npm run dev:weapp` | 📱 微信小程序开发模式 |
| `npm run build:h5` | 构建 H5 生产版本 |
| `npm run build:weapp` | 构建微信小程序生产版本 |
| `npm test` | 运行测试 |

### 热更新说明

| 文件类型 | 热更新支持 |
|---------|-----------|
| `.tsx` / `.ts` | ✅ 支持 |
| `.scss` / `.css` | ✅ 支持 |
| `.env.*` 环境变量 | ❌ 需重启 |
| `config/*.ts` 配置 | ❌ 需重启 |
| `app.config.ts` | ❌ 需重启 |

### H5 开发代理

开发时使用代理解决跨域问题，配置在 `config/index.ts`：

```typescript
h5: {
  devServer: {
    port: 10086,
    proxy: {
      '/api': {
        target: 'http://your-backend-ip:3000',
        changeOrigin: true,
      },
    },
  },
}
```

---

## ⚙️ 配置说明

### 环境变量

编辑 `.env.development` 或 `.env.production`：

```bash
# 开发环境（使用代理时用相对路径）
TARO_APP_API_BASE_URL=/api

# 生产环境（使用完整 URL）
TARO_APP_API_BASE_URL=https://your-api-domain.com/api
```

### 微信小程序配置

编辑 `project.config.json`：

```json
{
  "appid": "你的微信小程序AppID",
  "projectname": "XunYuanMiniPro"
}
```

---

## 🎯 核心功能说明

### 家谱详情页

家谱详情页是核心功能页面，实现了以下特性：

#### 1. 成员排序逻辑

```typescript
// 排序优先级：
// 1. 父母在上一代的顺序
// 2. 排行（birthOrder）
// 3. 出生年份（birthYear）
```

#### 2. 夫妻关系分组

- 有配偶的成员会被放在 `couple-container` 容器内
- 支持多配偶（元配、继室、侧室）
- 夫妻之间用彩虹渐变连接线连接

#### 3. 血脉连接线

- 世代间使用金色渐变垂直线
- 成员卡片顶部和底部有连接点标记
- 夫妻容器底部有圆形连接点指向子代

#### 4. 头像上传

- 点击成员 → 编辑 → 点击头像
- 支持相册选择或相机拍摄
- 自动上传到服务器并保存

---

## 🔗 API 对接

### 后端服务

本项目需要配合 `xunyuan-backend` 后端服务使用。

### 主要接口

| 接口 | 说明 |
|------|------|
| `POST /api/auth/login` | 用户登录 |
| `POST /api/auth/register` | 用户注册 |
| `GET /api/families` | 获取家族列表 |
| `GET /api/families/:id` | 获取家族详情 |
| `PATCH /api/members/:id` | 更新成员信息 |
| `POST /api/upload/image` | 上传图片 |

### 微信公众平台配置

发布前需在 [微信公众平台](https://mp.weixin.qq.com/) 配置：

1. **开发管理** → **开发设置** → **服务器域名**
2. 添加以下域名：
   - `request 合法域名`: 你的 API 域名
   - `uploadFile 合法域名`: 你的上传域名
   - `downloadFile 合法域名`: 你的图片域名

---

## 📦 发布部署

详细发布流程请参阅 **[PUBLISH_GUIDE.md](./PUBLISH_GUIDE.md)**

### 快速发布步骤

1. 构建生产版本
   ```bash
   npm run build:weapp
   ```

2. 打开微信开发者工具，导入项目

3. 点击「上传」提交代码

4. 在公众平台提交审核

---

## 📝 更新日志

### v1.1.0 (2026-01-19)

**新增功能：**
- ✅ 头像上传功能
- ✅ 成员信息编辑功能
- ✅ 夫妻关系分组显示
- ✅ 多配偶支持（元配/继室/侧室标签）
- ✅ 智能成员排序（按父母、排行、年份）
- ✅ 血脉连接线优化
- ✅ H5 开发代理配置

**问题修复：**
- 🐛 修复 onClick undefined 导致的报错
- 🐛 修复成员 ID 获取逻辑
- 🐛 修复成员卡片高度不一致问题

### v1.0.0 (2026-01-19)

**初始版本：**
- ✅ 项目初始化
- ✅ 登录/注册功能
- ✅ 家族列表管理
- ✅ 家谱详情展示
- ✅ 个人中心
- ✅ H5 + 微信小程序双端支持

---

## 📄 相关文档

- [迁移指南](./MIGRATION_GUIDE.md) - Web 到小程序的代码迁移说明
- [发布指南](./PUBLISH_GUIDE.md) - 微信小程序发布详细步骤
- [Taro 官方文档](https://docs.taro.zone/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)

---

## 📮 联系我们

如有问题或建议，请通过应用内「意见反馈」功能提交。

---

<p align="center">Made with ❤️ by XunYuan Team</p>
