import express from 'express';
import pool from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { logOperation } from '../middleware/logger.js';

const router = express.Router();

// 所有路由都需要认证
router.use(authenticateToken);

// 获取物资类型列表
router.get('/types', async (req, res) => {
  try {
    const [types] = await pool.query(
      'SELECT * FROM material_types ORDER BY created_at DESC'
    );
    res.json(types);
  } catch (error) {
    console.error('获取物资类型列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建物资类型
router.post('/types', async (req, res) => {
  try {
    const { name, description, parent_id } = req.body;

    if (!name) {
      return res.status(400).json({ message: '类型名称不能为空' });
    }

    const [result] = await pool.query(
      'INSERT INTO material_types (name, description, parent_id) VALUES (?, ?, ?)',
      [name, description || null, parent_id || null]
    );

    await logOperation(req, 'create', 'materials', `添加物资类型: ${name}`);
    res.status(201).json({ message: '物资类型创建成功', id: result.insertId });
  } catch (error) {
    console.error('创建物资类型错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新物资类型
router.put('/types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parent_id } = req.body;

    const [types] = await pool.query('SELECT * FROM material_types WHERE id = ?', [id]);
    if (types.length === 0) {
      return res.status(404).json({ message: '物资类型不存在' });
    }

    await pool.query(
      'UPDATE material_types SET name = ?, description = ?, parent_id = ? WHERE id = ?',
      [name, description || null, parent_id || null, id]
    );

    await logOperation(req, 'update', 'materials', `更新物资类型: ${name}`);
    res.json({ message: '物资类型更新成功' });
  } catch (error) {
    console.error('更新物资类型错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除物资类型
router.delete('/types/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查类型是否存在
    const [types] = await pool.query('SELECT * FROM material_types WHERE id = ?', [id]);
    if (types.length === 0) {
      return res.status(404).json({ message: '物资类型不存在' });
    }

    // 检查是否有物资使用此类型
    const [materials] = await pool.query('SELECT COUNT(*) as count FROM materials WHERE type_id = ?', [id]);
    if (materials[0].count > 0) {
      return res.status(400).json({ message: `该类型下还有 ${materials[0].count} 个物资，无法删除` });
    }

    // 检查是否有子类型（parent_id 指向此类型）
    const [childTypes] = await pool.query('SELECT COUNT(*) as count FROM material_types WHERE parent_id = ?', [id]);
    if (childTypes[0].count > 0) {
      return res.status(400).json({ message: `该类型下还有 ${childTypes[0].count} 个子类型，无法删除` });
    }

    await pool.query('DELETE FROM material_types WHERE id = ?', [id]);
    await logOperation(req, 'delete', 'materials', `删除物资类型: ${types[0].name}`);
    res.json({ message: '物资类型删除成功' });
  } catch (error) {
    console.error('删除物资类型错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取物资列表（包含库存信息）
router.get('/', async (req, res) => {
  try {
    const [materials] = await pool.query(
      `SELECT m.*, mt.name as type_name, 
       (SELECT COALESCE(SUM(CASE WHEN mr.record_type = 'in' THEN mr.quantity ELSE -mr.quantity END), 0) 
        FROM material_records mr WHERE mr.material_id = m.id) as stock
       FROM materials m
       LEFT JOIN material_types mt ON m.type_id = mt.id
       ORDER BY m.created_at DESC`
    );
    res.json(materials);
  } catch (error) {
    console.error('获取物资列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个物资信息（包含库存）
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [materials] = await pool.query(
      `SELECT m.*, mt.name as type_name,
       (SELECT COALESCE(SUM(CASE WHEN mr.record_type = 'in' THEN mr.quantity ELSE -mr.quantity END), 0) 
        FROM material_records mr WHERE mr.material_id = m.id) as stock
       FROM materials m
       LEFT JOIN material_types mt ON m.type_id = mt.id
       WHERE m.id = ?`,
      [id]
    );

    if (materials.length === 0) {
      return res.status(404).json({ message: '物资不存在' });
    }

    res.json(materials[0]);
  } catch (error) {
    console.error('获取物资信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建物资
router.post('/', async (req, res) => {
  try {
    const { type_id, name, quantity, unit, description } = req.body;

    if (!type_id || !name) {
      return res.status(400).json({ message: '物资类型和名称不能为空' });
    }

    const [result] = await pool.query(
      'INSERT INTO materials (type_id, name, quantity, unit, description, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [type_id, name, quantity || 0, unit || '个', description || null, req.user.id]
    );

    // 如果有初始数量，创建入库记录（入库时 employee_id 为 NULL）
    if (quantity && quantity > 0) {
      await pool.query(
        'INSERT INTO material_records (material_id, employee_id, quantity, record_type, remark, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [result.insertId, null, quantity, 'in', '初始入库', req.user.id]
      );
    }

    await logOperation(req, 'create', 'materials', `添加物资: ${name}`);
    res.status(201).json({ message: '物资创建成功', id: result.insertId });
  } catch (error) {
    console.error('创建物资错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新物资
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type_id, name, quantity, unit, description } = req.body;

    const [materials] = await pool.query('SELECT * FROM materials WHERE id = ?', [id]);
    if (materials.length === 0) {
      return res.status(404).json({ message: '物资不存在' });
    }

    await pool.query(
      'UPDATE materials SET type_id = ?, name = ?, unit = ?, description = ? WHERE id = ?',
      [type_id, name, unit || '个', description || null, id]
    );

    await logOperation(req, 'update', 'materials', `更新物资: ${name}`);
    res.json({ message: '物资更新成功' });
  } catch (error) {
    console.error('更新物资错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除物资
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [materials] = await pool.query('SELECT * FROM materials WHERE id = ?', [id]);
    if (materials.length === 0) {
      return res.status(404).json({ message: '物资不存在' });
    }

    // 删除相关记录
    await pool.query('DELETE FROM material_records WHERE material_id = ?', [id]);
    await pool.query('DELETE FROM materials WHERE id = ?', [id]);

    await logOperation(req, 'delete', 'materials', `删除物资: ${materials[0].name}`);
    res.json({ message: '物资删除成功' });
  } catch (error) {
    console.error('删除物资错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 物资入库
router.post('/:id/in', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, remark } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: '入库数量必须大于0' });
    }

    const [materials] = await pool.query('SELECT * FROM materials WHERE id = ?', [id]);
    if (materials.length === 0) {
      return res.status(404).json({ message: '物资不存在' });
    }

    await pool.query(
      'INSERT INTO material_records (material_id, employee_id, quantity, record_type, remark, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [id, null, quantity, 'in', remark || '入库', req.user.id]
    );

    await logOperation(req, 'in', 'materials', `物资入库: ${materials[0].name}, 数量: ${quantity}`);
    res.json({ message: '入库成功' });
  } catch (error) {
    console.error('入库错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 物资领用
router.post('/:id/out', async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_id, quantity, remark } = req.body;

    if (!employee_id || !quantity || quantity <= 0) {
      return res.status(400).json({ message: '领用人员和数量不能为空' });
    }

    // 检查物资是否存在
    const [materials] = await pool.query('SELECT * FROM materials WHERE id = ?', [id]);
    if (materials.length === 0) {
      return res.status(404).json({ message: '物资不存在' });
    }

    // 检查人员是否存在
    const [employees] = await pool.query('SELECT * FROM employees WHERE id = ?', [employee_id]);
    if (employees.length === 0) {
      return res.status(404).json({ message: '人员不存在' });
    }

    // 计算当前库存
    const [stockResult] = await pool.query(
      `SELECT COALESCE(SUM(CASE WHEN record_type = 'in' THEN quantity ELSE -quantity END), 0) as stock
       FROM material_records WHERE material_id = ?`,
      [id]
    );
    const currentStock = stockResult[0].stock;

    if (currentStock < quantity) {
      return res.status(400).json({ message: `库存不足，当前库存: ${currentStock}` });
    }

    await pool.query(
      'INSERT INTO material_records (material_id, employee_id, quantity, record_type, remark, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [id, employee_id, quantity, 'out', remark || null, req.user.id]
    );

    await logOperation(req, 'out', 'materials', `物资领用: ${materials[0].name}, 领用人: ${employees[0].name}, 数量: ${quantity}`);
    res.json({ message: '领用成功' });
  } catch (error) {
    console.error('领用错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取领用记录
router.get('/records/list', async (req, res) => {
  try {
    const { material_id, employee_id } = req.query;
    let query = `
      SELECT mr.*, m.name as material_name, m.type_id, mt.name as type_name, 
             e.name as employee_name, u.username as operator_name
      FROM material_records mr
      LEFT JOIN materials m ON mr.material_id = m.id
      LEFT JOIN material_types mt ON m.type_id = mt.id
      LEFT JOIN employees e ON mr.employee_id = e.id
      LEFT JOIN users u ON mr.created_by = u.id
      WHERE 1=1
    `;
    let params = [];

    if (material_id) {
      query += ' AND mr.material_id = ?';
      params.push(material_id);
    }
    if (employee_id) {
      query += ' AND mr.employee_id = ?';
      params.push(employee_id);
    }

    query += ' ORDER BY mr.created_at DESC';

    const [records] = await pool.query(query, params);
    res.json(records);
  } catch (error) {
    console.error('获取领用记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取员工领用统计（按员工分组，显示每个员工领用了哪些物资）
router.get('/records/statistics', async (req, res) => {
  try {
    // 先获取汇总统计
    const [statistics] = await pool.query(
      `SELECT 
        e.id as employee_id,
        e.name as employee_name,
        e.position,
        m.id as material_id,
        m.name as material_name,
        mt.name as type_name,
        m.unit,
        SUM(mr.quantity) as total_quantity,
        COUNT(mr.id) as record_count
      FROM material_records mr
      INNER JOIN employees e ON mr.employee_id = e.id
      INNER JOIN materials m ON mr.material_id = m.id
      LEFT JOIN material_types mt ON m.type_id = mt.id
      WHERE mr.record_type = 'out'
      GROUP BY e.id, e.name, e.position, m.id, m.name, mt.name, m.unit
      ORDER BY e.name, m.name`
    );

    // 获取每次领用的详细信息
    const [details] = await pool.query(
      `SELECT 
        mr.id as record_id,
        mr.material_id,
        mr.employee_id,
        mr.quantity,
        mr.remark,
        mr.created_at,
        m.name as material_name,
        m.unit
      FROM material_records mr
      INNER JOIN materials m ON mr.material_id = m.id
      WHERE mr.record_type = 'out'
      ORDER BY mr.employee_id, mr.material_id, mr.created_at DESC`
    );

    // 将详细信息附加到对应的统计记录中
    const result = statistics.map(stat => {
      const recordDetails = details.filter(
        detail => detail.employee_id === stat.employee_id && detail.material_id === stat.material_id
      );
      return {
        ...stat,
        details: recordDetails
      };
    });

    res.json(result);
  } catch (error) {
    console.error('获取领用统计错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;



