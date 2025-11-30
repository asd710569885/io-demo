<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>物资类型</span>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加类型
        </el-button>
      </div>
    </template>

    <el-table :data="types" v-loading="loading" border>
      <el-table-column prop="name" label="类型名称" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="currentType ? '编辑类型' : '添加类型'"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入类型名称" />
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
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import api from '../../utils/api';

const types = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const submitting = ref(false);
const currentType = ref(null);
const formRef = ref(null);

const form = reactive({
  name: '',
  description: '',
});

const rules = {
  name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
};

const fetchTypes = async () => {
  loading.value = true;
  try {
    const data = await api.get('/materials/types');
    types.value = data;
  } catch (error) {
    console.error('获取类型列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  currentType.value = null;
  form.name = '';
  form.description = '';
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  currentType.value = row;
  form.name = row.name;
  form.description = row.description || '';
  dialogVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除 ${row.name} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await api.delete(`/materials/types/${row.id}`);
    ElMessage.success('删除成功');
    fetchTypes();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      // 显示后端返回的错误信息
      const errorMessage = error.response?.data?.message || error.message || '删除失败';
      ElMessage.error(errorMessage);
    }
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        if (currentType.value) {
          await api.put(`/materials/types/${currentType.value.id}`, form);
          ElMessage.success('更新成功');
        } else {
          await api.post('/materials/types', form);
          ElMessage.success('添加成功');
        }
        dialogVisible.value = false;
        fetchTypes();
      } catch (error) {
        console.error('保存失败:', error);
      } finally {
        submitting.value = false;
      }
    }
  });
};

onMounted(() => {
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



