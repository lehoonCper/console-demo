<template>
    <div class="dynamic-form-container">
        <el-card class="form-card" shadow="never">
            <template #header>
                <div class="card-header">
                    <h3>{{ currentTask ? currentTask.base_config.task_name : '请选择任务类型' }}</h3>
                    <p v-if="currentTask" class="task-description">
                        {{ currentTask.base_config.describe }}
                    </p>
                </div>
            </template>
            
            <div v-if="currentTask" class="form-content">
                <el-form
                    :model="formData"
                    :rules="formRules"
                    ref="dynamicForm"
                    label-position="top"
                    size="default"
                >
                    <el-form-item
                        v-for="(param, index) in currentTask.params"
                        :key="index"
                        :label="param.display_name"
                        :prop="'formValues.' + param.bind_value"
                        :required="param.is_required"
                    >
                        <!-- 根据参数类型渲染不同的输入组件 -->
                        
                        <!-- 文本输入 -->
                        <el-input
                            v-if="param.input_type === 'input'"
                            v-model="formData.formValues[param.bind_value]"
                            :placeholder="param.placeholder || `请输入${param.display_name}`"
                        />
                        
                        <!-- 下拉选择 -->
                        <el-select
                            v-else-if="param.input_type === 'select'"
                            v-model="formData.formValues[param.bind_value]"
                            :placeholder="param.placeholder || `请选择${param.display_name}`"
                            :multiple="param.select_param_option?.is_multiple || false"
                            style="width: 100%"
                        >
                            <el-option
                                v-for="option in param.select_param_option?.options || []"
                                :key="option.value"
                                :label="option.label"
                                :value="option.value"
                            />
                        </el-select>
                        
                        <!-- 时间选择 -->
                        <el-date-picker
                            v-else-if="param.input_type === 'time'"
                            v-model="formData.formValues[param.bind_value]"
                            type="datetime"
                            :format="param.time_param_option?.display_format || 'YYYY-MM-DD HH:mm:ss'"
                            :value-format="param.time_param_option?.value_format || 'YYYY-MM-DD HH:mm:ss'"
                            style="width: 100%"
                        />
                        
                        <!-- 复选框 -->
                        <el-checkbox
                            v-else-if="param.input_type === 'checkbox'"
                            v-model="formData.formValues[param.bind_value]"
                        >
                            {{ param.describe || param.display_name }}
                        </el-checkbox>
                        
                        <!-- 数组输入 -->
                        <el-input
                            v-else-if="param.input_type === 'array'"
                            v-model="formData.formValues[param.bind_value]"
                            type="textarea"
                            :rows="3"
                            :placeholder="param.placeholder + ' (请输入数组元素，用逗号分隔)'"
                        />
                        
                        <!-- 默认文本输入 -->
                        <el-input
                            v-else
                            v-model="formData.formValues[param.bind_value]"
                            :placeholder="param.placeholder || `请输入${param.display_name}`"
                        />
                        
                        <!-- 参数描述 -->
                        <div v-if="param.describe" class="param-description">
                            <small>{{ param.describe }}</small>
                        </div>
                    </el-form-item>
                </el-form>
            </div>
            
            <div v-else class="empty-state">
                <el-empty description="请从左侧菜单选择要执行的任务" />
            </div>
            
            <template #footer v-if="currentTask">
                <div class="form-actions">
                    <el-button type="primary" @click="submitForm" :loading="submitting">
                        提交任务
                    </el-button>
                    <el-button @click="resetForm">重置</el-button>
                </div>
            </template>
        </el-card>
    </div>
</template>

<script>
import { accountInfo } from '@/utils/Account.js';

