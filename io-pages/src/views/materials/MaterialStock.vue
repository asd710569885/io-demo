<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>领用统计</span>
        <el-button type="primary" @click="fetchStatistics" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </template>

    <el-table 
      :data="flatData" 
      v-loading="loading" 
      border 
      style="width: 100%" 
      row-key="key"
      :expand-row-keys="expandedRows"
    >
      <el-table-column prop="employee_name" label="员工姓名" width="150" fixed="left" />
      <el-table-column prop="position" label="职位" min-width="120" />
      <el-table-column prop="type_name" label="物资类型" min-width="150" />
      <el-table-column prop="material_name" label="物资名称" min-width="200" />
      <el-table-column prop="total_quantity" label="领用总数" min-width="150" align="right">
        <template #default="{ row }">
          <span style="font-weight: bold; color: #409eff; font-size: 14px">
            {{ row.total_quantity }} {{ row.unit }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="record_count" label="领用次数" min-width="120" align="center">
        <template #default="{ row }">
          <el-tag type="info" size="small">{{ row.record_count }} 次</el-tag>
        </template>
      </el-table-column>
      <el-table-column type="expand" width="60" fixed="right">
        <template #default="{ row }">
          <el-table :data="row.details" border style="margin: 10px 0">
            <el-table-column prop="created_at" label="领用时间" width="180">
              <template #default="{ row: detail }">
                {{ formatDateTime(detail.created_at) }}
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="120" align="right">
              <template #default="{ row: detail }">
                <span style="font-weight: bold; color: #409eff">
                  {{ detail.quantity }} {{ detail.unit }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip>
              <template #default="{ row: detail }">
                <span style="color: #606266; font-size: 13px">
                  {{ detail.remark || '' }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && flatData.length === 0" description="暂无领用记录" />
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Refresh } from '@element-plus/icons-vue';
import api from '../../utils/api';

const statistics = ref([]);
const loading = ref(false);
const expandedRows = ref([]);

// 扁平化数据，每个员工-物资组合一行
const flatData = computed(() => {
  return statistics.value.map((item, index) => ({
    key: `${item.employee_id}-${item.material_id}-${index}`, // 唯一key
    employee_id: item.employee_id,
    employee_name: item.employee_name,
    position: item.position,
    material_id: item.material_id,
    material_name: item.material_name,
    type_name: item.type_name,
    unit: item.unit,
    total_quantity: item.total_quantity,
    record_count: item.record_count,
    details: item.details || [], // 每次领用的详细信息
  }));
});

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

const fetchStatistics = async () => {
  loading.value = true;
  try {
    const data = await api.get('/materials/records/statistics');
    statistics.value = data;
  } catch (error) {
    console.error('获取领用统计失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStatistics();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
