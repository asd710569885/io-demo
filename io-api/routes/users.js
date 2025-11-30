import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../database/connection.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { logOperation } from '../middleware/logger.js';

const router = express.Router();

// 所有路由都需要认证
router.use(authenticateToken);

// 获取用户列表（管理员和管理员可以看到，但管理员看不到超级管理员）
router.get('/', requireRole('admin', 'manager'), async (req, res) => {
  try {
    let query = 'SELECT id, username, email, role, created_at FROM users';
    let params = [];

    // 管理员只能看到管理员和普通用户，看不到超级管理员
    if (req.user.role === 'manager') {
      query += ' WHERE role IN (?, ?)';
      params = ['manager', 'user'];
    }

    query += ' ORDER BY created_at DESC';

    const [users] = await pool.query(query, params);
    res.json(users);
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建用户
router.post('/', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    // 验证必填字段
    if (!username || username.trim() === '') {
      return res.status(400).json({ message: '用户名不能为空' });
    }
    if (!password || password.trim() === '') {
      return res.status(400).json({ message: '密码不能为空' });
    }

    // 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({ message: '密码长度不能少于6位' });
    }

    // 管理员不能创建超级管理员
    if (req.user.role === 'manager' && role === 'admin') {
      return res.status(403).json({ message: '权限不足，无法创建超级管理员' });
    }

    // 管理员只能创建普通用户
    const finalRole = req.user.role === 'manager' ? 'user' : (role || 'user');

    // 验证邮箱格式（如果提供了邮箱）
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: '邮箱格式不正确' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
      [username.trim(), hashedPassword, email && email.trim() !== '' ? email.trim() : null, finalRole]
    );

    await logOperation(req, 'create', 'users', `创建用户: ${username}`);
    res.status(201).json({ message: '用户创建成功', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: '用户名已存在' });
    }
    console.error('创建用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新用户
router.put('/:id', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, email, role } = req.body;

    // 检查用户是否存在
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const targetUser = users[0];

    // 管理员不能修改超级管理员
    if (req.user.role === 'manager' && targetUser.role === 'admin') {
      return res.status(403).json({ message: '权限不足，无法修改超级管理员' });
    }

    // 管理员不能将用户改为超级管理员
    if (req.user.role === 'manager' && role === 'admin') {
      return res.status(403).json({ message: '权限不足，无法设置超级管理员角色' });
    }

    let updateFields = [];
    let params = [];

    if (username) {
      updateFields.push('username = ?');
      params.push(username);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      params.push(email);
    }
    if (role && req.user.role === 'admin') {
      updateFields.push('role = ?');
      params.push(role);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      params.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: '没有要更新的字段' });
    }

    params.push(id);

    await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    await logOperation(req, 'update', 'users', `更新用户: ${targetUser.username}`);
    res.json({ message: '用户更新成功' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: '用户名已存在' });
    }
    console.error('更新用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除用户
router.delete('/:id', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;

    // 不能删除自己
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: '不能删除自己的账号' });
    }

    // 检查用户是否存在
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const targetUser = users[0];

    // 管理员不能删除超级管理员
    if (req.user.role === 'manager' && targetUser.role === 'admin') {
      return res.status(403).json({ message: '权限不足，无法删除超级管理员' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    await logOperation(req, 'delete', 'users', `删除用户: ${targetUser.username}`);
    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;



