import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import employeesRoutes from './routes/employees.js';
import materialsRoutes from './routes/materials.js';
import logsRoutes from './routes/logs.js';

dotenv.config();

const app = express();
const PORT = process.env.WEB_PORT || process.env.PORT || 3000;

// 中间件 - CORS 配置（必须在所有中间件之前）
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

const corsOptions = {
  origin: function (origin, callback) {
    // 允许没有 origin 的请求（如移动应用或 Postman）
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
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

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString()
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({ 
    message: 'IO API Server',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/logs', logsRoutes);

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

// 启动服务器
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

// 监听服务器错误
server.on('error', (err) => {
  console.error('服务器错误:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用`);
  }
});

// 捕获未处理的异常，防止服务器崩溃
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
});



