import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 调试：打印数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ? '***已设置***' : '❌ 未设置',
  database: process.env.DB_NAME || 'zeabur',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
};

console.log('=== 数据库连接配置 ===');
console.log('DB_HOST:', dbConfig.host);
console.log('DB_PORT:', dbConfig.port);
console.log('DB_USER:', dbConfig.user);
console.log('DB_PASSWORD:', dbConfig.password);
console.log('DB_NAME:', dbConfig.database);
console.log('DB_SSL:', process.env.DB_SSL);
console.log('==================');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'zeabur',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  // Zeabur MySQL 可能需要 SSL 连接
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  connectTimeout: 10000,
});

// 测试数据库连接
pool.getConnection()
  .then(connection => {
    console.log('✅ 数据库连接成功');
    console.log('连接信息:', {
      host: connection.config.host,
      port: connection.config.port,
      user: connection.config.user,
      database: connection.config.database
    });
    connection.release();
  })
  .catch(err => {
    console.error('❌ 数据库连接失败');
    console.error('错误类型:', err.code);
    console.error('错误消息:', err.message);
    console.error('错误详情:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL
    });
    
    // 提供具体的解决建议
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 解决建议:');
      console.error('1. 检查 DB_PASSWORD 是否正确');
      console.error('2. 检查 MySQL 用户权限是否允许从当前 IP 连接');
      console.error('3. 如果使用 Zeabur 自动注入，确认 MySQL 服务已正确关联');
      console.error('4. 尝试使用 Zeabur 提供的内部连接地址');
    } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      console.error('\n💡 解决建议:');
      console.error('1. 检查 DB_HOST 是否正确');
      console.error('2. 检查 DB_PORT 是否正确');
      console.error('3. 确认 MySQL 服务正在运行');
    }
  });

export default pool;

