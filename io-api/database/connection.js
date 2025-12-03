import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 支持 Zeabur 自动注入的环境变量（优先级更高）
// Zeabur 会自动注入 MYSQL_* 环境变量，也支持自定义的 DB_* 变量
const dbConfig = {
  // 优先使用 Zeabur 自动注入的变量，否则使用自定义变量，最后使用默认值
  host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306'),
  user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'zeabur',
  // Zeabur MySQL 通常需要 SSL 连接
  ssl: (process.env.MYSQL_SSL === 'true' || process.env.DB_SSL === 'true') ? {
    rejectUnauthorized: false
  } : false,
};


const pool = mysql.createPool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  ssl: dbConfig.ssl,
  connectTimeout: 10000,
});

// 测试数据库连接
pool.getConnection()
  .then(connection => {
    connection.release();
  })
  .catch(err => {
    console.error('数据库连接失败:', err.message);
  });

export default pool;

