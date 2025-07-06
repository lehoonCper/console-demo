<!--
RepairForm.vue - 修复任务表单组件

根据最新的 proto 定义进行了以下修改：
1. 更新参数字段结构，支持新的 RepairParam 格式
2. 支持多种输入类型：input, select, time, checkbox, array
3. 支持各种参数配置选项：
   - SelectParamOption: 下拉选择配置（多选、选项列表、数据类型）
   - TimeParamOption: 时间组件配置（时区、格式、时间戳）
   - ArrayParamOptions: 数组组件配置（数据类型）
   - InputParamOptions: 输入组件配置（数据类型）
   - CheckboxParamOption: 复选框配置（默认值）
4. 增强数据处理逻辑，支持数组和不同数据类型的转换
5. 优化表单验证和用户体验
-->
<template>
  <div class="repair-form-container">
    <DataManagerHeader 
      title="新的任务" 
      :buttons="headerButtons"
      @button-click="handleHeaderButtonClick"
    />
    <div class="content">
        <el-card class="card" shadow="never" v-loading="loading">
      <div class="title">
        <div v-if="currentTask" class="info">
          <div class="task-describe">
                <div class="name" > {{ currentTask.base_config.task_name }}</div>
                <div class="owner" > 接口负责人: {{ currentTask.base_config.owner }}</div>
            </div>      
          <div class="desc">{{ currentTask.base_config.describe }}</div>
        </div>
      </div>
      <div class="form-content">
        <el-form
          :model="formData"
          label-position="right"
          label-width="150px"
          ref="repairForm"
          class="form"
          size="small"
          :validate-on-rule-change="false"
          :rules="formRules"
          :validate-on-change="false"
          :validate-on-input="false"
        >
          <template v-if="currentTask">
            <div class="grid">
              <el-form-item
                v-for="(item, index) in currentTask.params"
                :key="index"
                :prop="'formValues.' + item.bind_value"
                :required="item.is_required"
              >
                <template #label>
                  <div class="form-label">
                    <span>{{ item.display_name }}</span>
                    <el-tooltip
                      v-if="item.describe"
                      :content="item.describe"
                      placement="top"
                      effect="dark"
                    >
                      <el-icon class="info-icon">
                        <InfoFilled />
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
                <!-- 下拉选择组件 -->
                <el-select
                  v-if="item.input_type === 'select'"
                  v-model="formData.formValues[item.bind_value]"
                  :placeholder="item.placeholder || `请选择${item.display_name}`"
                  :multiple="item.select_param_option?.is_multiple || false"
                  class="control"
                  size="small"
                  @change="() => clearFieldValidation('formValues.' + item.bind_value)"
                >
                  <el-option
                    v-for="option in item.select_param_option?.options || []"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>

                <!-- 文本输入组件 -->
                <el-input
                  v-else-if="item.input_type === 'input'"
                  v-model="formData.formValues[item.bind_value]"
                  :placeholder="item.placeholder || `请输入${item.display_name}`"
                  class="control"
                  size="small"
                  @input="() => clearFieldValidation('formValues.' + item.bind_value)"
                />

                <!-- 时间选择组件 -->
                <el-date-picker
                  v-else-if="item.input_type === 'time'"
                  v-model="formData.formValues[item.bind_value]"
                  type="datetime"
                  :format="item.time_param_option?.display_format || 'YYYY-MM-DD HH:mm:ss'"
                  :value-format="item.time_param_option?.value_format || 'YYYY-MM-DD HH:mm:ss'"
                  class="control"
                  size="small"
                  @change="() => clearFieldValidation('formValues.' + item.bind_value)"
                />

                <!-- 复选框组件 -->
                <el-checkbox
                  v-else-if="item.input_type === 'checkbox'"
                  v-model="formData.formValues[item.bind_value]"
                  size="small"
                  @change="() => clearFieldValidation('formValues.' + item.bind_value)"
                >
                  {{ item.describe || item.display_name }}
                </el-checkbox>

                <!-- 数组输入组件 -->
                <div v-else-if="item.input_type === 'array'" class="array-input">
                  <el-input
                    v-model="formData.formValues[item.bind_value]"
                    :placeholder="item.placeholder + ` (请输入数组元素，用逗号分隔)`"
                    class="control"
                    size="small"
                    type="textarea"
                    :rows="2"
                    @input="() => clearFieldValidation('formValues.' + item.bind_value)"
                  />
                </div>

                <!-- 默认输入框 -->
                <el-input
                  v-else
                  v-model="formData.formValues[item.bind_value]"
                  :placeholder="item.placeholder || `请输入${item.display_name}`"
                  class="control"
                  size="small"
                  @input="() => clearFieldValidation('formValues.' + item.bind_value)"
                />

              </el-form-item>
            </div>
          </template>
          <div v-else class="empty">
            <el-empty description="未找到修复类型,请检查URL是否正确" />
          </div>
        </el-form>
      </div>
      <div class="footer">
        <el-button
          type="primary"
          class="submit"
          @click="submitForm"
          :disabled="!currentNode"
          size="small"
        >
          提交
        </el-button>
        <el-button
          class="reset"
          @click="resetForm"
          :disabled="!currentNode"
          size="small"
        >
          重置
        </el-button>
      </div>
    </el-card>
    </div>
    
  </div>
