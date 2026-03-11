# License Web - 软件升级管理系统

一个基于 Vue 3 + Element Plus 的现代化前端管理后台，用于软件版本管理与分发。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架 (Composition API)
- **Element Plus** - 基于 Vue 3 的组件库
- **Vue Router 4** - 官方路由管理器
- **Pinia** - Vue 官方推荐的状态管理方案
- **Axios** - 基于 Promise 的 HTTP 客户端
- **Vite** - 下一代前端构建工具
- **ECharts** - 数据可视化图表库

## 功能特性

### 核心功能

1. **软件管理**
   - 软件列表展示与搜索
   - 创建/编辑软件信息
   - 软件状态管理
   - 元数据配置

2. **版本管理**
   - 版本列表展示与筛选
   - 发布新版本
   - 版本详情查看
   - 多渠道支持（稳定版/测试版/内测版/开发版）

3. **升级统计**
   - 下载趋势图表
   - 版本分布分析
   - 实时数据统计
   - 用户活跃度监控

### 系统特性

- **标签页管理** - 支持多页面切换，右键菜单操作
- **响应式布局** - 适配桌面、平板、手机等多种设备
- **主题定制** - 深蓝科技风格，现代化 UI 设计
- **权限控制** - 基于 Token 的登录鉴权
- **错误处理** - 统一的错误提示与加载状态

## 项目结构

```
license-web/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 接口
│   │   ├── request.js     # Axios 请求封装
│   │   ├── software.js    # 软件管理接口
│   │   ├── version.js     # 版本管理接口
│   │   └── update.js      # 升级服务接口
│   ├── components/        # 公共组件
│   │   ├── Layout.vue     # 布局组件
│   │   ├── AppHeader.vue  # 顶部导航
│   │   ├── AppSidebar.vue # 侧边栏菜单
│   │   ├── AppTabs.vue    # 标签页组件
│   │   └── Breadcrumb.vue # 面包屑导航
│   ├── views/             # 页面视图
│   │   ├── Login.vue      # 登录页
│   │   ├── Dashboard.vue  # 控制台首页
│   │   ├── SoftwareList.vue    # 软件列表
│   │   ├── SoftwareCreate.vue  # 创建/编辑软件
│   │   ├── VersionList.vue     # 版本列表
│   │   ├── VersionPublish.vue  # 发布版本
│   │   └── NotFound.vue   # 404 页面
│   ├── stores/            # Pinia 状态管理
│   │   ├── tabs.js        # 标签页状态
│   │   └── config.js      # 全局配置
│   ├── router/            # 路由配置
│   │   └── index.js
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── package.json
├── vite.config.js
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
cd license-web
npm install
```

### 开发环境运行

```bash
npm run dev
```

访问 http://localhost:3000

### 生产环境构建

```bash
npm run build
```

构建后的文件位于 `dist/` 目录

### 预览生产构建

```bash
npm run preview
```

## 配置说明

### API 配置

在 `src/stores/config.js` 中修改 API 基础地址：

```javascript
const apiBaseUrl = ref(import.meta.env.VITE_API_BASE_URL || '/api/v1')
```

或在项目根目录创建 `.env` 文件：

```
VITE_API_BASE_URL=http://your-api-server/api/v1
```

### 代理配置

在 `vite.config.js` 中配置开发服务器代理：

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

## API 接口规范

### 软件管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/v1/admin/software | 获取软件列表 |
| POST | /api/v1/admin/software | 创建软件 |
| GET | /api/v1/admin/software/:id | 获取软件详情 |
| PUT | /api/v1/admin/software/:id | 更新软件 |
| DELETE | /api/v1/admin/software/:id | 删除软件 |

### 版本管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/v1/admin/versions | 获取版本列表 |
| POST | /api/v1/admin/versions | 发布版本 |
| GET | /api/v1/admin/versions/:id | 获取版本详情 |
| PUT | /api/v1/admin/versions/:id | 更新版本 |
| DELETE | /api/v1/admin/versions/:id | 删除版本 |

### 升级服务

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/v1/update/check | 检查更新 |
| GET | /api/v1/update/download/:id | 下载文件 |

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 开发规范

### 代码风格

- 使用 Composition API 编写组件
- 组件名使用 PascalCase
- 组合式函数使用 use 前缀
- Props 使用 camelCase，模板中使用 kebab-case

### 提交规范

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

## 许可证

MIT License
