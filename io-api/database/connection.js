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

// 调试：打印数据库连接配置（不显示密码）
console.log('=== 数据库连接配置 ===');
console.log('DB_HOST:', dbConfig.host);
console.log('DB_PORT:', dbConfig.port);
console.log('DB_USER:', dbConfig.user);
console.log('DB_PASSWORD:', dbConfig.password ? '***已设置***' : '❌ 未设置');
console.log('DB_NAME:', dbConfig.database);
console.log('DB_SSL:', dbConfig.ssl ? 'true' : 'false');
console.log('环境变量来源:');
console.log('  - MYSQL_HOST:', process.env.MYSQL_HOST ? '✅' : '❌');
console.log('  - DB_HOST:', process.env.DB_HOST ? '✅' : '❌');
console.log('  - MYSQL_USER:', process.env.MYSQL_USER ? '✅' : '❌');
console.log('  - DB_USER:', process.env.DB_USER ? '✅' : '❌');
console.log('==================');

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
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      ssl: dbConfig.ssl ? 'true' : 'false'
    });
    
    // 提供具体的解决建议
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 解决建议:');
      console.error('1. 检查数据库密码是否正确（MYSQL_PASSWORD 或 DB_PASSWORD）');
      console.error('2. 检查 MySQL 用户名是否正确（MYSQL_USER 或 DB_USER）');
      console.error('3. 如果使用 Zeabur 自动注入，确认 MySQL 服务已正确关联');
      console.error('4. 在 Zeabur Dashboard 中检查 MySQL 服务的连接信息');
      console.error('5. 确保使用 Zeabur 提供的正确用户名（通常是 root）');
      console.error('6. 如果手动配置，请使用 Zeabur MySQL 服务详情页中的连接信息');
    } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      console.error('\n💡 解决建议:');
      console.error('1. 检查 DB_HOST 或 MYSQL_HOST 是否正确');
      console.error('2. 检查 DB_PORT 或 MYSQL_PORT 是否正确');
      console.error('3. 确认 MySQL 服务正在运行');
      console.error('4. 在 Zeabur 上，确保使用正确的内部连接地址');
    }
  });

export default pool;

