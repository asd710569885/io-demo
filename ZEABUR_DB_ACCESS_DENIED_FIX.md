# Zeabur 数据库 Access Denied 错误修复指南

## 🔍 当前问题

从日志看到：
- ✅ 环境变量已正确加载：`DB_HOST: sjc1.clusters.zeabur.com`
- ✅ 配置看起来正确：`DB_PORT: 28686`, `DB_USER: root`, `DB_PASSWORD: ***已设置***`
- ❌ 连接失败：`Access denied for user 'root'@'192.168.26.1' (using password: YES)`

**关键发现**：
- 连接尝试来自 `192.168.26.1`（这是 `sjc1.clusters.zeabur.com` 解析到的内部 IP）
- MySQL 拒绝了来自该 IP 的连接

## 🔧 解决方案

### 方案 1：使用 Zeabur 自动注入的环境变量（推荐）

Zeabur 的 MySQL 服务提供了自动注入的环境变量，这些变量会使用正确的内部连接配置。

#### 步骤：

1. **在 Zeabur Dashboard 中，进入后端服务（io-api）**

2. **找到 "Dependencies" 或 "Connect" 选项**
   - 确认 MySQL 服务已关联
   - 如果未关联，请关联 MySQL 服务

3. **删除手动设置的数据库环境变量**，使用自动注入的变量：

   删除这些：
   ```
   DB_HOST=sjc1.clusters.zeabur.com
   DB_PORT=28686
   DB_USER=root
   DB_PASSWORD=v6lI0yWFos4hg0VxJQGdu187395tj2f
   DB_NAME=zeabur
   ```

   添加这些（使用变量引用）：
   ```
   DB_HOST=${{mysql.MYSQL_HOST}}
   DB_PORT=${{mysql.MYSQL_PORT}}
   DB_USER=${{mysql.MYSQL_USER}}
   DB_PASSWORD=${{mysql.MYSQL_PASSWORD}}
   DB_NAME=${{mysql.MYSQL_DATABASE}}
   DB_SSL=true
   ```

   **注意**：`mysql` 是你的 MySQL 服务名称。如果服务名称不同，请相应调整。

4. **保存并重新部署**

### 方案 2：检查并更新 MySQL 密码

如果方案 1 不工作，可能是密码不正确。

#### 步骤：

1. **在 Zeabur Dashboard 中，进入 MySQL 服务**

2. **查看服务详情**，找到实际的连接信息：
   - Host
   - Port
   - Username
   - Password
   - Database

3. **在后端服务的环境变量中，更新 `DB_PASSWORD`**：
   ```
   DB_PASSWORD=实际的MySQL密码
   ```

4. **保存并重新部署**

### 方案 3：检查 MySQL 用户权限

如果 MySQL 用户 `root` 不允许从 `192.168.26.1` 连接，可能需要：

1. **在 MySQL 服务中创建允许从任何 IP 连接的用户**（如果 Zeabur 支持）

2. **或者使用 Zeabur 提供的内部连接方式**

### 方案 4：使用内部网络地址（如果 Zeabur 提供）

某些情况下，Zeabur 可能提供了专门的内部网络地址用于服务间通信。

#### 步骤：

1. **在 Zeabur Dashboard 中，查看 MySQL 服务的连接信息**

2. **查找 "Internal Host" 或 "Service Host"**（如果有）

3. **使用内部地址更新 `DB_HOST`**：
   ```
   DB_HOST=内部地址（如果有）
   ```

## 📋 详细操作步骤（推荐方案 1）

### 步骤 1：关联 MySQL 服务

1. 在 Zeabur Dashboard 中，进入后端服务（io-api）
2. 找到 **"Dependencies"** 或 **"Connect"** 或 **"连接"** 选项
3. 点击 **"Connect"** 或 **"连接"**
4. 选择你的 MySQL 服务
5. 确认关联成功

### 步骤 2：配置环境变量

1. 在后端服务的 **Environment Variables** 中：

2. **删除手动设置的数据库变量**（如果存在）：
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`

3. **添加自动注入的变量**：
   ```
   DB_HOST=${{mysql.MYSQL_HOST}}
   DB_PORT=${{mysql.MYSQL_PORT}}
   DB_USER=${{mysql.MYSQL_USER}}
   DB_PASSWORD=${{mysql.MYSQL_PASSWORD}}
   DB_NAME=${{mysql.MYSQL_DATABASE}}
   DB_SSL=true
   ```

   **重要**：
   - `mysql` 是你的 MySQL 服务名称
   - 如果服务名称不同，请相应调整（例如：`${{your-mysql-service-name.MYSQL_HOST}}`）

4. **保留其他环境变量**：
   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=5d80e8a1c0525bd83393484186299c55c61e7f5adc13e3f7c72f44044edb9acf
   CORS_ORIGIN=https://jingjing-io.zeabur.app
   ```

### 步骤 3：保存并重新部署

1. 保存所有环境变量
2. 点击 **"重新部署"** 或 **"Redeploy"**
3. 等待部署完成

### 步骤 4：检查日志

部署完成后，查看日志，应该看到：

```
=== 数据库连接配置 ===
DB_HOST: [自动注入的地址]
DB_PORT: [自动注入的端口]
DB_USER: [自动注入的用户]
DB_PASSWORD: ***已设置***
DB_NAME: [自动注入的数据库名]
DB_SSL: true
==================
✅ 数据库连接成功
```

## 🔍 如何找到 MySQL 服务名称

1. 在 Zeabur Dashboard 中，查看你的项目
2. 找到 MySQL 服务
3. 查看服务名称（通常在服务卡片上显示）
4. 在环境变量中使用该名称，格式：`${{服务名称.MYSQL_HOST}}`

**示例**：
- 如果 MySQL 服务名称是 `mysql`，使用：`${{mysql.MYSQL_HOST}}`
- 如果 MySQL 服务名称是 `database`，使用：`${{database.MYSQL_HOST}}`
- 如果 MySQL 服务名称是 `my-mysql`，使用：`${{my-mysql.MYSQL_HOST}}`

## 🐛 如果仍然失败

### 检查清单

- [ ] MySQL 服务已关联到后端服务
- [ ] 环境变量使用了自动注入的变量引用（`${{mysql.XXX}}`）
- [ ] `DB_SSL=true` 已设置
- [ ] 已保存环境变量
- [ ] 已重新部署后端服务
- [ ] 查看日志中的详细错误信息

### 调试命令

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

### 联系支持

如果以上方案都不工作，可能需要：
1. 检查 Zeabur 文档，了解 MySQL 服务的正确连接方式
2. 联系 Zeabur 支持，询问 MySQL 服务的连接配置
3. 检查 MySQL 服务的网络和安全设置

## 📝 总结

**推荐操作**：
1. ✅ 关联 MySQL 服务到后端服务
2. ✅ 使用自动注入的环境变量（`${{mysql.XXX}}`）
3. ✅ 设置 `DB_SSL=true`
4. ✅ 重新部署
5. ✅ 检查日志确认连接成功

这样应该能解决 `Access denied` 错误。

