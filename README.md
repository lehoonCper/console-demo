# Quote Monitor Web

行情监控Web应用，基于Vue 3 + Vite + Element Plus构建。

## 技术栈

- **Vue 3** - 渐进式JavaScript框架
- **Vite** - 下一代前端构建工具
- **Element Plus** - Vue 3组件库
- **Vue Router 4** - Vue.js官方路由
- **Vuex 4** - Vue.js状态管理
- **JavaScript** - 编程语言
- **Sass** - CSS预处理器

## 项目结构

```
quote-monitor-web/
├── app-config.json          # 应用配置文件
├── index.html              # 入口HTML文件
├── package.json            # 项目依赖和脚本
├── vite.config.js          # Vite配置文件
├── public/                 # 静态资源目录
│   └── icon.png
└── src/                    # 源代码目录
    ├── App.vue             # 根组件
    ├── main.js             # 入口文件
    ├── assets/             # 静态资源
    ├── components/         # 全局公共组件
    ├── pages/              # 页面目录
    │   ├── Auth/           # 认证页面
    │   ├── Home/           # 首页
    │   ├── DataManager/    # 数据管理页面
    │   ├── Duty/           # 值班页面
    │   └── WC/             # WC页面
    ├── config/             # 配置文件
    ├── router/             # 路由配置
    ├── scripts/            # 脚本文件
    ├── services/           # API服务
    ├── utils/              # 工具函数
    └── plugins/            # Vue插件
```

## 开发规范

### 组件规范
- 组件名使用 PascalCase
- 文件名使用 kebab-case
- 使用 scoped 样式
- 顶级class名称固定为组件名称-container

### 代码规范
- 使用 ESLint 检查代码规范
- 使用 Prettier 格式化代码
- class名称仅表示结构信息，不携带业务相关命名

## 开发命令

### 安装依赖
```bash
npm install
```

### 开发服务器
```bash
# 本地开发环境
npm run dev

# 预发布环境
npm run dev:staging

# 生产环境
npm run dev:prod
```

### 构建项目
```bash
# 本地构建
npm run build

# 预发布构建
npm run build:staging

# 生产构建
npm run build:prod
```

### 代码检查和格式化
```bash
# ESLint检查
npm run lint

# Prettier格式化
npm run format
```

### 预览构建结果
```bash
npm run preview
```

## 环境配置

项目支持多环境配置：
- `local` - 本地开发环境
- `staging` - 预发布环境  
- `prod` - 生产环境

环境配置通过Vite的模式系统管理，可以通过环境变量文件进行配置。

## 页面结构

每个页面按照以下结构组织：
```
PageName/
├── Main.vue           # 页面主组件
├── components/        # 页面内可复用组件
└── sub/              # 子页面
```

## API服务

API服务统一通过 `src/services/api.service.js` 管理，支持：
- 请求/响应拦截器
- 错误处理
- 环境配置
- 统一的请求方法

## 工具函数

常用工具函数放在 `src/utils/` 目录下：
- `Account.js` - 账户相关工具
- `Axios.js` - HTTP请求工具
- `Common.js` - 通用工具函数 