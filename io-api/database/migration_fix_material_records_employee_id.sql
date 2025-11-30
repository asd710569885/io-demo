-- 修改 material_records 表，允许 employee_id 为 NULL（用于入库操作）
ALTER TABLE material_records 
MODIFY COLUMN employee_id INT NULL COMMENT '领用人员ID（入库时为NULL）';