export default {
    name: 'DynamicForm',
    props: {
        currentTaskKey: {
            type: String,
            default: ''
        },
        taskConfigs: {
            type: Array,
            default: () => []
        }
    },
    emits: ['form-submit'],
    data() {
        return {
            formData: {
                formValues: {}
            },
            formRules: {},
            submitting: false
        }
    },
    computed: {
        currentTask() {
            if (!this.currentTaskKey || !this.taskConfigs.length) {
                return null;
            }
            return this.taskConfigs.find(
                task => task.base_config.task_key === this.currentTaskKey
            );
        }
    },
    watch: {
        currentTask: {
            handler(newTask) {
                if (newTask) {
                    this.initializeForm();
                } else {
                    this.resetFormData();
                }
            },
            immediate: true
        }
    },
    methods: {
        initializeForm() {
            if (!this.currentTask) return;
            
            // 初始化表单数据
            const initialValues = {};
            const rules = {};
            
            if (this.currentTask.params) {
                this.currentTask.params.forEach(param => {
                    // 设置初始值
                    if (param.input_type === 'select' && param.select_param_option?.is_multiple) {
                        initialValues[param.bind_value] = [];
                    } else if (param.input_type === 'checkbox') {
                        initialValues[param.bind_value] = param.checkbox_param_option?.default_value || false;
                    } else {
                        initialValues[param.bind_value] = '';
                    }
                    
                    // 设置验证规则
                    if (param.is_required) {
                        rules[`formValues.${param.bind_value}`] = [
                            {
                                required: true,
                                message: `请${param.input_type === 'select' ? '选择' : '输入'}${param.display_name}`,
                                trigger: param.input_type === 'select' ? 'change' : 'blur'
                            }
                        ];
                    }
                });
            }
            
            this.formData.formValues = initialValues;
            this.formRules = rules;
        },
        
        resetFormData() {
            this.formData = { formValues: {} };
            this.formRules = {};
        },
        
        submitForm() {
            this.$refs.dynamicForm.validate((valid) => {
                if (valid) {
                    this.submitting = true;
                    
                    // 处理表单数据
                    const processedFormValues = this.processFormData();
                    
                    const submitData = {
                        task_key: this.currentTask.base_config.task_key,
                        clusters: ["local"], // 默认集群，可以根据需要修改
                        formValues: processedFormValues,
                        marshaled_params: JSON.stringify(processedFormValues),
                        commit_info: {
                            user_name: accountInfo.get().username,
                            user_email: accountInfo.get().email,
                            timestamp: new Date().toISOString()
                        }
                    };
                    
                    this.$emit('form-submit', submitData);
                    
                    setTimeout(() => {
                        this.submitting = false;
                    }, 1000);
                } else {
                    this.$message.error('请填写必填项');
                }
            });
        },
        
        processFormData() {
            const processed = { ...this.formData.formValues };
            
            if (this.currentTask.params) {
                this.currentTask.params.forEach(param => {
                    const value = processed[param.bind_value];
                    
                    // 根据参数类型处理数据
                    switch (param.input_type) {
                        case 'array':
                            if (typeof value === 'string' && value.trim()) {
                                const dataType = param.array_param_options?.data_type || 'string';
                                const arrayValues = value.split(',').map(v => v.trim()).filter(v => v);
                                
                                if (dataType === 'int') {
                                    processed[param.bind_value] = arrayValues.map(v => parseInt(v, 10)).filter(v => !isNaN(v));
                                } else if (dataType === 'float') {
                                    processed[param.bind_value] = arrayValues.map(v => parseFloat(v)).filter(v => !isNaN(v));
                                } else {
                                    processed[param.bind_value] = arrayValues;
                                }
                            } else {
                                processed[param.bind_value] = [];
                            }
                            break;
                            
                        case 'time':
                            if (value && param.time_param_option?.is_timestamp_value) {
                                processed[param.bind_value] = Math.floor(new Date(value).getTime() / 1000);
                            }
                            break;
                            
                        case 'input':
                            if (param.input_param_options?.data_type === 'int') {
                                processed[param.bind_value] = parseInt(value, 10) || 0;
                            } else if (param.input_param_options?.data_type === 'float') {
                                processed[param.bind_value] = parseFloat(value) || 0;
                            }
                            break;
                    }
                });
            }
            
            return processed;
        },
        
        resetForm() {
            this.$refs.dynamicForm.resetFields();
            this.initializeForm();
        }
    }
}
</script>

<style scoped>
.dynamic-form-container {
    height: 100%;
}

.form-card {
    height: 100%;
    display: flex;
    flex-direction: column;
}

:deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.card-header h3 {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 18px;
    font-weight: 600;
}

.task-description {
    margin: 0;
    color: #909399;
    font-size: 14px;
    line-height: 1.4;
}

.form-content {
    flex: 1;
    overflow-y: auto;
    padding-right: 8px;
}

.param-description {
    margin-top: 4px;
}

.param-description small {
    color: #909399;
    font-size: 12px;
    line-height: 1.3;
}

.empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.form-actions {
    display: flex;
    justify-content: flex-start;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;
}

/* 表单项样式优化 */
:deep(.el-form-item) {
    margin-bottom: 20px;
}

:deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
    margin-bottom: 8px;
}

:deep(.el-input),
:deep(.el-select),
:deep(.el-date-picker) {
    width: 100%;
}

:deep(.el-textarea) {
    width: 100%;
}

/* 滚动条样式 */
.form-content::-webkit-scrollbar {
    width: 6px;
}

.form-content::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 3px;
}

.form-content::-webkit-scrollbar-track {
    background: transparent;
}
</style>