# Zeabur 部署指南

本指南将帮助你在 Zeabur 上部署 IO 系统项目。

## 项目结构

- `io-api/`: 后端 API 服务（Node.js + Express）
- `io-pages/`: 前端应用（Vue 3 + Vite）

## 部署步骤

### 1. 准备数据库

1. 在 Zeabur 上创建一个 **MySQL** 服务
2. 记录数据库连接信息（会在环境变量中自动配置）

### 2. 部署后端服务（io-api）

1. 在 Zeabur 上创建新服务，选择 **Node.js**
2. 连接到你的 Git 仓库
3. 设置 **Root Directory** 为 `io-api`
4. Zeabur 会自动检测并使用 `io-api/zeabur.json` 配置

#### 环境变量配置

在 Zeabur 后端服务的环境变量中设置：

```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key-here (请使用强密码)
DB_HOST=<从 MySQL 服务获取>
DB_PORT=<从 MySQL 服务获取>
DB_USER=<从 MySQL 服务获取>
DB_PASSWORD=<从 MySQL 服务获取>
DB_NAME=<从 MySQL 服务获取>
DB_SSL=true
CORS_ORIGIN=<前端服务的 URL，例如：https://your-frontend.zeabur.app>
```

**注意**：Zeabur 会自动为关联的 MySQL 服务注入数据库连接环境变量，通常以 `MYSQL_` 开头。你需要将这些映射到你的应用使用的变量名。

### 3. 初始化数据库

部署后端后，需要初始化数据库：

1. 在 Zeabur 后端服务的 **Shell** 中运行：
   ```bash
   npm run init-db
   ```

2. 运行数据库迁移（如果需要）：
   ```bash
   npm run migrate-insurance
   npm run migrate-fix-employee-id
   ```

### 4. 部署前端服务（io-pages）

1. 在 Zeabur 上创建新服务，选择 **Static Site** 或 **Node.js**
2. 连接到你的 Git 仓库
3. 设置 **Root Directory** 为 `io-pages`
4. Zeabur 会自动检测并使用 `io-pages/zeabur.json` 配置

#### 环境变量配置

在 Zeabur 前端服务的环境变量中设置：

```
VITE_API_BASE_URL=<后端服务的 URL，例如：https://your-backend.zeabur.app/api>
```

### 5. 配置服务关联

1. 在 Zeabur 中，将 MySQL 服务与后端服务关联
2. 将后端服务与前端服务关联（如果需要）

## 环境变量映射（Zeabur MySQL）

Zeabur 的 MySQL 服务会自动注入以下环境变量：
- `MYSQL_HOST` → 映射到 `DB_HOST`
- `MYSQL_PORT` → 映射到 `DB_PORT`
- `MYSQL_USER` → 映射到 `DB_USER`
- `MYSQL_PASSWORD` → 映射到 `DB_PASSWORD`
- `MYSQL_DATABASE` → 映射到 `DB_NAME`

你可以在 Zeabur 的环境变量设置中创建这些映射。

## 验证部署

1. 访问前端 URL，应该能看到登录页面
2. 默认管理员账号：
   - 用户名：`admin`
   - 密码：`admin123`
3. 登录后检查各个功能模块是否正常工作

## 故障排查

### 数据库连接失败
- 检查环境变量是否正确配置
- 确认 MySQL 服务已启动
- 检查 `DB_SSL` 设置（Zeabur MySQL 通常需要 SSL）

### 前端无法连接后端
- 检查 `VITE_API_BASE_URL` 是否正确
- 检查后端的 `CORS_ORIGIN` 是否包含前端 URL
- 查看浏览器控制台的网络请求错误

### 401/403 错误
- 清除浏览器 localStorage
- 重新登录
- 检查 JWT_SECRET 是否一致

## 注意事项

1. **安全性**：
   - 生产环境必须修改默认管理员密码
   - 使用强密码作为 `JWT_SECRET`
   - 定期更新依赖包

2. **数据库备份**：
   - 定期备份数据库
   - Zeabur 提供自动备份功能

3. **性能优化**：
   - 根据实际使用情况调整数据库连接池大小
   - 监控服务资源使用情况

