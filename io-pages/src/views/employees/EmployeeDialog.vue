<template>
  <el-dialog
    v-model="visible"
    title="编辑人员"
    width="800px"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="年龄" prop="age">
        <el-input-number v-model="form.age" :min="1" :max="150" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="form.gender">
          <el-radio label="male">男</el-radio>
          <el-radio label="female">女</el-radio>
          <el-radio label="other">其他</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="身份证号" prop="id_card">
        <el-input v-model="form.id_card" placeholder="请输入身份证号" />
      </el-form-item>
      <el-form-item label="职位" prop="position">
        <el-input v-model="form.position" placeholder="请输入职位" />
      </el-form-item>
      <el-divider content-position="left">
        <span style="font-size: 14px; font-weight: 600">保险信息</span>
      </el-divider>

      <el-collapse v-model="activeInsurancePanels" class="insurance-collapse">
        <!-- 养老保险 -->
        <el-collapse-item title="养老保险" name="pension">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="公司缴纳" prop="pension_company">
                <el-input-number
                  v-model="form.pension_company"
                  :precision="2"
                  :min="0"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="个人缴纳" prop="pension_personal">
                <el-input-number
                  v-model="form.pension_personal"
                  :precision="2"
                  :min="0"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 失业保险 -->
        <el-collapse-item title="失业保险" name="unemployment">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="公司缴纳" prop="unemployment_company">
                <el-input-number
                  v-model="form.unemployment_company"
                  :precision="2"
                  :min="0"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="个人缴纳" prop="unemployment_personal">
                <el-input-number
                  v-model="form.unemployment_personal"
                  :precision="2"
                  :min="0"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 工伤保险 -->
        <el-collapse-item title="工伤保险" name="work_injury">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="公司缴纳" prop="work_injury_company">
                <el-input-number
                  v-model="form.work_injury_company"
                  :precision="2"
                  :min="0"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="个人缴纳" prop="work_injury_personal">
                <el-input-number
                  v-model="form.work_injury_personal"
                  :precision="2"
                  :min="0"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 医疗保险 -->
        <el-collapse-item title="医疗保险" name="medical">
          <div style="margin-bottom: 16px;">
            <strong style="color: #606266; font-size: 13px;">基础医疗保险</strong>
            <el-row :gutter="16" style="margin-top: 8px;">
              <el-col :span="12">
                <el-form-item label="公司缴纳" prop="medical_base_company" label-width="100px">
                  <el-input-number
                    v-model="form.medical_base_company"
                    :precision="2"
                    :min="0"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="个人缴纳" prop="medical_base_personal" label-width="100px">
                  <el-input-number
                    v-model="form.medical_base_personal"
                    :precision="2"
                    :min="0"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div style="margin-bottom: 16px;">
            <strong style="color: #606266; font-size: 13px;">大病保险</strong>
            <el-row :gutter="16" style="margin-top: 8px;">
              <el-col :span="12">
                <el-form-item label="公司缴纳" prop="critical_illness_company" label-width="100px">
                  <el-input-number
                    v-model="form.critical_illness_company"
                    :precision="2"
                    :min="0"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="个人缴纳" prop="critical_illness_personal" label-width="100px">
                  <el-input-number
                    v-model="form.critical_illness_personal"
                    :precision="2"
                    :min="0"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div>
            <strong style="color: #606266; font-size: 13px;">生育保险</strong>
            <el-row :gutter="16" style="margin-top: 8px;">
              <el-col :span="12">
                <el-form-item label="公司缴纳" prop="maternity_company" label-width="100px">
                  <el-input-number
                    v-model="form.maternity_company"
                    :precision="2"
                    :min="0"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="个人缴纳" prop="maternity_personal" label-width="100px">
                  <el-input-number
                    v-model="form.maternity_personal"
                    :precision="2"
                    :min="0"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-collapse-item>

        <!-- 商业保险 -->
        <el-collapse-item title="商业保险" name="commercial">
          <el-form-item prop="commercial_insurance">
            <el-input
              v-model="form.commercial_insurance"
              type="textarea"
              :rows="3"
              placeholder="请输入商业保险信息"
            />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
      <el-form-item v-if="employee && employee.status === 'active'" label="状态">
        <el-button type="warning" @click="handleResign">标记为离职</el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import api from '../../utils/api';

