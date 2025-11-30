-- IO系统数据库结构

-- 用户表（管理员和普通用户）
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
  email VARCHAR(100) COMMENT '邮箱',
  role ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user' COMMENT '角色：admin超级管理员，manager管理员，user普通用户',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_username (username),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 人员表
CREATE TABLE IF NOT EXISTS employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '姓名',
  age INT COMMENT '年龄',
  gender ENUM('male', 'female', 'other') COMMENT '性别',
  id_card VARCHAR(18) UNIQUE COMMENT '身份证号',
  position VARCHAR(100) COMMENT '职位',
  social_insurance_personal DECIMAL(10, 2) DEFAULT 0 COMMENT '社保个人部分',
  social_insurance_company DECIMAL(10, 2) DEFAULT 0 COMMENT '社保公司部分',
  commercial_insurance TEXT COMMENT '商业保险',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态：active在职，inactive离职',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  created_by INT COMMENT '创建人ID',
  INDEX idx_status (status),
  INDEX idx_name (name),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='人员表';

-- 物资类型表
CREATE TABLE IF NOT EXISTS material_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '类型名称',
  description TEXT COMMENT '描述',
  parent_id INT DEFAULT NULL COMMENT '父类型ID（用于子分类）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_parent_id (parent_id),
  FOREIGN KEY (parent_id) REFERENCES material_types(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物资类型表';

-- 物资表
CREATE TABLE IF NOT EXISTS materials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type_id INT NOT NULL COMMENT '物资类型ID',
  name VARCHAR(100) NOT NULL COMMENT '物资名称',
  quantity INT DEFAULT 0 COMMENT '数量',
  unit VARCHAR(20) DEFAULT '个' COMMENT '单位',
  description TEXT COMMENT '描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  created_by INT COMMENT '创建人ID',
  INDEX idx_type_id (type_id),
  INDEX idx_name (name),
  FOREIGN KEY (type_id) REFERENCES material_types(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物资表';

-- 物资领用记录表
CREATE TABLE IF NOT EXISTS material_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  material_id INT NOT NULL COMMENT '物资ID',
  employee_id INT NOT NULL COMMENT '领用人员ID',
  quantity INT NOT NULL COMMENT '领用数量',
  record_type ENUM('in', 'out') NOT NULL COMMENT '记录类型：in入库，out领用',
  remark TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  created_by INT COMMENT '操作人ID',
  INDEX idx_material_id (material_id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_record_type (record_type),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物资领用记录表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT COMMENT '操作用户ID',
  username VARCHAR(50) COMMENT '操作用户名',
  action VARCHAR(100) NOT NULL COMMENT '操作动作',
  module VARCHAR(50) NOT NULL COMMENT '操作模块',
  description TEXT COMMENT '操作描述',
  ip_address VARCHAR(50) COMMENT 'IP地址',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_user_id (user_id),
  INDEX idx_module (module),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 注意：默认管理员账号会在 init-db.js 脚本中创建，这里不需要手动插入