</template>

<script>
import { accountInfo } from '@/utils/Account';
import { InfoFilled } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import DataManagerHeader from './Header.vue';

export default {
  name: 'RepairForm',
  components: {
    DataManagerHeader,
    InfoFilled
  },
      props: {
        loading: {
            type: Boolean,
            default: false
        },
        currentTask: {
            type: Object,
            default: () => null
        }
    },
  data() {
    return {
      formData: {
        formValues: {}
      },
      rules: {},
      validateMode: false,
      formRules: {},
      currentNode: null
    }
  },
  computed: {
    // 判断是否禁用编辑功能
    isDisableEdit() {
      if (!this.currentTask || !this.currentTask.base_config) {
        return true;
      }
      
      const taskOwner = this.currentTask.base_config.owner;
      const currentUserInfo = accountInfo.get();
      const currentUserEmail = currentUserInfo.username;
      
      if (!taskOwner || !currentUserEmail) {
        return true;
      }

      return taskOwner !== currentUserEmail;
    },
    
    // 动态生成 header 按钮
    headerButtons() {
      return [
        {
          text: '编辑',
          action: 'edit',
          type: 'primary',
          icon: 'el-icon-edit',
          disabled: this.isDisableEdit,
        },
        {
          text: '删除',
          action: 'delete',
          type: 'danger',
          icon: 'el-icon-delete',
          disabled: this.isDisableEdit,
        }
      ];
    }
  },
      watch: {
        currentTask: {
            handler(newTask) {
                if (newTask) {
                    this.updateCurrentNode();
                    this.updateFormRules();
                } else {
                    this.formRules = {};
                    this.currentNode = null;
                }
            },
            immediate: true,
            deep: true
        }
    },
  beforeUnmount() {
    this.currentNode = null;
    this.formData = {
      formValues: {}
    };
  },
  methods: {
    handleHeaderButtonClick(action) {
      switch (action) {
        case 'edit':
          this.handleEdit();
          break;
        case 'delete':
          this.handleDelete();
          break;
        default:
          ElMessage.warning('未知操作');
      }
    },

    handleEdit() {
      if (!this.currentTask) {
        ElMessage.warning('没有可编辑的任务');
        return;
      }
      
      this.$emit('edit-task', {
        action: 'edit',
        taskData: this.currentTask
      });
      
      ElMessage.info('进入编辑模式');
    },

    handleDelete() {
      if (!this.currentTask) {
        ElMessage.warning('没有可删除的任务');
        return;
      }

      ElMessageBox.confirm(
        `确定要删除任务 "${this.currentTask.base_config.task_name}" 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        }
      ).then(() => {
        this.performDelete();
      }).catch(() => {
        ElMessage.info('已取消删除');
      });
    },

    performDelete() {
      try {
        ElMessage.success('任务删除成功');
        this.$emit('delete-task', this.currentTask);
        this.resetForm();
      } catch (error) {
        console.error('删除任务失败:', error);
        ElMessage.error('删除任务失败，请重试');
      }
    },

    updateCurrentNode() {
      if (!this.currentTask) {
        this.currentNode = null;
        return;
      }
      
      this.currentNode = {
        key: this.currentTask.base_config.task_key,
        display: this.currentTask.base_config.task_name,
        describe: this.currentTask.base_config.task_describe
      };
      this.initializeFormValues();
    },

    initializeFormValues() {
      if (!this.currentTask) return;

      const initialValues = {};

      if (this.currentTask.params) {
        this.currentTask.params.forEach(item => {
          if (item.input_type === 'select' && item.select_param_option?.is_multiple) {
            initialValues[item.bind_value] = [];
          } else if (item.input_type === 'checkbox') {
            initialValues[item.bind_value] = item.checkbox_param_option?.default_value || false;
          } else if (item.input_type === 'array') {
            initialValues[item.bind_value] = '';
          } else if (item.input_type === 'time') {
            initialValues[item.bind_value] = '';
          } else {
            initialValues[item.bind_value] = '';
          }
        });
      }

      this.formData.formValues = initialValues;
    },

    updateFormRules() {
      if (!this.currentTask) {
        this.formRules = {};
        return;
      }

      const dynamicRules = {
        ...this.rules
      };

      if (this.currentTask.params) {
        this.currentTask.params.forEach(item => {
          if (item.is_required) {
            const propName = 'formValues.' + item.bind_value;
            if (dynamicRules[propName]) {
              dynamicRules[propName] = [{
                required: false,
                validator: (rule, value, callback) => callback(),
                trigger: 'submit'
              }];
            }
          }
        });
      }

      this.formRules = dynamicRules;
    },

    generateValidationRules() {
      if (!this.currentNode) return;

      const rules = {};
      if (this.currentTask.params) {
        this.currentTask.params.forEach(item => {
          if (item.is_required) {
            let rule = {
              required: true,
              message: `请${item.input_type === 'select' ? '选择' : '输入'}${item.display_name}`,
              trigger: 'submit'
            };
            
            if (item.input_type === 'checkbox') {
              rule.type = 'boolean';
            } else if (item.input_type === 'select' && item.select_param_option?.is_multiple) {
              rule.type = 'array';
            } else if (item.input_type === 'array') {
              rule.type = 'string';
              rule.message = `请输入${item.display_name}`;
            } else if (item.input_type === 'time') {
              rule.type = 'string';
              rule.message = `请选择${item.display_name}`;
            } else {
              rule.type = 'string';
            }
            
            rules[`formValues.${item.bind_value}`] = [rule];
          }
        });
      }

      this.rules = rules;
      this.updateFormRules();
    },

    clearFieldValidation(prop) {
      if (this.$refs.repairForm) {
        this.$refs.repairForm.clearValidate(prop);
      }
    },

    submitForm() {
      if (!this.currentNode) return;

      this.$refs.repairForm.validate((valid) => {
        if (valid) {
          // 根据 proto 定义处理表单数据
          const processedFormValues = { ...this.formData.formValues };
          
          if (this.currentTask.params) {
            this.currentTask.params.forEach(item => {
              const value = processedFormValues[item.bind_value];
              
              // 处理不同输入类型的数据格式
              switch (item.input_type) {
                case 'input':
                  // 输入组件：根据 input_param_options.data_type 转换
                  if (item.input_param_options?.data_type && value !== null && value !== undefined && value !== '') {
                    const dataType = item.input_param_options.data_type;
                    if (dataType === 'int') {
                      const intValue = parseInt(value, 10);
                      processedFormValues[item.bind_value] = isNaN(intValue) ? null : intValue;
                    } else if (dataType === 'float') {
                      const floatValue = parseFloat(value);
                      processedFormValues[item.bind_value] = isNaN(floatValue) ? null : floatValue;
                    } else if (dataType === 'bool') {
                      processedFormValues[item.bind_value] = value === 'true' || value === true;
                    } else {
                      // string 类型保持原样
                      processedFormValues[item.bind_value] = String(value);
                    }
                  }
                  break;

                case 'select':
                  // 下拉选择：根据 select_param_option 处理
                  if (item.select_param_option?.is_multiple) {
                    // 多选：确保返回数组
                    processedFormValues[item.bind_value] = Array.isArray(value) ? value : [];
                  } else {
                    // 单选：根据 data_type 转换
                    if (value !== null && value !== undefined && value !== '') {
                      const dataType = item.select_param_option?.data_type || 'string';
                      if (dataType === 'int') {
                        const intValue = parseInt(value, 10);
                        processedFormValues[item.bind_value] = isNaN(intValue) ? null : intValue;
                      } else if (dataType === 'float') {
                        const floatValue = parseFloat(value);
                        processedFormValues[item.bind_value] = isNaN(floatValue) ? null : floatValue;
                      } else if (dataType === 'bool') {
                        processedFormValues[item.bind_value] = value === 'true' || value === true;
                      } else {
                        processedFormValues[item.bind_value] = String(value);
                      }
                    }
                  }
                  break;

                case 'time':
                  // 时间组件：根据 time_param_option 处理
                  if (value && item.time_param_option) {
                    if (item.time_param_option.is_timestamp_value) {
                      // 转换为时间戳
                      const timestamp = new Date(value).getTime();
                      processedFormValues[item.bind_value] = isNaN(timestamp) ? null : Math.floor(timestamp / 1000);
                    } else {
                      // 保持格式化的时间字符串
                      processedFormValues[item.bind_value] = String(value);
                    }
                  }
                  break;

                case 'array':
                  // 数组组件：根据 array_param_options.data_type 处理
                  if (typeof value === 'string' && value.trim()) {
                    const dataType = item.array_param_options?.data_type || 'string';
                    const arrayValues = value.split(',').map(v => v.trim()).filter(v => v);
                    
                    if (dataType === 'int') {
                      processedFormValues[item.bind_value] = arrayValues
                        .map(v => parseInt(v, 10))
                        .filter(v => !isNaN(v));
                    } else if (dataType === 'float') {
                      processedFormValues[item.bind_value] = arrayValues
                        .map(v => parseFloat(v))
                        .filter(v => !isNaN(v));
                    } else if (dataType === 'bool') {
                      processedFormValues[item.bind_value] = arrayValues
                        .map(v => v.toLowerCase() === 'true');
                    } else {
                      // string 类型
                      processedFormValues[item.bind_value] = arrayValues;
                    }
                  } else {
                    processedFormValues[item.bind_value] = [];
                  }
                  break;

                case 'checkbox':
                  // 复选框：确保为布尔值
                  processedFormValues[item.bind_value] = Boolean(value);
                  break;

                default:
                  // 其他类型保持原样
                  break;
              }
            });
          }

          const formData = {
            task_key: this.currentNode.key,
            clusters: ["local"],
            formValues: processedFormValues,
            marshaled_params: JSON.stringify(processedFormValues),
            commit_info: {
                user_name: accountInfo.get().username,
                user_email: accountInfo.get().email,
                timestamp: new Date(),
            }
          };
          this.$emit('submit-form', formData);
        } else {
          ElMessage.error('请填写必填项');
          return false;
        }
      });
    },

    resetForm() {
      if (this.$refs.repairForm) {
        this.$refs.repairForm.resetFields();
        this.initializeFormValues();
      }
      this.$emit('reset-form');
    }
  }
}
</script>

<style scoped>
.repair-form-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  margin: 0;
  background-color: #f0f2f5;
}

.content {
    height: 100%;
    background-color: #f0f2f5;
}

.card {
  height: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;
  overflow: hidden;
}

:deep(.el-card__body) {
  padding-top: 0;
  margin-top: 0;
  border-radius: 0;
}

.title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px 20px;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
}

.info {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.owner {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.task-describe {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
}

.name {
  font-size: 20px;
  font-weight: 700;
  color: #409eff;
}

.desc {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.form-content {
  flex: 1;
  padding: 12px;
  background-color: #fff;
}

.el-form-item {
  margin-bottom: 16px;
  display: flex;
  width: 100%;
  align-items: center;
}

.el-form-item:hover {
  background-color: rgba(64, 158, 255, 0.03);
  border-radius: 4px;
}

.control,
.radio,
.input,
.area {
  width: 100% !important;
  max-width: 300px !important;
}

.radio {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.market {
  margin-bottom: 4px;
}

.footer {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  margin-top: 0;
  padding: 16px 20px;
  border-top: 1px solid #ebeef5;
  background-color: #fff;
}

.submit {
  padding: 8px 20px;
  font-weight: 500;
  background: linear-gradient(to right, #409eff, #53a8ff);
  border: none;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
}

.submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.reset {
  padding: 8px 20px;
  font-weight: 500;
  border-color: #dcdfe6;
  border-radius: 6px;
}

.reset:hover {
  border-color: #409eff;
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.05);
}

.grid {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.grid .el-form-item {
  margin-bottom: 8px;
  width: 100%;
}

.form .el-form-item__label {
  padding-bottom: 0;
  text-align: right;
  line-height: 32px;
  font-size: 14px;
}

.empty {
  padding: 20px;
  text-align: center;
}

.area {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.area .input {
  flex: 1;
  width: auto;
  max-width: 220px;
}

.area .checkbox {
  flex: none;
  white-space: nowrap;
}

:deep(.el-form-item__label) {
  text-align: right;
  padding-right: 16px;
  color: #606266;
  font-weight: 500;
}

:deep(.el-form-item__content) {
  line-height: 32px;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: flex-start;
}

/* 数组输入样式 */
.array-input {
  width: 100%;
  max-width: 300px;
}

.array-hint {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.2;
}

/* 参数描述样式 */
.param-description {
  margin-top: 4px;
  width: 100%;
}

.param-description small {
  color: #909399;
  font-size: 12px;
  line-height: 1.3;
}

/* 表单标签样式 */
.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-icon {
  color: #909399;
  font-size: 14px;
  cursor: help;
  transition: color 0.3s ease;
}

.info-icon:hover {
  color: #409eff;
}
</style>
