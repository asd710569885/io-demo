import express from 'express';
import pool from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { logOperation } from '../middleware/logger.js';

const router = express.Router();

// 所有路由都需要认证
router.use(authenticateToken);

// 获取人员列表
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM employees WHERE 1=1';
    let params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [employees] = await pool.query(query, params);
    res.json(employees);
  } catch (error) {
    console.error('获取人员列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个人员信息
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [employees] = await pool.query('SELECT * FROM employees WHERE id = ?', [id]);

    if (employees.length === 0) {
      return res.status(404).json({ message: '人员不存在' });
    }

    res.json(employees[0]);
  } catch (error) {
    console.error('获取人员信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建人员
router.post('/', async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      id_card,
      position,
      // 养老保险
      pension_company,
      pension_personal,
      // 失业保险
      unemployment_company,
      unemployment_personal,
      // 工伤保险
      work_injury_company,
      work_injury_personal,
      // 医疗保险 - 基础医疗
      medical_base_company,
      medical_base_personal,
      // 医疗保险 - 大病保险
      critical_illness_company,
      critical_illness_personal,
      // 医疗保险 - 生育保险
      maternity_company,
      maternity_personal,
      // 商业保险
      commercial_insurance
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: '姓名不能为空' });
    }

    const [result] = await pool.query(
      `INSERT INTO employees 
       (name, age, gender, id_card, position, 
        pension_company, pension_personal,
        unemployment_company, unemployment_personal,
        work_injury_company, work_injury_personal,
        medical_base_company, medical_base_personal,
        critical_illness_company, critical_illness_personal,
        maternity_company, maternity_personal,
        commercial_insurance, status, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        age || null,
        gender || null,
        id_card || null,
        position || null,
        pension_company || 0,
        pension_personal || 0,
        unemployment_company || 0,
        unemployment_personal || 0,
        work_injury_company || 0,
        work_injury_personal || 0,
        medical_base_company || 0,
        medical_base_personal || 0,
        critical_illness_company || 0,
        critical_illness_personal || 0,
        maternity_company || 0,
        maternity_personal || 0,
        commercial_insurance || null,
        'active', // 新创建的人员默认为在职状态
        req.user.id
      ]
    );

    await logOperation(req, 'create', 'employees', `添加人员: ${name}`);
    
    // 返回创建的人员信息，包括状态
    const [newEmployee] = await pool.query('SELECT * FROM employees WHERE id = ?', [result.insertId]);
    console.log('创建的人员状态:', newEmployee[0]?.status);
    
    res.status(201).json({ message: '人员创建成功', id: result.insertId, employee: newEmployee[0] });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: '身份证号已存在' });
    }
    console.error('创建人员错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新人员
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      age,
      gender,
      id_card,
      position,
      // 养老保险
      pension_company,
      pension_personal,
      // 失业保险
      unemployment_company,
      unemployment_personal,
      // 工伤保险
      work_injury_company,
      work_injury_personal,
      // 医疗保险 - 基础医疗
      medical_base_company,
      medical_base_personal,
      // 医疗保险 - 大病保险
      critical_illness_company,
      critical_illness_personal,
      // 医疗保险 - 生育保险
      maternity_company,
      maternity_personal,
      // 商业保险
      commercial_insurance,
      status
    } = req.body;

    // 检查人员是否存在
    const [employees] = await pool.query('SELECT * FROM employees WHERE id = ?', [id]);
    if (employees.length === 0) {
      return res.status(404).json({ message: '人员不存在' });
    }

    const oldEmployee = employees[0];

    await pool.query(
      `UPDATE employees SET 
       name = ?, age = ?, gender = ?, id_card = ?, position = ?,
       pension_company = ?, pension_personal = ?,
       unemployment_company = ?, unemployment_personal = ?,
       work_injury_company = ?, work_injury_personal = ?,
       medical_base_company = ?, medical_base_personal = ?,
       critical_illness_company = ?, critical_illness_personal = ?,
       maternity_company = ?, maternity_personal = ?,
       commercial_insurance = ?, status = ?
       WHERE id = ?`,
      [
        name || oldEmployee.name,
        age !== undefined ? age : oldEmployee.age,
        gender || oldEmployee.gender,
        id_card || oldEmployee.id_card,
        position || oldEmployee.position,
        pension_company !== undefined ? pension_company : (oldEmployee.pension_company || 0),
        pension_personal !== undefined ? pension_personal : (oldEmployee.pension_personal || 0),
        unemployment_company !== undefined ? unemployment_company : (oldEmployee.unemployment_company || 0),
        unemployment_personal !== undefined ? unemployment_personal : (oldEmployee.unemployment_personal || 0),
        work_injury_company !== undefined ? work_injury_company : (oldEmployee.work_injury_company || 0),
        work_injury_personal !== undefined ? work_injury_personal : (oldEmployee.work_injury_personal || 0),
        medical_base_company !== undefined ? medical_base_company : (oldEmployee.medical_base_company || 0),
        medical_base_personal !== undefined ? medical_base_personal : (oldEmployee.medical_base_personal || 0),
        critical_illness_company !== undefined ? critical_illness_company : (oldEmployee.critical_illness_company || 0),
        critical_illness_personal !== undefined ? critical_illness_personal : (oldEmployee.critical_illness_personal || 0),
        maternity_company !== undefined ? maternity_company : (oldEmployee.maternity_company || 0),
        maternity_personal !== undefined ? maternity_personal : (oldEmployee.maternity_personal || 0),
        commercial_insurance !== undefined ? commercial_insurance : oldEmployee.commercial_insurance,
        status !== undefined ? status : oldEmployee.status,
        id
      ]
    );

    const action = status === 'inactive' && oldEmployee.status === 'active' ? '离职' : '更新';
    await logOperation(req, 'update', 'employees', `${action}人员: ${oldEmployee.name}`);
    res.json({ message: '人员更新成功' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: '身份证号已存在' });
    }
    console.error('更新人员错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除人员
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查人员是否存在
    const [employees] = await pool.query('SELECT * FROM employees WHERE id = ?', [id]);
    if (employees.length === 0) {
      return res.status(404).json({ message: '人员不存在' });
    }

    const employee = employees[0];

    await pool.query('DELETE FROM employees WHERE id = ?', [id]);
    await logOperation(req, 'delete', 'employees', `删除人员: ${employee.name}`);
    res.json({ message: '人员删除成功' });
  } catch (error) {
    console.error('删除人员错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;



