# Zeabur CORS 错误修复指南

## 🔍 当前问题

错误信息：
```
Access to XMLHttpRequest at 'https://api-jingjing-io.zeabur.app/api/auth/login' 
from origin 'https://jingjing-io.zeabur.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ 已完成的修复

1. **改进了 CORS 配置**：
   - 添加了更详细的 CORS 选项
   - 添加了调试日志
   - 改进了预检请求（OPTIONS）的处理

2. **添加了环境变量调试日志**：
   - 启动时会打印关键环境变量
   - 可以查看实际使用的 `CORS_ORIGIN` 值

## 🔧 解决步骤

### 步骤 1：确认后端环境变量

在 Zeabur 后端服务的环境变量中，确认：

```
CORS_ORIGIN=https://jingjing-io.zeabur.app
```

⚠️ **重要**：
- 必须包含 `https://` 协议
- 值必须与前端域名完全一致（`https://jingjing-io.zeabur.app`）
- 不要有多余的空格

### 步骤 2：提交代码更改

我已经更新了 `io-api/server.js`，改进了 CORS 配置。你需要：

1. 提交代码更改：
   ```bash
   git add io-api/server.js
   git commit -m "改进 CORS 配置和调试日志"
   git push
   ```

2. 或者直接在 Zeabur 中重新部署（如果使用自动部署）

### 步骤 3：重新部署后端服务

在 Zeabur 中：
1. 进入后端服务（io-api）
2. 点击 **"重新部署"** 或 **"Redeploy"**
3. 等待部署完成

### 步骤 4：检查部署日志

部署完成后，查看后端服务的日志，应该看到：

```
=== 环境变量检查 ===
NODE_ENV: production
PORT: 3000
CORS_ORIGIN: https://jingjing-io.zeabur.app
DB_HOST: sjc1.clusters.zeabur.com
==================
允许的 CORS 来源: [ 'https://jingjing-io.zeabur.app' ]
```

如果 `CORS_ORIGIN` 显示为 `undefined` 或空值，说明环境变量没有正确设置。

### 步骤 5：测试

重新部署后，在前端尝试登录。如果仍然有 CORS 错误：

1. 打开浏览器开发者工具 → Network
2. 查看 OPTIONS 请求（预检请求）的响应头
3. 确认响应头中包含 `Access-Control-Allow-Origin: https://jingjing-io.zeabur.app`

## 🐛 常见问题排查

### 问题 1：环境变量未生效

**症状**：日志中 `CORS_ORIGIN` 显示为 `undefined`

**解决方法**：
1. 在 Zeabur 中检查环境变量是否已保存
2. 确认环境变量名称拼写正确（`CORS_ORIGIN`，不是 `CORS_ORIGINS`）
3. 重新部署服务

### 问题 2：域名不匹配

**症状**：日志显示 "CORS 阻止的来源"

**解决方法**：
1. 确认 `CORS_ORIGIN` 的值与前端域名完全一致
2. 检查是否有 `www.` 前缀的差异
3. 确认协议（`https://`）正确

### 问题 3：预检请求失败

**症状**：OPTIONS 请求返回 404 或 500

**解决方法**：
1. 确认后端服务正常运行
2. 检查路由配置是否正确
3. 查看后端日志中的错误信息

### 问题 4：仍然有 CORS 错误

**临时解决方案**（仅用于测试）：

如果问题持续，可以临时允许所有来源（**仅用于调试，生产环境不安全**）：

```
CORS_ORIGIN=*
```

⚠️ **警告**：这会让所有网站都能访问你的 API，仅用于调试。找到问题后应立即改回正确的域名。

## 📋 检查清单

- [ ] `CORS_ORIGIN` 环境变量已设置为 `https://jingjing-io.zeabur.app`
- [ ] 环境变量已保存
- [ ] 代码已提交并推送（如果使用 Git）
- [ ] 后端服务已重新部署
- [ ] 部署日志显示 `CORS_ORIGIN` 正确加载
- [ ] 前端可以成功发送请求

## 🔍 调试命令

如果问题持续，可以在后端服务的 Shell 中运行：

```bash
# 检查环境变量
echo $CORS_ORIGIN

# 测试 CORS 配置
node -e "
const cors = require('cors');
const origin = process.env.CORS_ORIGIN || 'http://localhost:5173';
console.log('CORS_ORIGIN:', origin);
"
```

## 📞 如果问题仍然存在

如果按照以上步骤操作后仍然有 CORS 错误，请提供：

1. 后端服务的部署日志（特别是启动时的环境变量检查部分）
2. 浏览器 Network 面板中 OPTIONS 请求的详细信息
3. 浏览器控制台的完整错误信息

