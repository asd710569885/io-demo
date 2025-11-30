<template>
  <div class="employee-edit-container">
    <el-card class="page-card" shadow="never" v-loading="loading">
      <template #header>
        <div class="page-header">
          <div class="header-left">
            <el-icon class="header-icon"><User /></el-icon>
            <h2 class="page-title">编辑人员</h2>
          </div>
          <el-button 
            type="default" 
            :icon="ArrowLeft" 
            @click="handleCancel"
            class="back-button"
          >
            返回
          </el-button>
        </div>
      </template>

      <div class="form-container" v-if="!loading">
        <el-form 
          :model="form" 
          :rules="rules" 
          ref="formRef" 
          label-width="120px"
          class="employee-form"
        >
          <el-divider content-position="left">
            <el-icon><UserFilled /></el-icon>
            <span class="section-title">基本信息</span>
          </el-divider>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input 
                  v-model="form.name" 
                  placeholder="请输入姓名"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="年龄" prop="age">
                <el-input-number 
                  v-model="form.age" 
                  :min="1" 
                  :max="150"
                  style="width: 100%"
                  placeholder="请输入年龄"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="form.gender">
                  <el-radio label="male">男</el-radio>
                  <el-radio label="female">女</el-radio>
                  <el-radio label="other">其他</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="职位" prop="position">
                <el-input 
                  v-model="form.position" 
                  placeholder="请输入职位"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="身份证号" prop="id_card">
            <el-input 
              v-model="form.id_card" 
              placeholder="请输入身份证号"
              clearable
              style="max-width: 400px"
            />
          </el-form-item>

          <el-divider content-position="left">
            <el-icon><Money /></el-icon>
            <span class="section-title">保险信息</span>
          </el-divider>

          <el-card class="insurance-module" shadow="never">
            <div class="insurance-content">
              <!-- 表头 -->
              <div class="insurance-header">
                <div class="insurance-type-col">保险类型</div>
                <div class="insurance-amount-col">公司缴纳</div>
                <div class="insurance-amount-col">个人缴纳</div>
              </div>

              <!-- 养老保险 -->
              <div class="insurance-row">
                <div class="insurance-type-col">
                  <span class="insurance-type-label">养老保险</span>
                </div>
                <div class="insurance-amount-col">
                  <el-form-item prop="pension_company" label-width="0">
                    <el-input-number
                      v-model="form.pension_company"
                      :precision="2"
                      :min="0"
                      style="width: 100%"
                      placeholder="0.00"
                    />
                  </el-form-item>
                </div>
                <div class="insurance-amount-col">
                  <el-form-item prop="pension_personal" label-width="0">
                    <el-input-number
                      v-model="form.pension_personal"
                      :precision="2"
                      :min="0"
                      style="width: 100%"
                      placeholder="0.00"
                    />
                  </el-form-item>
                </div>
              </div>

              <!-- 失业保险 -->
              <div class="insurance-row">
                <div class="insurance-type-col">
                  <span class="insurance-type-label">失业保险</span>
                </div>
                <div class="insurance-amount-col">
                  <el-form-item prop="unemployment_company" label-width="0">
                    <el-input-number
                      v-model="form.unemployment_company"
                      :precision="2"
                      :min="0"
                      style="width: 100%"
                      placeholder="0.00"
                    />
                  </el-form-item>
                </div>
                <div class="insurance-amount-col">
                  <el-form-item prop="unemployment_personal" label-width="0">
                    <el-input-number
                      v-model="form.unemployment_personal"
                      :precision="2"
                      :min="0"
                      style="width: 100%"
                      placeholder="0.00"
                    />
                  </el-form-item>
                </div>
              </div>

              <!-- 工伤保险 -->
              <div class="insurance-row">
                <div class="insurance-type-col">
                  <span class="insurance-type-label">工伤保险</span>
                </div>
                <div class="insurance-amount-col">
                  <el-form-item prop="work_injury_company" label-width="0">
                    <el-input-number
                      v-model="form.work_injury_company"
                      :precision="2"
                      :min="0"
                      style="width: 100%"
                      placeholder="0.00"
                    />
                  </el-form-item>
                </div>
                <div class="insurance-amount-col">
                  <el-form-item prop="work_injury_personal" label-width="0">
                    <el-input-number
                      v-model="form.work_injury_personal"
                      :precision="2"
                      :min="0"
                      style="width: 100%"
                      placeholder="0.00"
                    />
                  </el-form-item>
                </div>
              </div>

              <!-- 医疗保险 - 基础医疗 -->
              <div class="insurance-row">
                <div class="insurance-type-col">
                  <span class="insurance-type-label">基础医疗保险</span>
                </div>
                <div class="insurance-amount-col">
                  <el-form-item prop="medical_base_company" label-width="0">
                    <el-input-number
                      v-model="form.medical_base_company"
                      :precision="2"
                      :min="0"
                      style="width: 100%"
                      placeholder="0.00"
                    />
                  </el-form-item>
                </div>
                <div class="insurance-amount-col">
                  <el-form-item prop="medical_base_personal" label-width="0">
                    <el-input-number
                      v-model="form.medical_base_personal"
                      :precision="2"
                      :min="0"
                      style="width: 100%"
                      placeholder="0.00"
                    />
                  </el-form-item>
                </div>
              </div>

              <!-- 医疗保险 - 大病保险 -->
              <div class="insurance-row">
                <div class="insurance-type-col">
                  <span class="insurance-type-label">大病保险</span>
                </div>
                <div class="insurance-amount-col">
                  <el-form-item prop="critical_illness_company" label-width="0">
                    <el-input-number
                      v-model="form.critical_illness_company"
                      :precision="2"
                      :min="0"
                      style="width: 100%"
                      placeholder="0.00"
                    />
                  </el-form-item>
                </div>
                <div class="insurance-amount-col">
                  <el-form-item prop="critical_illness_personal" label-width="0">
                    <el-input-number
                      v-model="form.critical_illness_personal"
                      :precision="2"
                      :min="0"
                      style="width: 100%"
                      placeholder="0.00"
                    />
                  </el-form-item>
                </div>
              </div>

              <!-- 医疗保险 - 生育保险 -->
              <div class="insurance-row">
                <div class="insurance-type-col">
                  <span class="insurance-type-label">生育保险</span>
                </div>
                <div class="insurance-amount-col">
                  <el-form-item prop="maternity_company" label-width="0">
                    <el-input-number
                      v-model="form.maternity_company"
                      :precision="2"
                      :min="0"
                      style="width: 100%"
                      placeholder="0.00"
                    />
                  </el-form-item>
                </div>
                <div class="insurance-amount-col">
                  <el-form-item prop="maternity_personal" label-width="0">
                    <el-input-number
                      v-model="form.maternity_personal"
                      :precision="2"
                      :min="0"
                      style="width: 100%"
                      placeholder="0.00"
                    />
                  </el-form-item>
                </div>
              </div>
            </div>

            <!-- 商业保险 -->
            <div class="commercial-insurance-section">
              <el-form-item label="商业保险" prop="commercial_insurance" label-width="100px">
                <el-input
                  v-model="form.commercial_insurance"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入商业保险信息"
                  style="max-width: 600px"
                />
              </el-form-item>
            </div>
          </el-card>

          <!-- 状态操作 -->
          <el-divider content-position="left">
            <el-icon><Setting /></el-icon>
            <span class="section-title">状态操作</span>
          </el-divider>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status" size="large">
              <el-radio-button label="active">
                <el-icon style="margin-right: 4px"><CircleCheck /></el-icon>
                在职
              </el-radio-button>
              <el-radio-button label="inactive">
                <el-icon style="margin-right: 4px"><CircleClose /></el-icon>
                离职
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>

      <div class="form-actions" v-if="!loading">
        <el-button size="large" @click="handleCancel">取消</el-button>
        <el-button 
          type="primary" 
          size="large" 
          @click="handleSubmit" 
          :loading="submitting"
          :icon="Check"
        >
          保存
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, ArrowLeft, UserFilled, Money, Check, Setting, CircleCheck, CircleClose } from '@element-plus/icons-vue';
import api from '../../utils/api';

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const submitting = ref(false);
const formRef = ref(null);
const employee = ref(null);

