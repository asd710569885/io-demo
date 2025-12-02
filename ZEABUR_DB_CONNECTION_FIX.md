# Zeabur 数据库连接问题修复指南

## 🔍 当前问题

从日志看到：
1. ✅ CORS 配置正确
2. ✅ 环境变量已正确加载（`DB_HOST: sjc1.clusters.zeabur.com`）
3. ❌ 数据库连接失败，尝试连接到 `192.168.26.1` 而不是 `sjc1.clusters.zeabur.com`

错误信息：
```
数据库连接失败: Access denied for user 'root'@'192.168.26.1' (using password: YES)
```

## 🔧 可能的原因

### 原因 1：Zeabur MySQL 服务使用内部网络

Zeabur 的 MySQL 服务可能提供了内部网络地址，而不是公网地址。如果后端服务与 MySQL 服务在同一个项目中，应该使用内部连接。

### 原因 2：环境变量未正确传递

虽然日志显示 `DB_HOST: sjc1.clusters.zeabur.com`，但实际连接时可能使用了不同的值。

### 原因 3：MySQL 服务未正确关联

如果 MySQL 服务没有正确关联到后端服务，环境变量可能不会自动注入。

## ✅ 解决步骤

### 步骤 1：检查 MySQL 服务关联

1. 在 Zeabur Dashboard 中，进入后端服务（io-api）
2. 找到 **"Dependencies"** 或 **"Connect"** 或 **"连接"** 选项
3. 确认 MySQL 服务已关联
4. 如果未关联，请关联 MySQL 服务

### 步骤 2：使用 Zeabur 自动注入的环境变量（推荐）

如果 MySQL 服务已关联，Zeabur 会自动注入环境变量。你应该使用这些变量：

```
DB_HOST=${{mysql.MYSQL_HOST}}
DB_PORT=${{mysql.MYSQL_PORT}}
DB_USER=${{mysql.MYSQL_USER}}
DB_PASSWORD=${{mysql.MYSQL_PASSWORD}}
DB_NAME=${{mysql.MYSQL_DATABASE}}
```

**注意**：`mysql` 是你的 MySQL 服务名称。如果服务名称不同，请相应调整。

### 步骤 3：检查实际使用的连接参数

我已经添加了调试日志。重新部署后，查看日志中的 "=== 数据库连接配置 ===" 部分，确认：

- `DB_HOST` 是否正确
- `DB_PORT` 是否正确
- `DB_USER` 是否正确
- `DB_PASSWORD` 是否已设置
- `DB_NAME` 是否正确

### 步骤 4：验证数据库密码

确认 `DB_PASSWORD` 的值与 Zeabur MySQL 服务的实际密码一致。

在 Zeabur Dashboard 中：
1. 进入 MySQL 服务
2. 查看服务详情
3. 确认密码是否正确

### 步骤 5：测试数据库连接

在 Zeabur 后端服务的 **Shell** 中运行：

```bash
npm run test-db
```

这会显示详细的连接信息，包括实际使用的连接参数。

## 🐛 如果仍然失败

### 方案 1：使用内部网络地址

如果 Zeabur 提供了内部网络地址（如 `192.168.26.1`），可能需要：

1. 在 MySQL 服务中允许该 IP 的访问
2. 或者使用 Zeabur 自动注入的内部地址

### 方案 2：检查 MySQL 用户权限

错误信息显示 `Access denied for user 'root'@'192.168.26.1'`，这可能意味着：

1. MySQL 用户 `root` 不允许从该 IP 连接
2. 密码不正确
3. 需要使用不同的用户

### 方案 3：手动设置环境变量

如果自动注入不工作，手动设置所有数据库连接变量：

```
DB_HOST=sjc1.clusters.zeabur.com
DB_PORT=28686
DB_USER=root
DB_PASSWORD=你的实际密码
DB_NAME=zeabur
DB_SSL=true
```

## 📋 检查清单

- [ ] MySQL 服务已关联到后端服务
- [ ] 环境变量已正确设置（使用自动注入或手动设置）
- [ ] `DB_PASSWORD` 与 MySQL 服务的实际密码一致
- [ ] `DB_SSL=true` 已设置
- [ ] 已重新部署后端服务
- [ ] 查看日志中的 "=== 数据库连接配置 ===" 部分
- [ ] 运行 `npm run test-db` 测试连接

## 🔍 调试命令

在 Zeabur 后端服务的 Shell 中运行：

```bash
# 检查环境变量
echo "DB_HOST: $DB_HOST"
echo "DB_PORT: $DB_PORT"
echo "DB_USER: $DB_USER"
echo "DB_PASSWORD: $DB_PASSWORD"
echo "DB_NAME: $DB_NAME"
echo "DB_SSL: $DB_SSL"

# 测试连接
npm run test-db
```

## 📝 关于 Caddy 服务器

从第二张图片看，容器中运行了 Caddy 服务器。这是正常的，因为：

1. Zeabur 可能自动添加了 Caddy 作为反向代理
2. Caddy 会将请求转发到你的 Node.js 应用
3. Node.js 应用应该在 Caddy 后面运行

如果看不到 Node.js 应用的日志，可能是：
- 日志被 Caddy 的日志覆盖
- 需要查看不同的日志流
- Node.js 应用可能没有正常启动

## 🚀 下一步

1. 重新部署后端服务（包含新的调试日志）
2. 查看日志中的 "=== 数据库连接配置 ===" 部分
3. 确认实际使用的连接参数
4. 如果 `DB_HOST` 显示为 `192.168.26.1`，说明环境变量没有正确传递
5. 检查 MySQL 服务关联和自动注入的环境变量

