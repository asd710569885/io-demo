import express from 'express';
import pool from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 所有路由都需要认证
router.use(authenticateToken);

// 获取日志列表
router.get('/', async (req, res) => {
  try {
    const { module, action, username, startDate, endDate, page = 1, pageSize = 50 } = req.query;
    const offset = (page - 1) * pageSize;

    let query = `
      SELECT ol.*, u.role 
      FROM operation_logs ol
      LEFT JOIN users u ON ol.user_id = u.id
      WHERE 1=1
    `;
    let params = [];

    if (module) {
      query += ' AND ol.module = ?';
      params.push(module);
    }
    if (action) {
      query += ' AND ol.action = ?';
      params.push(action);
    }
    if (username) {
      query += ' AND ol.username LIKE ?';
      params.push(`%${username}%`);
    }
    if (startDate) {
      query += ' AND DATE(ol.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND DATE(ol.created_at) <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY ol.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);

    const [logs] = await pool.query(query, params);

    // 获取总数
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM operation_logs ol
      WHERE 1=1
    `;
    let countParams = [];
    if (module) {
      countQuery += ' AND ol.module = ?';
      countParams.push(module);
    }
    if (action) {
      countQuery += ' AND ol.action = ?';
      countParams.push(action);
    }
    if (username) {
      countQuery += ' AND ol.username LIKE ?';
      countParams.push(`%${username}%`);
    }
    if (startDate) {
      countQuery += ' AND DATE(ol.created_at) >= ?';
      countParams.push(startDate);
    }
    if (endDate) {
      countQuery += ' AND DATE(ol.created_at) <= ?';
      countParams.push(endDate);
    }
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      data: logs,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('获取日志列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取统计信息
router.get('/statistics', async (req, res) => {
  try {
    const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM operation_logs');
    const [createResult] = await pool.query("SELECT COUNT(*) as count FROM operation_logs WHERE action = 'create'");
    const [updateResult] = await pool.query("SELECT COUNT(*) as count FROM operation_logs WHERE action = 'update'");
    const [deleteResult] = await pool.query("SELECT COUNT(*) as count FROM operation_logs WHERE action = 'delete'");

    res.json({
      total: totalResult[0].total,
      create: createResult[0].count,
      update: updateResult[0].count,
      delete: deleteResult[0].count,
    });
  } catch (error) {
    console.error('获取统计信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;



