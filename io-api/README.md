# IO系统后端API

## 环境要求
- Node.js >= 18
- MySQL >= 5.7

## 安装依赖
```bash
npm install
```

## 配置环境变量
复制 `.env.example` 为 `.env` 并修改配置：
```bash
cp .env.example .env
```

## 初始化数据库
```bash
npm run init-db
```

默认管理员账号：
- 用户名: admin
- 密码: admin123

## 运行

### 开发环境
```bash
npm run dev
```

### 生产环境
```bash
npm start
```

## API文档

### 认证
- POST `/api/auth/login` - 登录
- GET `/api/auth/me` - 获取当前用户信息

### 用户管理（需要管理员权限）
- GET `/api/users` - 获取用户列表
- POST `/api/users` - 创建用户
- PUT `/api/users/:id` - 更新用户
- DELETE `/api/users/:id` - 删除用户

### 人员管理
- GET `/api/employees` - 获取人员列表（支持status查询参数）
- GET `/api/employees/:id` - 获取单个人员信息
- POST `/api/employees` - 创建人员
- PUT `/api/employees/:id` - 更新人员
- DELETE `/api/employees/:id` - 删除人员

### 物资管理
- GET `/api/materials/types` - 获取物资类型列表
- POST `/api/materials/types` - 创建物资类型
- PUT `/api/materials/types/:id` - 更新物资类型
- DELETE `/api/materials/types/:id` - 删除物资类型
- GET `/api/materials` - 获取物资列表（包含库存）
- GET `/api/materials/:id` - 获取单个物资信息
- POST `/api/materials` - 创建物资
- PUT `/api/materials/:id` - 更新物资
- DELETE `/api/materials/:id` - 删除物资
- POST `/api/materials/:id/in` - 物资入库
- POST `/api/materials/:id/out` - 物资领用
- GET `/api/materials/records/list` - 获取领用记录

### 日志
- GET `/api/logs` - 获取日志列表（支持module、page、pageSize查询参数）



