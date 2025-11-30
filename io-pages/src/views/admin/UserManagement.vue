<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>用户管理</span>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加用户
        </el-button>
      </div>
    </template>

    <el-table :data="users" v-loading="loading" border>
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="row.role === 'admin' ? 'danger' : row.role === 'manager' ? 'warning' : 'info'">
            {{ row.role === 'admin' ? '超级管理员' : row.role === 'manager' ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="currentUser ? '编辑用户' : '添加用户'"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" :prop="currentUser ? '' : 'password'">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码（留空则不修改）"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item v-if="userStore.isAdmin" label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="超级管理员" value="admin" />
            <el-option label="管理员" value="manager" />
            <el-option label="普通用户" value="user" />
          </el-select>
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
import { useUserStore } from '../../stores/user';

const userStore = useUserStore();

const users = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const submitting = ref(false);
const currentUser = ref(null);
const formRef = ref(null);

const form = reactive({
  username: '',
  password: '',
  email: '',
  role: 'user',
});

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const data = await api.get('/users');
    users.value = data;
  } catch (error) {
    console.error('获取用户列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  currentUser.value = null;
  form.username = '';
  form.password = '';
  form.email = '';
  form.role = 'user';
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  currentUser.value = row;
  form.username = row.username;
  form.password = '';
  form.email = row.email || '';
  form.role = row.role;
  dialogVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 ${row.username} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await api.delete(`/users/${row.id}`);
    ElMessage.success('删除成功');
    fetchUsers();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
    }
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  // 编辑时密码可以为空
  const validateRules = { ...rules };
  if (currentUser.value) {
    delete validateRules.password;
  }
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        const submitData = { ...form };
        
        // 处理密码：编辑时如果为空则删除，创建时必须提供
        if (currentUser.value) {
          if (!submitData.password) {
            delete submitData.password;
          }
        }
        
        // 处理邮箱：空字符串转为null
        if (submitData.email === '') {
          submitData.email = null;
        }
        
        if (currentUser.value) {
          await api.put(`/users/${currentUser.value.id}`, submitData);
          ElMessage.success('更新成功');
        } else {
          await api.post('/users', submitData);
          ElMessage.success('添加成功');
        }
        dialogVisible.value = false;
        fetchUsers();
      } catch (error) {
        console.error('保存失败:', error);
        // 错误信息已经在 api.js 的拦截器中显示了
        // 这里可以添加额外的错误处理逻辑
      } finally {
        submitting.value = false;
      }
    }
  });
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>



