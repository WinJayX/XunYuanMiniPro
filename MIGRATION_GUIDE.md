# 寻源小程序迁移指南

## 📋 项目概览

本项目使用 **Taro 3.6.28 + React + TypeScript + Sass** 开发微信小程序。

### 技术栈对比

| 功能 | Web (Next.js) | 小程序 (Taro) |
|------|--------------|---------------|
| 路由 | `next/navigation` | `@tarojs/taro` 路由 API |
| 存储 | `localStorage` | `Taro.setStorageSync` |
| 请求 | `fetch` | `Taro.request` |
| 组件 | HTML 标签 | `@tarojs/components` |
| 样式 | CSS/Tailwind | SCSS (px 自动转 rpx) |

---

## 🚀 快速开始

### 1. 安装依赖
```bash
cd XunYuanMiniPro
npm install
```

### 2. 配置小程序 AppID
编辑 `project.config.json`，将 `appid` 改为你的微信小程序 AppID：
```json
{
  "appid": "你的微信小程序AppID"
}
```

### 3. 配置后端 API 地址
编辑 `.env.development`：
```
TARO_APP_API_BASE_URL=https://your-api-domain.com/api
```

### 4. 运行开发模式
```bash
npm run dev:weapp
```

### 5. 在微信开发者工具中打开
打开微信开发者工具 → 导入项目 → 选择 `XunYuanMiniPro/dist` 目录

---

## 📂 项目结构

```
XunYuanMiniPro/
├── src/
│   ├── app.config.ts        # 全局配置（页面、TabBar等）
│   ├── app.ts               # 入口文件
│   ├── app.scss             # 全局样式
│   ├── api/                 # API 封装（从 web 迁移）
│   │   └── index.ts
│   ├── components/          # 通用组件
│   │   └── ...
│   ├── contexts/            # 全局状态管理
│   │   └── auth.ts
│   ├── pages/               # 页面
│   │   ├── index/           # 首页/家族列表
│   │   ├── login/           # 登录页
│   │   ├── family/          # 族谱详情页
│   │   └── mine/            # 个人中心
│   ├── types/               # TypeScript 类型定义
│   │   └── family.ts
│   └── utils/               # 工具函数
│       └── index.ts
├── config/                  # Taro 配置
├── project.config.json      # 微信小程序配置
└── package.json
```

---

## 🔄 代码迁移要点

### 1. API 请求改造

**Web 原始代码（fetch）：**
```typescript
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  return response.json();
}
```

**Taro 小程序版本：**
```typescript
import Taro from '@tarojs/taro';

async function request<T>(endpoint: string, options: Taro.request.Option = {}): Promise<T> {
  const res = await Taro.request({
    url: `${API_BASE_URL}${endpoint}`,
    header: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.data as T;
}
```

### 2. 存储 API 改造

**Web 原始代码：**
```typescript
localStorage.getItem('token');
localStorage.setItem('token', value);
localStorage.removeItem('token');
```

**Taro 小程序版本：**
```typescript
Taro.getStorageSync('token');
Taro.setStorageSync('token', value);
Taro.removeStorageSync('token');
```

### 3. 路由导航改造

**Web 原始代码：**
```typescript
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/family/123');
```

**Taro 小程序版本：**
```typescript
import Taro from '@tarojs/taro';
Taro.navigateTo({ url: '/pages/family/index?id=123' });
```

### 4. 组件改造

**Web HTML 标签 → Taro 组件：**
- `<div>` → `<View>`
- `<span>` / `<p>` → `<Text>`
- `<img>` → `<Image>`
- `<input>` → `<Input>`
- `<button>` → `<Button>`
- `<a>` → `<Navigator>` 或 `Taro.navigateTo()`

### 5. 样式单位

- Web 使用 `px`，Taro 会自动转换为 `rpx`（设计稿 750px 宽度）
- 如需保留 `px`，使用大写 `PX` 或 `Px`

---

## ⚠️ 小程序限制与注意事项

1. **域名白名单**：需在微信公众平台配置合法请求域名
2. **包大小限制**：主包 ≤ 2MB，分包加起来 ≤ 20MB
3. **无 DOM 操作**：不能使用 `document`、`window` 等 Web API
4. **登录方式**：小程序通常使用微信授权登录（可保留账密登录作为备选）

---

## 📱 页面规划

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | `pages/index/index` | 家族列表展示 |
| 登录 | `pages/login/index` | 登录/注册 |
| 族谱详情 | `pages/family/index` | 族谱树展示 |
| 个人中心 | `pages/mine/index` | 用户信息、设置 |

---

## 🔧 调试技巧

1. 使用 `console.log()` 可在微信开发者工具控制台查看
2. 真机调试：微信开发者工具 → 预览/真机调试
3. 网络请求可在开发者工具的 Network 面板查看

---

## 📦 发布流程

1. `npm run build:weapp` 构建生产版本
2. 微信开发者工具 → 上传
3. 微信公众平台 → 版本管理 → 提交审核
4. 审核通过后发布上线
