<template>
  <div>
    <!-- 统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" :style="{ color: '#409eff' }" :size="40">
              <Document />
            </el-icon>
            <div class="stat-info">
              <div class="stat-number">{{ statistics.total }}</div>
              <div class="stat-label">总日志数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" :style="{ color: '#67c23a' }" :size="40">
              <Plus />
            </el-icon>
            <div class="stat-info">
              <div class="stat-number">{{ statistics.create }}</div>
              <div class="stat-label">创建操作</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" :style="{ color: '#e6a23c' }" :size="40">
              <Edit />
            </el-icon>
            <div class="stat-info">
              <div class="stat-number">{{ statistics.update }}</div>
              <div class="stat-label">更新操作</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" :style="{ color: '#f56c6c' }" :size="40">
              <Delete />
            </el-icon>
            <div class="stat-info">
              <div class="stat-number">{{ statistics.delete }}</div>
              <div class="stat-label">删除操作</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>
        <span>操作日志</span>
      </template>

      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="操作类型">
          <el-select v-model="queryForm.action" placeholder="请选择操作类型" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="创建" value="create" />
            <el-option label="更新" value="update" />
            <el-option label="删除" value="delete" />
            <el-option label="入库" value="in" />
            <el-option label="领用" value="out" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标类型">
          <el-select v-model="queryForm.module" placeholder="请选择目标类型" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="人员管理" value="employees" />
            <el-option label="物资管理" value="materials" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户">
          <el-input v-model="queryForm.username" placeholder="请输入用户名" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="queryForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="logs" v-loading="loading" border>
      <el-table-column prop="action" label="操作类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getActionType(row.action)" size="small">
            {{ formatAction(row.action) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="module" label="目标类型" width="120">
        <template #default="{ row }">
          <el-tag type="info" size="small">
            {{ formatModule(row.module) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="操作描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="username" label="操作用户" width="150" />
      <el-table-column prop="created_at" label="操作时间" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" text @click="handleViewDetail(row)">
            查看
          </el-button>
        </template>
      </el-table-column>
      </el-table>

      <el-pagination
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      :page-sizes="[20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="(val) => { pageSize = val; fetchLogs(); }"
      @current-change="(val) => { page = val; fetchLogs(); }"
      style="margin-top: 20px; justify-content: flex-end"
      />

      <!-- 详情对话框 -->
      <el-dialog v-model="detailDialogVisible" title="日志详情" width="600px">
      <el-descriptions :column="1" border v-if="currentLog">
        <el-descriptions-item label="操作ID">{{ currentLog.id }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">
          <el-tag :type="getActionType(currentLog.action)" size="small">
            {{ formatAction(currentLog.action) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="目标类型">
          <el-tag type="info" size="small">
            {{ formatModule(currentLog.module) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="目标ID">{{ currentLog.id }}</el-descriptions-item>
        <el-descriptions-item label="操作描述">{{ currentLog.description }}</el-descriptions-item>
        <el-descriptions-item label="操作用户">
          {{ currentLog.username }}
          <el-tag v-if="currentLog.role" type="warning" size="small" style="margin-left: 8px">
            {{ formatRole(currentLog.role) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作时间">
          {{ formatDateTime(currentLog.created_at) }}
        </el-descriptions-item>
      </el-descriptions>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document, Plus, Edit, Delete } from '@element-plus/icons-vue';
import api from '../utils/api';

const logs = ref([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(50);
const total = ref(0);
const detailDialogVisible = ref(false);
const currentLog = ref(null);
const statistics = ref({
  total: 0,
  create: 0,
  update: 0,
  delete: 0,
});

const queryForm = reactive({
  action: '',
  module: '',
  username: '',
  dateRange: null,
});

// 格式化操作类型
const formatAction = (action) => {
  const actionMap = {
    'create': '创建',
    'update': '更新',
    'delete': '删除',
    'in': '入库',
    'out': '领用',
    'login': '登录',
  };
  return actionMap[action] || action;
};

// 获取操作类型标签类型
const getActionType = (action) => {
  const typeMap = {
    'create': 'success',
    'update': 'warning',
    'delete': 'danger',
    'in': 'success',
    'out': 'info',
    'login': 'info',
  };
  return typeMap[action] || '';
};

// 格式化模块
const formatModule = (module) => {
  const moduleMap = {
    'employees': '人员管理',
    'materials': '物资管理',
    'users': '用户管理',
    'auth': '认证',
  };
  return moduleMap[module] || module;
};

// 格式化角色
const formatRole = (role) => {
  const roleMap = {
    'admin': '管理员',
    'manager': '管理员',
    'user': '用户',
  };
  return roleMap[role] || role;
};

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 查看详情
const handleViewDetail = (row) => {
  currentLog.value = row;
  detailDialogVisible.value = true;
};

// 搜索
const handleSearch = () => {
  page.value = 1;
  fetchLogs();
};

// 重置
const handleReset = () => {
  queryForm.action = '';
  queryForm.module = '';
  queryForm.username = '';
  queryForm.dateRange = null;
  page.value = 1;
  fetchLogs();
  fetchStatistics();
};


// 获取统计信息
const fetchStatistics = async () => {
  try {
    const data = await api.get('/logs/statistics');
    statistics.value = data;
  } catch (error) {
    console.error('获取统计信息失败:', error);
  }
};

const fetchLogs = async () => {
  loading.value = true;
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
    };
    if (queryForm.action) {
      params.action = queryForm.action;
    }
    if (queryForm.module) {
      params.module = queryForm.module;
    }
    if (queryForm.username) {
      params.username = queryForm.username;
    }
    if (queryForm.dateRange && queryForm.dateRange.length === 2) {
      params.startDate = queryForm.dateRange[0];
      params.endDate = queryForm.dateRange[1];
    }
    const data = await api.get('/logs', { params });
    logs.value = data.data;
    total.value = data.total;
  } catch (error) {
    console.error('获取日志失败:', error);
    ElMessage.error('获取日志失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchLogs();
  fetchStatistics();
});
</script>

<style scoped>
.query-form {
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}
</style>

