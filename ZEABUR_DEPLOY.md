# Zeabur 部署指南

本指南将帮助你在 Zeabur 上部署 IO 系统项目。

## 📋 前置要求

- Zeabur 账号
- GitHub/GitLab 仓库（已推送代码）
- 了解基本的 Zeabur 操作

## 🏗️ 项目结构

```
io/
├── io-api/          # 后端 API 服务（Node.js + Express）
└── io-pages/        # 前端应用（Vue 3 + Vite）
```

## 🚀 部署步骤

### 第一步：创建 MySQL 数据库

1. 在 Zeabur Dashboard 点击 **"New Project"** 或 **"Add Service"**
2. 选择 **MySQL** 服务
3. 等待数据库创建完成
4. 记录数据库服务名称（例如：`mysql-xxx`）

### 第二步：部署后端服务（io-api）

1. 在 Zeabur Dashboard 点击 **"Add Service"**
2. 选择 **"GitHub"** 或 **"GitLab"**，连接到你的仓库
3. 选择 **Node.js** 模板
4. 在服务设置中：
   - **Root Directory**: 设置为 `io-api`
   - Zeabur 会自动检测 `zeabur.json` 配置

#### 配置环境变量

在服务设置 → Environment Variables 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 生产环境 |
| `PORT` | `3000` | 服务端口（Zeabur 会自动设置） |
| `JWT_SECRET` | `你的强密码` | JWT 密钥（请使用强随机字符串） |
| `DB_HOST` | `${{mysql.xxx.MYSQL_HOST}}` | 从 MySQL 服务获取 |
| `DB_PORT` | `${{mysql.xxx.MYSQL_PORT}}` | 从 MySQL 服务获取 |
| `DB_USER` | `${{mysql.xxx.MYSQL_USER}}` | 从 MySQL 服务获取 |
| `DB_PASSWORD` | `${{mysql.xxx.MYSQL_PASSWORD}}` | 从 MySQL 服务获取 |
| `DB_NAME` | `${{mysql.xxx.MYSQL_DATABASE}}` | 从 MySQL 服务获取 |
| `DB_SSL` | `true` | Zeabur MySQL 需要 SSL |
| `CORS_ORIGIN` | `https://你的前端域名.zeabur.app` | 前端 URL（部署前端后更新） |

**注意**：`mysql.xxx` 中的 `xxx` 是你的 MySQL 服务名称。

#### 关联 MySQL 服务

1. 在后端服务设置中，找到 **"Dependencies"** 或 **"Connect"**
2. 选择你的 MySQL 服务
3. Zeabur 会自动注入数据库连接变量

### 第三步：初始化数据库

部署完成后，在 Zeabur 后端服务的 **Shell** 中运行：

```bash
npm run init-db
```

如果需要运行迁移：

```bash
npm run migrate-insurance
npm run migrate-fix-employee-id
```

### 第四步：部署前端服务（io-pages）

1. 在 Zeabur Dashboard 点击 **"Add Service"**
2. 选择同一个 Git 仓库
3. 选择 **Static Site** 或 **Node.js** 模板
4. 在服务设置中：
   - **Root Directory**: 设置为 `io-pages`
   - Zeabur 会自动检测 `zeabur.json` 配置

#### 配置环境变量

在服务设置 → Environment Variables 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_API_BASE_URL` | `https://你的后端域名.zeabur.app/api` | 后端 API 地址 |

**注意**：部署前端后，需要更新后端的 `CORS_ORIGIN` 环境变量为前端 URL。

### 第五步：配置服务关联

1. 在前端服务设置中，找到 **"Dependencies"**
2. 选择后端服务，建立依赖关系
3. 这样前端可以通过环境变量访问后端 URL

## 🔧 环境变量快速配置

### 后端环境变量（io-api）

```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=your-strong-secret-key-here
DB_HOST=${{mysql.xxx.MYSQL_HOST}}
DB_PORT=${{mysql.xxx.MYSQL_PORT}}
DB_USER=${{mysql.xxx.MYSQL_USER}}
DB_PASSWORD=${{mysql.xxx.MYSQL_PASSWORD}}
DB_NAME=${{mysql.xxx.MYSQL_DATABASE}}
DB_SSL=true
CORS_ORIGIN=https://your-frontend.zeabur.app
```

### 前端环境变量（io-pages）

```bash
VITE_API_BASE_URL=https://your-backend.zeabur.app/api
```

## ✅ 验证部署

1. **检查后端健康状态**：
   - 访问：`https://your-backend.zeabur.app/health`
   - 应该返回：`{"status":"ok","timestamp":"..."}`

2. **访问前端**：
   - 访问：`https://your-frontend.zeabur.app`
   - 应该看到登录页面

3. **测试登录**：
   - 默认管理员账号：
     - 用户名：`admin`
     - 密码：`admin123`
   - **⚠️ 重要**：登录后立即修改密码！

## 🐛 故障排查

### 问题 1：数据库连接失败

**症状**：后端日志显示数据库连接错误

**解决方案**：
1. 检查环境变量是否正确配置
2. 确认 MySQL 服务已启动
3. 验证 `DB_SSL=true` 已设置
4. 检查数据库服务是否已关联

### 问题 2：前端无法连接后端

**症状**：前端显示网络错误或 CORS 错误

**解决方案**：
1. 检查 `VITE_API_BASE_URL` 是否正确
2. 检查后端的 `CORS_ORIGIN` 是否包含前端 URL
3. 查看浏览器控制台的网络请求
4. 确认后端服务已正常运行

### 问题 3：401/403 认证错误

**症状**：登录后立即被登出或无法访问

**解决方案**：
1. 清除浏览器 localStorage
2. 检查 `JWT_SECRET` 是否一致
3. 重新登录

### 问题 4：前端构建失败

**症状**：前端服务部署失败

**解决方案**：
1. 检查 Node.js 版本（需要 >= 20.19.0 或 >= 22.12.0）
2. 查看构建日志中的具体错误
3. 确认所有依赖都已正确安装

## 📝 重要提示

1. **安全性**：
   - ✅ 生产环境必须修改默认管理员密码
   - ✅ 使用强随机字符串作为 `JWT_SECRET`
   - ✅ 定期更新依赖包
   - ✅ 不要将敏感信息提交到 Git

2. **数据库**：
   - ✅ 定期备份数据库
   - ✅ Zeabur 提供自动备份功能
   - ✅ 生产环境建议使用 Zeabur 的付费 MySQL 服务

3. **性能**：
   - ✅ 监控服务资源使用情况
   - ✅ 根据实际使用调整数据库连接池大小
   - ✅ 使用 Zeabur 的监控功能

4. **域名**：
   - ✅ Zeabur 提供免费子域名（`.zeabur.app`）
   - ✅ 可以绑定自定义域名

## 🔄 更新部署

当你推送新代码到 Git 仓库时，Zeabur 会自动：
1. 检测代码变更
2. 重新构建服务
3. 部署新版本

你可以在 Zeabur Dashboard 查看部署状态和日志。

## 📞 获取帮助

如果遇到问题：
1. 查看 Zeabur Dashboard 中的服务日志
2. 检查环境变量配置
3. 参考 Zeabur 官方文档
4. 查看项目的 `DEPLOY.md` 文件

