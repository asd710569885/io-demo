import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  let connection;
  
  try {
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      // Zeabur MySQL 可能需要 SSL 连接
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false,
      // 增加连接超时时间
      connectTimeout: 10000,
    };

    console.log('正在连接MySQL服务器...');
    console.log(`Host: ${dbConfig.host}`);
    console.log(`Port: ${dbConfig.port}`);
    console.log(`User: ${dbConfig.user}`);
    
    // 先连接到MySQL服务器（不指定数据库）
    connection = await mysql.createConnection(dbConfig);

    console.log('连接到MySQL服务器成功');

    // 创建数据库（如果不存在）
    const dbName = process.env.DB_NAME || 'zeabur';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`数据库 ${dbName} 创建成功或已存在`);

    await connection.query(`USE \`${dbName}\``);

    // 读取并执行SQL文件
    const sqlPath = path.join(__dirname, '../database/schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // 分割SQL语句并执行
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
        } catch (err) {
          // 忽略某些错误（如表已存在）
          if (!err.message.includes('already exists') && !err.message.includes('Duplicate entry')) {
            console.warn('执行SQL语句时出错:', err.message);
          }
        }
      }
    }

    // 创建默认管理员账号
    const adminPassword = await bcryptjs.hash('admin123', 10);
    await connection.query(
      `INSERT INTO users (username, password, email, role) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE password = VALUES(password)`,
      ['admin', adminPassword, 'admin@io-system.com', 'admin']
    );

    console.log('数据库初始化完成！');
    console.log('默认管理员账号：');
    console.log('  用户名: admin');
    console.log('  密码: admin123');
    
  } catch (error) {
    console.error('\n❌ 初始化数据库失败！');
    console.error('错误信息:', error.message);
    console.error('错误代码:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  连接被拒绝，可能的原因：');
      console.error('1. Zeabur MySQL 可能只允许从特定 IP 访问（需要配置 IP 白名单）');
      console.error('2. 检查 Zeabur 控制台中的 "Allowed IPs" 或 "Network Access" 设置');
      console.error('3. 确保你的本地 IP 地址已添加到白名单');
      console.error('4. 如果使用 VPN，可能需要断开 VPN 或添加 VPN IP');
      console.error('\n💡 解决方案：');
      console.error('- 登录 Zeabur 控制台，找到你的 MySQL 服务');
      console.error('- 在 "Network Access" 或 "Allowed IPs" 中添加你的公网 IP');
      console.error('- 或者使用 0.0.0.0/0 允许所有 IP（仅用于测试，生产环境不推荐）');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n⚠️  连接超时，可能的原因：');
      console.error('1. 网络连接问题');
      console.error('2. 防火墙阻止了连接');
      console.error('3. 主机地址或端口错误');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️  访问被拒绝，请检查用户名和密码是否正确');
    }
    
    console.error('\n当前配置：');
    console.error(`DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
    console.error(`DB_PORT: ${process.env.DB_PORT || '3306'}`);
    console.error(`DB_USER: ${process.env.DB_USER || 'root'}`);
    console.error(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '***已设置***' : '未设置'}`);
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();