const props = defineProps({
  modelValue: Boolean,
  employee: Object,
  status: String,
});

const emit = defineEmits(['update:modelValue', 'success']);

const visible = ref(props.modelValue);
const loading = ref(false);
const formRef = ref(null);
const activeInsurancePanels = ref(['pension', 'unemployment', 'work_injury', 'medical', 'commercial']);

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
});

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
};

watch(() => props.modelValue, (val) => {
  visible.value = val;
  if (val && props.employee) {
    // 确保数值字段转换为数字类型，并保留 status 字段用于显示判断
    Object.assign(form, {
      ...props.employee,
      age: props.employee.age ? Number(props.employee.age) : null,
      // 养老保险
      pension_company: props.employee.pension_company ? Number(props.employee.pension_company) : 0,
      pension_personal: props.employee.pension_personal ? Number(props.employee.pension_personal) : 0,
      // 失业保险
      unemployment_company: props.employee.unemployment_company ? Number(props.employee.unemployment_company) : 0,
      unemployment_personal: props.employee.unemployment_personal ? Number(props.employee.unemployment_personal) : 0,
      // 工伤保险
      work_injury_company: props.employee.work_injury_company ? Number(props.employee.work_injury_company) : 0,
      work_injury_personal: props.employee.work_injury_personal ? Number(props.employee.work_injury_personal) : 0,
      // 医疗保险 - 基础医疗
      medical_base_company: props.employee.medical_base_company ? Number(props.employee.medical_base_company) : 0,
      medical_base_personal: props.employee.medical_base_personal ? Number(props.employee.medical_base_personal) : 0,
      // 医疗保险 - 大病保险
      critical_illness_company: props.employee.critical_illness_company ? Number(props.employee.critical_illness_company) : 0,
      critical_illness_personal: props.employee.critical_illness_personal ? Number(props.employee.critical_illness_personal) : 0,
      // 医疗保险 - 生育保险
      maternity_company: props.employee.maternity_company ? Number(props.employee.maternity_company) : 0,
      maternity_personal: props.employee.maternity_personal ? Number(props.employee.maternity_personal) : 0,
      // 确保 status 字段正确传递（用于更新时保持状态）
      status: props.employee.status || 'active',
    });
  }
});

watch(visible, (val) => {
  emit('update:modelValue', val);
});

const resetForm = () => {
  form.name = '';
  form.age = null;
  form.gender = '';
  form.id_card = '';
  form.position = '';
  // 养老保险
  form.pension_company = 0;
  form.pension_personal = 0;
  // 失业保险
  form.unemployment_company = 0;
  form.unemployment_personal = 0;
  // 工伤保险
  form.work_injury_company = 0;
  form.work_injury_personal = 0;
  // 医疗保险 - 基础医疗
  form.medical_base_company = 0;
  form.medical_base_personal = 0;
  // 医疗保险 - 大病保险
  form.critical_illness_company = 0;
  form.critical_illness_personal = 0;
  // 医疗保险 - 生育保险
  form.maternity_company = 0;
  form.maternity_personal = 0;
  // 商业保险
  form.commercial_insurance = '';
  // 确保清除 status 字段（如果存在）
  if ('status' in form) {
    delete form.status;
  }
};

const handleClose = () => {
  visible.value = false;
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // 编辑时，提交所有字段包括 status（如果存在）
        // 确保 status 字段正确传递
        const updateData = { ...form };
        // 如果 form 中没有 status，使用 employee 的原始 status
        if (!updateData.status && props.employee.status) {
          updateData.status = props.employee.status;
        }
        await api.put(`/employees/${props.employee.id}`, updateData);
        ElMessage.success('更新成功');
        emit('success');
        handleClose();
      } catch (error) {
        console.error('保存失败:', error);
      } finally {
        loading.value = false;
      }
    }
  });
};

const handleResign = async () => {
  try {
    await api.put(`/employees/${props.employee.id}`, {
      ...form,
      status: 'inactive',
    });
    ElMessage.success('已标记为离职');
    emit('success');
    handleClose();
  } catch (error) {
    console.error('操作失败:', error);
  }
};
</script>

<style scoped>
.insurance-collapse {
  margin-top: 10px;
}

:deep(.el-collapse-item__header) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-collapse-item__content) {
  padding: 16px 0;
}
</style>

