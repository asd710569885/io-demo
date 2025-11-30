import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
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

    console.log('🔍 测试数据库连接...');
    console.log(`Host: ${dbConfig.host}`);
    console.log(`Port: ${dbConfig.port}`);
    console.log(`User: ${dbConfig.user}`);
    console.log(`Password: ${dbConfig.password ? '***已设置***' : '❌ 未设置'}`);
    console.log('');

    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ 连接成功！');
    
    // 测试查询
    const [rows] = await connection.query('SELECT VERSION() as version');
    console.log(`MySQL 版本: ${rows[0].version}`);
    
    // 列出所有数据库
    const [databases] = await connection.query('SHOW DATABASES');
    console.log('\n📁 可用数据库:');
    databases.forEach(db => {
      console.log(`  - ${db.Database}`);
    });
    
    await connection.end();
    console.log('\n✅ 测试完成！');
    
  } catch (error) {
    console.error('\n❌ 连接失败！');
    console.error('错误信息:', error.message);
    console.error('错误代码:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  连接被拒绝！');
      console.error('\n可能的原因和解决方案：');
      console.error('1. Zeabur MySQL 需要配置 IP 白名单');
      console.error('   - 登录 Zeabur 控制台');
      console.error('   - 找到你的 MySQL 服务');
      console.error('   - 在 "Network Access" 中添加你的公网 IP');
      console.error('   - 或者临时使用 0.0.0.0/0 允许所有 IP（仅测试用）');
      console.error('\n2. 检查网络连接');
      console.error('   - 确保可以访问互联网');
      console.error('   - 检查防火墙设置');
      console.error('\n3. 验证连接信息');
      console.error('   - 确认 .env 文件中的配置正确');
      console.error('   - 确认端口号是数字类型');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n⚠️  连接超时！');
      console.error('请检查网络连接和防火墙设置');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️  认证失败！');
      console.error('请检查用户名和密码是否正确');
    }
    
    process.exit(1);
  }
}

testConnection();

