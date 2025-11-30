import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateInsuranceFields() {
  let connection;
  
  try {
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'io_system',
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false,
      connectTimeout: 10000,
    };

    console.log('正在连接MySQL服务器...');
    connection = await mysql.createConnection(dbConfig);
    console.log('连接成功！');

    // 检查字段是否已存在
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'employees' AND COLUMN_NAME = 'pension_company'
    `, [dbConfig.database]);

    if (columns.length > 0) {
      console.log('保险字段已存在，跳过迁移');
      return;
    }

    console.log('开始添加保险字段...');

    // 读取并执行迁移SQL
    const sqlPath = path.join(__dirname, '../database/migration_add_insurance_fields.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // 分割SQL语句并执行
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
          console.log('✓ 执行成功');
        } catch (err) {
          // 如果字段已存在，忽略错误
          if (err.message.includes('Duplicate column name')) {
            console.log('⚠ 字段已存在，跳过');
          } else {
            throw err;
          }
        }
      }
    }

    console.log('\n✅ 迁移完成！保险字段已成功添加。');
    
  } catch (error) {
    console.error('\n❌ 迁移失败！');
    console.error('错误信息:', error.message);
    console.error('错误代码:', error.code);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrateInsuranceFields();

