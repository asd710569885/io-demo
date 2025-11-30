import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
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
    console.log(`Host: ${dbConfig.host}`);
    console.log(`Port: ${dbConfig.port}`);
    console.log(`Database: ${dbConfig.database}`);
    
    connection = await mysql.createConnection(dbConfig);
    console.log('连接成功！');

    // 检查 employee_id 列是否已经允许 NULL
    const [columns] = await connection.query(`
      SELECT IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'material_records' AND COLUMN_NAME = 'employee_id'
    `, [dbConfig.database]);

    if (columns.length > 0 && columns[0].IS_NULLABLE === 'YES') {
      console.log('employee_id 列已经允许 NULL，跳过迁移');
      return;
    }

    console.log('开始迁移：修改 material_records 表，允许 employee_id 为 NULL...');

    // 读取并执行迁移SQL
    const sqlPath = path.join(__dirname, '../database/migration_fix_material_records_employee_id.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // 分割SQL语句并执行
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
          console.log('✓ 执行成功');
        } catch (err) {
          console.error('执行SQL时出错:', err.message);
          throw err;
        }
      }
    }

    console.log('\n✅ 迁移完成！material_records.employee_id 现在允许为 NULL。');
    
  } catch (error) {
    console.error('\n❌ 迁移失败！');
    console.error('错误信息:', error.message);
    if (error.code) {
      console.error('错误代码:', error.code);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrate();

