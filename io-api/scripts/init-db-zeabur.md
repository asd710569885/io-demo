# Zeabur 数据库初始化指南

## 问题：zeabur 数据库中没有项目表

如果你在 Zeabur 数据库管理界面看到 `zeabur` 数据库显示"12 数据表"，但这些是系统表，不是项目需要的表。

## 解决方案：运行数据库初始化脚本

### 方法一：在 Zeabur 后端服务的 Shell 中运行

1. 在 Zeabur Dashboard 中找到你的后端服务（io-api）
2. 点击进入服务详情
3. 找到 **"Shell"** 或 **"Terminal"** 选项
4. 运行以下命令：

```bash
npm run init-db
```

这会创建以下表：
- `users` - 用户表
- `employees` - 人员表
- `material_types` - 物资类型表
- `materials` - 物资表
- `material_records` - 物资领用记录表
- `operation_logs` - 操作日志表

### 方法二：如果需要运行迁移

如果表已创建但缺少某些字段，运行：

```bash
npm run migrate-insurance
npm run migrate-fix-employee-id
```

## 验证表是否创建成功

在 Zeabur 数据库管理界面中：
1. 点击 `zeabur` 数据库
2. 应该能看到以下表：
   - `users`
   - `employees`
   - `material_types`
   - `materials`
   - `material_records`
   - `operation_logs`

## 如果初始化失败

检查以下几点：
1. 环境变量是否正确配置（特别是数据库连接信息）
2. 数据库服务是否已启动
3. 网络访问是否允许（Zeabur MySQL 可能需要配置 IP 白名单）
4. SSL 连接是否启用（`DB_SSL=true`）

查看 Shell 中的错误信息，根据错误提示进行修复。

