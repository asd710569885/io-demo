import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import employeesRoutes from './routes/employees.js';
import materialsRoutes from './routes/materials.js';
import logsRoutes from './routes/logs.js';

dotenv.config();

console.log('✅ 所有路由模块加载成功');

// 启动时打印关键环境变量（用于调试）
console.log('=== 环境变量检查 ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('==================');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件 - CORS 配置（必须在所有中间件之前）
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

console.log('允许的 CORS 来源:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // 允许没有 origin 的请求（如移动应用或 Postman）
    if (!origin) {
      console.log('⚠️ 请求没有 origin 头，允许通过');
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS 允许的来源:', origin);
      callback(null, true);
    } else {
      console.warn('⚠️ CORS 阻止的来源:', origin);
      console.warn('当前允许的来源:', allowedOrigins);
      callback(new Error('不允许的 CORS 来源'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// 先应用 CORS 中间件
app.use(cors(corsOptions));

// 显式处理所有 OPTIONS 预检请求（确保预检请求被正确处理）
app.options('*', cors(corsOptions));

// 其他中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || '无'}`);
  next();
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/logs', logsRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// CORS 测试端点
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS 测试成功',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('错误:', err);
  
  // CORS 错误特殊处理
  if (err.message === '不允许的 CORS 来源') {
    return res.status(403).json({ 
      message: 'CORS 错误: 不允许的来源',
      origin: req.headers.origin,
      allowedOrigins: allowedOrigins
    });
  }
  
  res.status(500).json({ message: '服务器内部错误' });
});

// 启动服务器 - 监听所有网络接口（Zeabur 需要）
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 服务器运行在端口 ${PORT}`);
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`监听地址: 0.0.0.0:${PORT}`);
});

// 捕获未处理的异常，防止服务器崩溃
process.on('uncaughtException', (err) => {
  console.error('❌ 未捕获的异常:', err);
  // 不要立即退出，让服务器继续运行
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的 Promise 拒绝:', reason);
  console.error('Promise:', promise);
  // 不要立即退出，让服务器继续运行
});



