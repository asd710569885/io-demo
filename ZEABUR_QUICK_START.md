# Zeabur 快速部署指南

## 🎯 当前情况

Zeabur 检测到的是 "static"（静态站点），这是因为它在根目录检测。你需要配置 **Root Directory** 来指定正确的目录。

## 📝 部署后端服务（io-api）

### 步骤 1：配置 Root Directory

在 Zeabur 的构建计划预览对话框中：

1. 点击 **"配置"** 按钮
2. 找到 **"Root Directory"** 或 **"根目录"** 设置
3. 设置为：`io-api`
4. 保存配置

### 步骤 2：选择正确的 Provider

如果 Zeabur 仍然检测为静态站点：

1. 在配置中找到 **"Provider"** 或 **"框架"** 选项
2. 手动选择 **"Node.js"** 或 **"Custom"**
3. 或者添加环境变量来指定：
   - `ZEABUR_PROVIDER=nodejs`

### 步骤 3：配置构建命令

在配置中设置：

- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Root Directory**: `io-api`

### 步骤 4：关联 MySQL 服务

1. 在服务设置中找到 **"Dependencies"** 或 **"Connect"**
2. 选择你的 MySQL 服务
3. Zeabur 会自动注入数据库连接变量

### 步骤 5：配置环境变量

在服务设置 → Environment Variables 中添加：

```
NODE_ENV=production
PORT=3000
JWT_SECRET=你的强密码（请使用随机字符串）
DB_SSL=true
CORS_ORIGIN=https://你的前端域名.zeabur.app
```

**注意**：数据库相关变量（DB_HOST, DB_PORT 等）会在关联 MySQL 后自动注入。

### 步骤 6：部署

点击 **"部署"** 按钮，等待部署完成。

## 📝 部署前端服务（io-pages）

### 步骤 1：创建新服务

1. 在 Zeabur Dashboard 点击 **"Add Service"**
2. 选择同一个 Git 仓库
3. 在构建计划预览中点击 **"配置"**

### 步骤 2：配置 Root Directory

- **Root Directory**: `io-pages`

### 步骤 3：配置构建命令

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start` 或 `npx vite preview --host 0.0.0.0 --port 3000`
- **Output Directory**: `dist`

### 步骤 4：配置环境变量

```
VITE_API_BASE_URL=https://你的后端域名.zeabur.app/api
```

## 🔧 如果 Zeabur 仍然检测错误

### 方法 1：使用 zeabur.json 配置文件

Zeabur 会自动读取 `io-api/zeabur.json` 和 `io-pages/zeabur.json` 文件，这些文件已经配置好了。

### 方法 2：手动指定环境变量

在后端服务中添加：

```
ZEABUR_PROVIDER=nodejs
ZEABUR_ROOT_DIRECTORY=io-api
```

在前端服务中添加：

```
ZEABUR_PROVIDER=static
ZEABUR_ROOT_DIRECTORY=io-pages
```

### 方法 3：检查文件结构

确保你的 Git 仓库结构是：

```
io/
├── io-api/
│   ├── package.json
│   ├── server.js
│   └── zeabur.json
└── io-pages/
    ├── package.json
    ├── vite.config.js
    └── zeabur.json
```

## ✅ 验证配置

部署后端后，检查：
1. 服务状态显示为 "运行中"
2. 日志中没有错误
3. 可以访问 `/health` 端点

部署前端后，检查：
1. 可以访问前端 URL
2. 前端可以正常调用后端 API

