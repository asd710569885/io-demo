<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>{{ status === 'active' ? '在职人员列表' : '离职人员列表' }}</span>
        <el-button v-if="status === 'active'" type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加人员
        </el-button>
      </div>
    </template>

    <el-table :data="employees" v-loading="loading" border>
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="age" label="年龄" width="80" />
      <el-table-column prop="gender" label="性别" width="80">
        <template #default="{ row }">
          {{ row.gender === 'male' ? '男' : row.gender === 'female' ? '女' : '其他' }}
        </template>
      </el-table-column>
      <el-table-column prop="id_card" label="身份证号" width="180" />
      <el-table-column prop="position" label="职位" width="120" />
      <el-table-column prop="social_insurance_personal" label="社保个人部分" width="120" />
      <el-table-column prop="social_insurance_company" label="社保公司部分" width="120" />
      <el-table-column prop="commercial_insurance" label="商业保险" min-width="200" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="info" size="small" @click="handleView(row)">查看</el-button>
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <EmployeeViewDialog
      v-model="viewDialogVisible"
      :employee-id="currentEmployeeId"
    />
  </el-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import api from '../../utils/api';
import EmployeeViewDialog from './EmployeeViewDialog.vue';

const route = useRoute();
const router = useRouter();

// 使用 computed 让 status 响应路由变化
const status = computed(() => {
  return route.path.includes('inactive') ? 'inactive' : 'active';
});

const employees = ref([]);
const loading = ref(false);
const viewDialogVisible = ref(false);
const currentEmployeeId = ref(null);

const fetchEmployees = async () => {
  loading.value = true;
  try {
    const data = await api.get('/employees', { params: { status: status.value } });
    employees.value = data;
  } catch (error) {
    console.error('获取人员列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  router.push('/employees/add');
};

const handleView = (row) => {
  currentEmployeeId.value = row.id;
  viewDialogVisible.value = true;
};

const handleEdit = (row) => {
  router.push(`/employees/edit/${row.id}`);
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除 ${row.name} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await api.delete(`/employees/${row.id}`);
    ElMessage.success('删除成功');
    fetchEmployees();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
    }
  }
};

// 监听路由变化，当切换在职/离职列表时重新获取数据
watch(() => route.path, () => {
  fetchEmployees();
}, { immediate: false });

// 组件挂载时获取数据
onMounted(() => {
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



