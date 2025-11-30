# Zeabur 无法识别 Node.js 的解决方案

## 🔍 问题诊断

如果 Zeabur 仍然检测为 "static" 而不是 "Node.js"，请按以下步骤操作：

## ✅ 解决方案 1：删除并重新创建服务（推荐）

### 步骤 1：删除当前服务

1. 在 Zeabur Dashboard 中找到你的服务
2. 点击服务设置（齿轮图标）
3. 滚动到底部，点击 **"删除服务"** 或 **"Delete Service"**
4. 确认删除

### 步骤 2：重新创建服务

1. 点击 **"Add Service"** 或 **"添加服务"**
2. 选择 **"GitHub"** 或 **"GitLab"**，连接到你的仓库
3. **重要**：在构建计划预览对话框中：
   - 点击 **"配置"** 或 **"Configure"**
   - 找到 **"Root Directory"** 或 **"根目录"**
   - 设置为：`io-api`
   - **不要直接点击部署！**

### 步骤 3：手动选择 Provider

如果配置后仍然显示 "static"：

1. 在配置对话框中查找 **"Provider"** 或 **"框架"** 选项
2. 手动选择 **"Node.js"** 或 **"Custom"**
3. 如果找不到此选项，继续下一步

### 步骤 4：使用环境变量强制指定

在服务创建后，立即添加以下环境变量：

```
ZEABUR_PROVIDER=nodejs
ZEABUR_ROOT_DIRECTORY=io-api
```

然后点击 **"重新部署"**。

## ✅ 解决方案 2：使用 Config Editor

1. 在服务设置中找到 **"配置"** (Configuration) 部分
2. 点击 **"Open Config Editor"**
3. 在配置文件中添加：

```yaml
build:
  command: npm install
start:
  command: node server.js
rootDirectory: io-api
```

4. 保存并重新部署

## ✅ 解决方案 3：检查 Git 仓库

确保 `io-api/package.json` 和 `io-api/zeabur.json` 已提交到 Git：

```bash
# 检查文件是否存在
git ls-files io-api/package.json
git ls-files io-api/zeabur.json

# 如果不存在，添加并提交
git add io-api/package.json io-api/zeabur.json
git commit -m "Add Zeabur configuration"
git push
```

## ✅ 解决方案 4：使用 Zeabur CLI（高级）

如果以上方法都不行，可以使用 Zeabur CLI：

```bash
# 安装 Zeabur CLI
npm install -g @zeabur/cli

# 登录
zeabur login

# 部署
cd io-api
zeabur deploy
```

## 🔧 验证配置

部署后，检查：

1. **服务状态**：应该显示 "运行中"
2. **日志**：在 "日志" 标签页查看，应该看到 Node.js 启动信息
3. **文件**：在 "文件" 标签页，应该能看到 `node_modules` 目录

## 📝 如果仍然不行

如果以上所有方法都不行，请：

1. 截图服务设置页面
2. 截图构建日志
3. 检查 `io-api/package.json` 是否在 Git 仓库中
4. 联系 Zeabur 支持或在 GitHub 上提交 issue

## 🎯 快速检查清单

- [ ] `io-api/package.json` 存在且已提交到 Git
- [ ] `io-api/zeabur.json` 存在且已提交到 Git
- [ ] Root Directory 设置为 `io-api`
- [ ] 已添加环境变量 `ZEABUR_PROVIDER=nodejs`
- [ ] 已重新部署服务
- [ ] 检查日志确认 Node.js 已启动

