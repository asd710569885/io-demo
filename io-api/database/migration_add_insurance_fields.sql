-- 添加详细的保险字段
ALTER TABLE employees 
ADD COLUMN pension_company DECIMAL(10, 2) DEFAULT 0 COMMENT '养老保险-公司缴纳' AFTER commercial_insurance,
ADD COLUMN pension_personal DECIMAL(10, 2) DEFAULT 0 COMMENT '养老保险-个人缴纳' AFTER pension_company,
ADD COLUMN unemployment_company DECIMAL(10, 2) DEFAULT 0 COMMENT '失业保险-公司缴纳' AFTER pension_personal,
ADD COLUMN unemployment_personal DECIMAL(10, 2) DEFAULT 0 COMMENT '失业保险-个人缴纳' AFTER unemployment_company,
ADD COLUMN work_injury_company DECIMAL(10, 2) DEFAULT 0 COMMENT '工伤保险-公司缴纳' AFTER unemployment_personal,
ADD COLUMN work_injury_personal DECIMAL(10, 2) DEFAULT 0 COMMENT '工伤保险-个人缴纳' AFTER work_injury_company,
ADD COLUMN critical_illness_company DECIMAL(10, 2) DEFAULT 0 COMMENT '大病保险-公司缴纳' AFTER work_injury_personal,
ADD COLUMN critical_illness_personal DECIMAL(10, 2) DEFAULT 0 COMMENT '大病保险-个人缴纳' AFTER critical_illness_company,
ADD COLUMN maternity_company DECIMAL(10, 2) DEFAULT 0 COMMENT '生育保险-公司缴纳' AFTER critical_illness_personal,
ADD COLUMN maternity_personal DECIMAL(10, 2) DEFAULT 0 COMMENT '生育保险-个人缴纳' AFTER maternity_company,
ADD COLUMN medical_base_company DECIMAL(10, 2) DEFAULT 0 COMMENT '基础医疗保险-公司缴纳' AFTER maternity_personal,
ADD COLUMN medical_base_personal DECIMAL(10, 2) DEFAULT 0 COMMENT '基础医疗保险-个人缴纳' AFTER medical_base_company;

