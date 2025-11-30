<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>物资领用</span>
        <el-button type="primary" @click="handleOut">
          <el-icon><Plus /></el-icon>
          物资领用
        </el-button>
      </div>
    </template>

    <el-table :data="records" v-loading="loading" border>
      <el-table-column prop="type_name" label="物资类型" width="120" />
      <el-table-column prop="material_name" label="物资名称" width="150" />
      <el-table-column prop="employee_name" label="领用人员" width="120" />
      <el-table-column prop="quantity" label="数量" width="100" />
      <el-table-column prop="record_type" label="操作类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.record_type === 'in' ? 'success' : 'info'">
            {{ row.record_type === 'in' ? '入库' : '领用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="200" />
      <el-table-column prop="operator_name" label="操作人" width="120" />
      <el-table-column prop="created_at" label="时间" width="180" />
    </el-table>

    <el-dialog v-model="dialogVisible" title="物资领用" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="物资类型" prop="type_id">
          <el-select 
            v-model="form.type_id" 
            placeholder="请选择物资类型" 
            style="width: 100%"
            clearable
            @change="handleTypeChange"
          >
            <el-option
              v-for="type in types"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="物资" prop="material_id">
          <el-select 
            v-model="form.material_id" 
            placeholder="请先选择物资类型" 
            style="width: 100%"
            :disabled="!form.type_id"
          >
            <el-option
              v-for="material in filteredMaterials"
              :key="material.id"
              :label="`${material.name} (库存: ${material.stock})`"
              :value="material.id"
              :disabled="material.stock <= 0"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="领用人员" prop="employee_id">
          <el-select v-model="form.employee_id" placeholder="请选择人员" style="width: 100%">
            <el-option
              v-for="employee in employees"
              :key="employee.id"
              :label="employee.name"
              :value="employee.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="领用数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import api from '../../utils/api';

const records = ref([]);
const materials = ref([]);
const types = ref([]);
const employees = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const submitting = ref(false);
const formRef = ref(null);

const form = reactive({
  type_id: null,
  material_id: null,
  employee_id: null,
  quantity: 1,
  remark: '',
});

// 根据选择的类型筛选物资
const filteredMaterials = computed(() => {
  if (!form.type_id) {
    return [];
  }
  return materials.value.filter(m => m.type_id === form.type_id);
});

const rules = {
  type_id: [{ required: true, message: '请选择物资类型', trigger: 'change' }],
  material_id: [{ required: true, message: '请选择物资', trigger: 'change' }],
  employee_id: [{ required: true, message: '请选择人员', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入领用数量', trigger: 'blur' }],
};

const fetchRecords = async () => {
  loading.value = true;
  try {
    const data = await api.get('/materials/records/list');
    records.value = data;
  } catch (error) {
    console.error('获取领用记录失败:', error);
  } finally {
    loading.value = false;
  }
};

const fetchMaterials = async () => {
  try {
    const data = await api.get('/materials');
    materials.value = data;
  } catch (error) {
    console.error('获取物资列表失败:', error);
  }
};

const fetchTypes = async () => {
  try {
    const data = await api.get('/materials/types');
    types.value = data;
  } catch (error) {
    console.error('获取类型列表失败:', error);
  }
};

const fetchEmployees = async () => {
  try {
    const data = await api.get('/employees', { params: { status: 'active' } });
    employees.value = data;
  } catch (error) {
    console.error('获取人员列表失败:', error);
  }
};

const handleTypeChange = () => {
  // 切换类型时，清空已选择的物资
  form.material_id = null;
};

const handleOut = () => {
  form.type_id = null;
  form.material_id = null;
  form.employee_id = null;
  form.quantity = 1;
  form.remark = '';
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        await api.post(`/materials/${form.material_id}/out`, {
          employee_id: form.employee_id,
          quantity: form.quantity,
          remark: form.remark,
        });
        ElMessage.success('领用成功');
        dialogVisible.value = false;
        fetchRecords();
        fetchMaterials();
      } catch (error) {
        console.error('领用失败:', error);
      } finally {
        submitting.value = false;
      }
    }
  });
};

onMounted(() => {
  fetchRecords();
  fetchMaterials();
  fetchTypes();
  fetchEmployees();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>



