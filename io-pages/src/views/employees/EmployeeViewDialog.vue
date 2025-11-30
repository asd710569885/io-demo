<template>
  <el-dialog
    v-model="visible"
    title="查看人员信息"
    width="800px"
    @close="handleClose"
  >
    <div v-loading="loading" class="employee-view">
      <template v-if="employee">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">
            {{ employee.name }}
          </el-descriptions-item>
          <el-descriptions-item label="年龄">
            {{ employee.age || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ employee.gender === 'male' ? '男' : employee.gender === 'female' ? '女' : '其他' }}
          </el-descriptions-item>
          <el-descriptions-item label="身份证号">
            {{ employee.id_card || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="职位">
            {{ employee.position || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="employee.status === 'active' ? 'success' : 'info'">
              {{ employee.status === 'active' ? '在职' : '离职' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">
          <el-icon><Money /></el-icon>
          <span style="font-size: 14px; font-weight: 600">保险信息</span>
        </el-divider>

        <div class="insurance-view">
          <div class="insurance-header">
            <div class="insurance-type-col">保险类型</div>
            <div class="insurance-amount-col">公司缴纳</div>
            <div class="insurance-amount-col">个人缴纳</div>
          </div>

          <div class="insurance-row">
            <div class="insurance-type-col">
              <span class="insurance-type-label">养老保险</span>
            </div>
            <div class="insurance-amount-col">
              {{ formatAmount(employee.pension_company) }}
            </div>
            <div class="insurance-amount-col">
              {{ formatAmount(employee.pension_personal) }}
            </div>
          </div>

          <div class="insurance-row">
            <div class="insurance-type-col">
              <span class="insurance-type-label">失业保险</span>
            </div>
            <div class="insurance-amount-col">
              {{ formatAmount(employee.unemployment_company) }}
            </div>
            <div class="insurance-amount-col">
              {{ formatAmount(employee.unemployment_personal) }}
            </div>
          </div>

          <div class="insurance-row">
            <div class="insurance-type-col">
              <span class="insurance-type-label">工伤保险</span>
            </div>
            <div class="insurance-amount-col">
              {{ formatAmount(employee.work_injury_company) }}
            </div>
            <div class="insurance-amount-col">
              {{ formatAmount(employee.work_injury_personal) }}
            </div>
          </div>

          <div class="insurance-row">
            <div class="insurance-type-col">
              <span class="insurance-type-label">基础医疗保险</span>
            </div>
            <div class="insurance-amount-col">
              {{ formatAmount(employee.medical_base_company) }}
            </div>
            <div class="insurance-amount-col">
              {{ formatAmount(employee.medical_base_personal) }}
            </div>
          </div>

          <div class="insurance-row">
            <div class="insurance-type-col">
              <span class="insurance-type-label">大病保险</span>
            </div>
            <div class="insurance-amount-col">
              {{ formatAmount(employee.critical_illness_company) }}
            </div>
            <div class="insurance-amount-col">
              {{ formatAmount(employee.critical_illness_personal) }}
            </div>
          </div>

          <div class="insurance-row">
            <div class="insurance-type-col">
              <span class="insurance-type-label">生育保险</span>
            </div>
            <div class="insurance-amount-col">
              {{ formatAmount(employee.maternity_company) }}
            </div>
            <div class="insurance-amount-col">
              {{ formatAmount(employee.maternity_personal) }}
            </div>
          </div>
        </div>

        <div class="commercial-insurance-view" v-if="employee.commercial_insurance">
          <el-divider content-position="left">
            <span style="font-size: 14px; font-weight: 600">商业保险</span>
          </el-divider>
          <div class="commercial-content">
            {{ employee.commercial_insurance }}
          </div>
        </div>
      </template>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Money } from '@element-plus/icons-vue';
import api from '../../utils/api';

const props = defineProps({
  modelValue: Boolean,
  employeeId: Number,
});

const emit = defineEmits(['update:modelValue']);

const visible = ref(props.modelValue);
const loading = ref(false);
const employee = ref(null);

watch(() => props.modelValue, async (val) => {
  visible.value = val;
  if (val && props.employeeId) {
    await fetchEmployee();
  } else {
    employee.value = null;
  }
});

watch(visible, (val) => {
  emit('update:modelValue', val);
});

const fetchEmployee = async () => {
  loading.value = true;
  try {
    const data = await api.get(`/employees/${props.employeeId}`);
    employee.value = data;
  } catch (error) {
    console.error('获取员工信息失败:', error);
  } finally {
    loading.value = false;
  }
};

const formatAmount = (value) => {
  if (value === null || value === undefined || value === '') {
    return '0.00';
  }
  return Number(value).toFixed(2);
};

const handleClose = () => {
  visible.value = false;
};
</script>

<style scoped>
.employee-view {
  min-height: 200px;
}

.insurance-view {
  padding: 16px;
  background-color: #fafafa;
  border-radius: 4px;
  margin-top: 16px;
}

.insurance-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 2px solid #ebeef5;
  margin-bottom: 12px;
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.insurance-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
}

.insurance-row:last-child {
  border-bottom: none;
}

.insurance-type-col {
  display: flex;
  align-items: center;
}

.insurance-type-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.insurance-amount-col {
  display: flex;
  align-items: center;
  color: #303133;
  font-size: 14px;
}

.commercial-insurance-view {
  margin-top: 20px;
}

.commercial-content {
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
  color: #606266;
}

:deep(.el-divider__text) {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #fff;
  padding: 0 16px;
}
</style>

