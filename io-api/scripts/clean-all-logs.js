import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function cleanAllLogs() {
  let connection;
  
  try {
    const dbConfig = {
      host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306'),
      user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
      password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'zeabur',
      ssl: (process.env.MYSQL_SSL === 'true' || process.env.DB_SSL === 'true') ? {
        rejectUnauthorized: false
      } : false,
      connectTimeout: 10000,
    };

    console.log('正在连接MySQL服务器...');
    console.log(`Host: ${dbConfig.host}`);
    console.log(`Port: ${dbConfig.port}`);
    console.log(`User: ${dbConfig.user}`);
    console.log(`Database: ${dbConfig.database}`);
    console.log('');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 连接到MySQL服务器成功\n');

    // 先查询当前日志数量
    const [countResult] = await connection.query('SELECT COUNT(*) as count FROM operation_logs');
    const logCount = countResult[0].count;
    
    console.log(`当前日志总数: ${logCount}`);
    
    if (logCount === 0) {
      console.log('✅ 日志表已经是空的，无需清理');
      await connection.end();
      return;
    }

    // 确认删除
    console.log('\n⚠️  警告：此操作将删除所有日志数据，且不可恢复！');
    console.log(`将删除 ${logCount} 条日志记录\n`);
    
    // 执行删除
    console.log('正在删除所有日志...');
    const [result] = await connection.query('DELETE FROM operation_logs');
    
    console.log(`✅ 删除成功！共删除 ${result.affectedRows} 条日志记录`);
    
    // 验证删除结果
    const [verifyResult] = await connection.query('SELECT COUNT(*) as count FROM operation_logs');
    const remainingCount = verifyResult[0].count;
    
    if (remainingCount === 0) {
      console.log('✅ 验证通过：所有日志已成功删除');
    } else {
      console.log(`⚠️  警告：仍有 ${remainingCount} 条日志未删除`);
    }
    
    await connection.end();
    console.log('\n✅ 操作完成！');
    
  } catch (error) {
    console.error('\n❌ 操作失败！');
    console.error('错误信息:', error.message);
    if (error.code) {
      console.error('错误代码:', error.code);
    }
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

// 运行脚本
cleanAllLogs();

