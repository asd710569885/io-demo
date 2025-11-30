<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>物资列表</span>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加物资
        </el-button>
      </div>
    </template>

    <el-table :data="materials" v-loading="loading" border>
      <el-table-column prop="type_name" label="物资类型" width="120" />
      <el-table-column prop="name" label="物资名称" width="150" />
      <el-table-column prop="unit" label="单位" width="80" />
      <el-table-column prop="stock" label="库存" width="100">
        <template #default="{ row }">
          <span :style="{ color: row.stock < 10 ? 'red' : '' }">
            {{ row.stock }}
          </span>
          <el-tag v-if="row.stock < 10" type="warning" size="small" style="margin-left: 5px">
            库存不足
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="success" size="small" @click="handleIn(row)">入库</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="currentMaterial ? '编辑物资' : '添加物资'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="物资类型" prop="type_id">
          <el-select v-model="form.type_id" placeholder="请选择类型" style="width: 100%">
            <el-option
              v-for="type in types"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="物资名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入物资名称" />
        </el-form-item>
        <el-form-item v-if="!currentMaterial" label="初始数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="0" style="width: 100%" />
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">
            创建物资时的初始数量，将自动创建入库记录
          </div>
        </el-form-item>
        <el-form-item v-if="currentMaterial" label="当前库存">
          <el-input :value="form.stock" disabled style="width: 100%">
            <template #suffix>
              <span style="color: #909399; margin-right: 8px;">{{ form.unit }}</span>
            </template>
          </el-input>
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">
            库存通过入库/出库记录管理，无法直接修改
          </div>
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="请输入单位" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="inDialogVisible" title="物资入库" width="400px">
      <el-form :model="inForm" :rules="inRules" ref="inFormRef" label-width="100px">
        <el-form-item label="入库数量" prop="quantity">
          <el-input-number v-model="inForm.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="inForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleInSubmit" :loading="inSubmitting">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import api from '../../utils/api';

const materials = ref([]);
const types = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const inDialogVisible = ref(false);
const submitting = ref(false);
const inSubmitting = ref(false);
const currentMaterial = ref(null);
const currentInMaterial = ref(null);
const formRef = ref(null);
const inFormRef = ref(null);

const form = reactive({
  type_id: null,
  name: '',
  quantity: 0,
  stock: 0,
  unit: '个',
  description: '',
});

const inForm = reactive({
  quantity: 1,
  remark: '',
});

const rules = {
  type_id: [{ required: true, message: '请选择物资类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入物资名称', trigger: 'blur' }],
};

const inRules = {
  quantity: [{ required: true, message: '请输入入库数量', trigger: 'blur' }],
};

const fetchMaterials = async () => {
  loading.value = true;
  try {
    const data = await api.get('/materials');
    materials.value = data;
  } catch (error) {
    console.error('获取物资列表失败:', error);
  } finally {
    loading.value = false;
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

const resetForm = () => {
  form.type_id = null;
  form.name = '';
  form.quantity = 0;
  form.stock = 0;
  form.unit = '个';
  form.description = '';
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

const handleAdd = () => {
  currentMaterial.value = null;
  resetForm();
  dialogVisible.value = true;
};

const handleDialogClose = () => {
  resetForm();
  currentMaterial.value = null;
};

const handleEdit = async (row) => {
  currentMaterial.value = row;
  // 从服务器获取最新的物资数据，确保数据完整
  try {
    const material = await api.get(`/materials/${row.id}`);
    form.type_id = material.type_id;
    form.name = material.name || '';
    form.quantity = Number(material.quantity) || 0;
    form.stock = Number(material.stock) || 0; // 实际库存
    form.unit = material.unit || '个';
    form.description = material.description || '';
    dialogVisible.value = true;
  } catch (error) {
    console.error('获取物资详情失败:', error);
    ElMessage.error('获取物资详情失败');
  }
};

const handleIn = (row) => {
  currentInMaterial.value = row;
  inForm.quantity = 1;
  inForm.remark = '';
  inDialogVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除 ${row.name} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await api.delete(`/materials/${row.id}`);
    ElMessage.success('删除成功');
    fetchMaterials();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
    }
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        if (currentMaterial.value) {
          // 编辑时，不发送 quantity 字段（后端不处理，库存通过入库/出库管理）
          const { quantity, stock, ...updateData } = form;
          await api.put(`/materials/${currentMaterial.value.id}`, updateData);
          ElMessage.success('更新成功');
        } else {
          // 添加时，发送 quantity 字段用于创建初始入库记录
          await api.post('/materials', form);
          ElMessage.success('添加成功');
        }
        dialogVisible.value = false;
        fetchMaterials();
      } catch (error) {
        console.error('保存失败:', error);
      } finally {
        submitting.value = false;
      }
    }
  });
};

const handleInSubmit = async () => {
  if (!inFormRef.value) return;
  
  await inFormRef.value.validate(async (valid) => {
    if (valid) {
      inSubmitting.value = true;
      try {
        await api.post(`/materials/${currentInMaterial.value.id}/in`, inForm);
        ElMessage.success('入库成功');
        inDialogVisible.value = false;
        fetchMaterials();
      } catch (error) {
        console.error('入库失败:', error);
      } finally {
        inSubmitting.value = false;
      }
    }
  });
};

onMounted(() => {
  fetchMaterials();
  fetchTypes();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>