const form = reactive({
  name: '',
  age: null,
  gender: '',
  id_card: '',
  position: '',
  // 养老保险
  pension_company: 0,
  pension_personal: 0,
  // 失业保险
  unemployment_company: 0,
  unemployment_personal: 0,
  // 工伤保险
  work_injury_company: 0,
  work_injury_personal: 0,
  // 医疗保险 - 基础医疗
  medical_base_company: 0,
  medical_base_personal: 0,
  // 医疗保险 - 大病保险
  critical_illness_company: 0,
  critical_illness_personal: 0,
  // 医疗保险 - 生育保险
  maternity_company: 0,
  maternity_personal: 0,
  // 商业保险
  commercial_insurance: '',
  // 状态
  status: 'active',
});

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
};

// 加载员工数据
const fetchEmployee = async () => {
  const id = route.params.id;
  if (!id) {
    ElMessage.error('缺少员工ID');
    router.back();
    return;
  }

  loading.value = true;
  try {
    const data = await api.get(`/employees/${id}`);
    employee.value = data;
    
    // 填充表单数据
    Object.assign(form, {
      ...data,
      age: data.age ? Number(data.age) : null,
      // 养老保险
      pension_company: data.pension_company ? Number(data.pension_company) : 0,
      pension_personal: data.pension_personal ? Number(data.pension_personal) : 0,
      // 失业保险
      unemployment_company: data.unemployment_company ? Number(data.unemployment_company) : 0,
      unemployment_personal: data.unemployment_personal ? Number(data.unemployment_personal) : 0,
      // 工伤保险
      work_injury_company: data.work_injury_company ? Number(data.work_injury_company) : 0,
      work_injury_personal: data.work_injury_personal ? Number(data.work_injury_personal) : 0,
      // 医疗保险 - 基础医疗
      medical_base_company: data.medical_base_company ? Number(data.medical_base_company) : 0,
      medical_base_personal: data.medical_base_personal ? Number(data.medical_base_personal) : 0,
      // 医疗保险 - 大病保险
      critical_illness_company: data.critical_illness_company ? Number(data.critical_illness_company) : 0,
      critical_illness_personal: data.critical_illness_personal ? Number(data.critical_illness_personal) : 0,
      // 医疗保险 - 生育保险
      maternity_company: data.maternity_company ? Number(data.maternity_company) : 0,
      maternity_personal: data.maternity_personal ? Number(data.maternity_personal) : 0,
      // 状态
      status: data.status || 'active',
    });
  } catch (error) {
    console.error('获取员工信息失败:', error);
    ElMessage.error('获取员工信息失败');
    router.back();
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        // 提交所有表单数据，包括状态
        await api.put(`/employees/${employee.value.id}`, form);
        ElMessage.success('更新成功');
        router.back();
      } catch (error) {
        console.error('保存失败:', error);
      } finally {
        submitting.value = false;
      }
    }
  });
};

const handleCancel = () => {
  router.back();
};

onMounted(() => {
  fetchEmployee();
});
</script>

<style scoped>
.employee-edit-container {
  min-height: calc(100vh - 100px);
}

.page-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 24px;
  color: #409EFF;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-container {
  padding: 20px 0;
}

.employee-form {
  max-width: 900px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #606266;
  margin-left: 8px;
}

:deep(.el-divider__text) {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #fff;
  padding: 0 16px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.3s;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #409EFF inset;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

:deep(.el-button) {
  padding: 12px 24px;
  font-size: 14px;
}

.insurance-module {
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.insurance-content {
  padding: 16px;
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
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
}

.insurance-row:last-of-type {
  border-bottom: none;
  margin-bottom: 16px;
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
}

.commercial-insurance-section {
  padding: 16px;
  border-top: 1px solid #ebeef5;
  background-color: #fafafa;
}

:deep(.insurance-row .el-form-item) {
  margin-bottom: 0;
}
</style>

