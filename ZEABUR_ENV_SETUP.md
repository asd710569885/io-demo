# Zeabur 环境变量配置指南

根据你已创建的 MySQL 数据库，以下是详细的环境变量配置说明。

## 📊 你的 MySQL 数据库信息

从 Zeabur 控制台可以看到：
- **Host**: `sjc1.clusters.zeabur.com`
- **Port**: `28686`
- **Username**: `root`
- **Password**: `v6lI0yWFos4hg0VxJQGdu187395tj2f`
- **Database**: `zeabur`

## 🔧 后端服务（io-api）环境变量配置

在 Zeabur 后端服务的 **Environment Variables** 中添加以下变量：

### 方法一：使用 Zeabur 自动注入（推荐）

如果你在 Zeabur 中将 MySQL 服务关联到后端服务，Zeabur 会自动注入环境变量。你只需要映射：

| 环境变量 | 值 | 说明 |
|---------|-----|------|
| `NODE_ENV` | `production` | 生产环境 |
| `PORT` | `3000` | 端口（Zeabur 会自动设置） |
| `JWT_SECRET` | `你的强密码` | JWT 密钥（请使用强随机字符串） |
| `DB_HOST` | `${{mysql.MYSQL_HOST}}` | 从 MySQL 服务自动获取 |
| `DB_PORT` | `${{mysql.MYSQL_PORT}}` | 从 MySQL 服务自动获取 |
| `DB_USER` | `${{mysql.MYSQL_USER}}` | 从 MySQL 服务自动获取 |
| `DB_PASSWORD` | `${{mysql.MYSQL_PASSWORD}}` | 从 MySQL 服务自动获取 |
| `DB_NAME` | `${{mysql.MYSQL_DATABASE}}` | 从 MySQL 服务自动获取（通常是 `zeabur`） |
| `DB_SSL` | `true` | Zeabur MySQL 需要 SSL |
| `CORS_ORIGIN` | `https://你的前端域名.zeabur.app` | 前端 URL（部署前端后更新） |

**注意**：`mysql` 是你的 MySQL 服务名称。如果服务名称不同，请相应调整。

### 方法二：手动配置（如果自动注入不工作）

如果 Zeabur 的自动注入不工作，可以手动设置：

| 环境变量 | 值 |
|---------|-----|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `JWT_SECRET` | `你的强密码` |
| `DB_HOST` | `sjc1.clusters.zeabur.com` |
| `DB_PORT` | `28686` |
| `DB_USER` | `root` |
| `DB_PASSWORD` | `v6lI0yWFos4hg0VxJQGdu187395tj2f` |
| `DB_NAME` | `zeabur` |
| `DB_SSL` | `true` |
| `CORS_ORIGIN` | `https://你的前端域名.zeabur.app` |

## ⚠️ 重要：数据库名称

你的数据库名称是 `zeabur`，但代码中默认使用 `io_system`。有两种解决方案：

### 方案一：使用现有数据库 `zeabur`（推荐）

在环境变量中设置：
```
DB_NAME=zeabur
```

### 方案二：在 `zeabur` 数据库中创建 `io_system` 数据库

如果 Zeabur 不允许创建新数据库，可以修改代码使用 `zeabur` 数据库。

## 🚀 部署后初始化数据库

部署后端服务后，在 Zeabur 后端服务的 **Shell** 中运行：

```bash
npm run init-db
```

这会：
1. 连接到 MySQL 数据库
2. 创建必要的表结构
3. 创建默认管理员账号（admin/admin123）

如果需要运行迁移：

```bash
npm run migrate-insurance
npm run migrate-fix-employee-id
```

## 🔍 验证数据库连接

在 Zeabur 后端服务的 **Shell** 中运行：

```bash
npm run test-db
```

如果连接成功，会显示 "数据库连接成功"。

## 📝 前端服务（io-pages）环境变量

| 环境变量 | 值 |
|---------|-----|
| `VITE_API_BASE_URL` | `https://你的后端域名.zeabur.app/api` |

## 🔐 安全提示

1. **JWT_SECRET**：请使用强随机字符串，例如：
   ```bash
   # 生成随机字符串（在本地终端运行）
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **密码保护**：不要将密码提交到 Git 仓库

3. **CORS**：确保 `CORS_ORIGIN` 只包含你的前端域名

## 🐛 常见问题

### 数据库连接失败

1. 检查 `DB_SSL=true` 是否设置
2. 确认所有环境变量都已正确配置
3. 检查 Zeabur MySQL 服务的网络访问设置

### 数据库名称不匹配

如果遇到 "Unknown database" 错误：
- 确认 `DB_NAME` 设置为 `zeabur`
- 或者修改代码使用 `zeabur` 作为默认数据库名

