import pool from '../database/connection.js';

export const logOperation = async (req, action, module, description) => {
  try {
    if (!req.user) return;
    
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    
    await pool.query(
      `INSERT INTO operation_logs (user_id, username, action, module, description, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.username, action, module, description, ipAddress]
    );
  } catch (error) {
    console.error('记录日志失败:', error);
  }
};


