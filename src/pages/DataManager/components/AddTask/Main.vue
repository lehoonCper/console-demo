<template>
    <div class="add-task-container">
        <DataManagerHeader 
            :title="editTaskData ? '编辑任务' : '接入新的任务'"
            :buttons="headerButtons"
            @button-click="handleHeaderButtonClick"
        />
        <div class="form">
            <el-card class="form-card" shadow="never" v-loading="loading">
                <div class="form-content">
                    <StepIndicator :current-step="step" />
                    <el-form 
                        ref="taskForm"
                        :model="formData"
                        :rules="rules"
                        label-position="right"
                        label-width="150px"
                        class="compact-form"    
                        size="small"
                    >
                        <!-- 步骤1：基本信息 -->
                        <BasicInfoStep 
                            v-if="step === 1"
                            v-model="formData.base_config"
                            :current-category="currentCategory"
                            :is-new-category="isNewCategory"
                            :new-category-mode="newCategoryMode"
                        />
                        
                        <!-- 步骤2：访问配置 -->
                        <AccessConfigStep 
                            v-if="step === 2"
                            v-model="formData.access_config"
                            @access-type-change="handleAccessTypeChange"
                        />
                        
                        <!-- 步骤3：参数配置 -->
                        <ParamsConfigStep 
                            v-if="step === 3"
                            v-model="formData"
                        />
                        
                        <!-- 步骤控制按钮 -->
                        <StepControls 
                            :current-step="step"
                            :total-steps="3"
                            @prev="prevStep"
                            @next="nextStep"
                            @submit="submitForm"
                            @reset="resetForm"
                        />
                    </el-form>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script>
import apiService from '@/services/api.service';
import { accountInfo } from '@/utils/Account';
import { ElMessage } from 'element-plus';
import DataManagerHeader from '../Header.vue';
import AccessConfigStep from './sub/AccessConfigStep.vue';
import BasicInfoStep from './sub/BasicInfoStep.vue';
import ParamsConfigStep from './sub/ParamsConfigStep.vue';
import StepControls from './sub/StepControls.vue';
import StepIndicator from './sub/StepIndicator.vue';

// 假设有全局用户信息（如Vuex或localStorage），这里用localStorage举例
function getCurrentUserEmail() {
    // 你可以根据实际项目替换为从Vuex或API获取
   //从AccountInfo中获取
    return accountInfo.username
}

export default {
    name: 'AddTaskMain',
    components: {
        DataManagerHeader,
        StepIndicator,
        StepControls,
        BasicInfoStep,
        AccessConfigStep,
        ParamsConfigStep,

    },
    props: {
        currentCategory: {
            type: String,
            default: ''
        },
        isNewCategory: {
            type: Boolean,
            default: false
        },
        categoryInfo: {
            type: Object,
            default: null
        },
        editTaskData: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            loading: false,
            // 过滤掉实时数据修复和历史数据修复
            categories: ( []).filter(c => !['realtime_data_repair', 'history_data_repair'].includes(c.key)),
            formData: {
                base_config: {
                    task_name: '',
                    task_kind: '',
                    task_key: '',
                    describe: '',
                    category_name: '',
                    category_key: '',
                    is_need_approval: false,
                    owner: getCurrentUserEmail()
                },
                access_config: {
                    access_type: 'http',
                    resource_kind: '',
                    resource_name: '',
                    namespace: '',
                    is_async: false,
                    timeout_seconde: 0,
                    allowed_clusters: [],
                    http_access_config: {
                        method: 'POST',
                        port: '',
                        path: '',
                        headers:{}
                    },
                    grpc_access_config: {
                        service: '',
                        method: '',
                        headers:{}
                    }
                },
                params: [],
                commit_info: {
                    user_email: getCurrentUserEmail(),
                    open_id: ''
                }
            },
            rules: {
                'base_config.task_name': [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
                'base_config.task_key': [
                    { required: true, message: '请输入任务标识', trigger: 'blur' },
                    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '任务标识只能包含字母、数字和下划线，且必须以字母开头', trigger: 'blur' }
                ],
                'base_config.describe': [{ required: true, message: '请输入任务描述', trigger: 'blur' }],
                'base_config.category_key': [{ required: true, message: '请选择所属分类', trigger: 'change' }],
                'base_config.category_name': [{ required: true, message: '请输入新分类名称', trigger: 'blur' }],
                'access_config.access_type': [{ required: true, message: '请选择访问类型', trigger: 'change' }],
                'access_config.deployment_name': [{ required: true, message: '请输入部署名称', trigger: 'blur' }],
                'access_config.allowed_clusters': [{ required: true, message: '请选择允许的集群', trigger: 'change' }],
                'access_config.http_access_config.method': [{ required: true, message: '请选择请求方法', trigger: 'change' }],
                'access_config.http_access_config.port': [
                    { required: true, message: '请输入端口号', trigger: 'blur' },
                    { pattern: /^\d+$/, message: '端口号必须为数字', trigger: 'blur' }
                ],
                'access_config.http_access_config.path': [{ required: true, message: '请输入API路径', trigger: 'blur' }],
                'access_config.grpc_access_config.service': [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
                'access_config.grpc_access_config.method': [{ required: true, message: '请输入方法名称', trigger: 'blur' }],
            },
            step: 1,
            // 内部用于控制是否显示新增分类表单
            newCategoryMode: false
        }
    },
    computed: {
        headerButtons() {
            const buttons = [];
            if (this.editTaskData) {
                buttons.push({
                    text: '返回',
                    action: 'back',
                    type: 'default',
                    icon: 'el-icon-back'
                });
            }
            return buttons;
        }
    },
    watch: {
        currentCategory: {
            immediate: true,
            handler() {
                this.updateCategoryInfo();
            }
        },
        isNewCategory: {
            immediate: true,
            handler() {
                this.updateCategoryInfo();
            }
        },
        editTaskData: {
            immediate: true,
            handler(newData) {
                if (newData) {
                    this.loadEditData(newData);
                }
            }
        }
    },
    methods: {
        // 更新分类信息
        updateCategoryInfo() {
            // 处理新增分类的情况
            if (this.isNewCategory) {
                this.formData.base_config.category_name = '';
                this.formData.base_config.category_key = '';
                this.newCategoryMode = true;
            } else if (this.categoryInfo) {
                // 使用传入的分类信息
                this.formData.base_config.category_name = this.categoryInfo.name;
                this.formData.base_config.category_key = this.categoryInfo.key;
                this.newCategoryMode = false;
            } else if (this.currentCategory) {
                // 处理选择现有分类的情况（兼容旧逻辑）
                const cat = this.categories.find(c => c.key === this.currentCategory);
                if (cat) {
                    this.formData.base_config.category_name = cat.name;
                    this.formData.base_config.category_key = cat.key;
                    this.newCategoryMode = false;
                }
            } else {
                // 没有选择分类的情况
                this.newCategoryMode = false;
            }
            
            this.$nextTick(() => {
                if (this.$refs.taskForm) {
                    this.$refs.taskForm.clearValidate(['base_config.category_key', 'base_config.category_name']);
                }
            });
        },
        
        // 加载编辑数据
        loadEditData(taskData) {
            if (!taskData) return;
            
            // 填充基本信息
            if (taskData.base_config) {
                this.formData.base_config = {
                    ...this.formData.base_config,
                    ...taskData.base_config
                };
            }
            
            // 填充访问配置
            if (taskData.access_config) {
                this.formData.access_config = {
                    ...this.formData.access_config,
                    ...taskData.access_config
                };
            }
            
            // 填充参数配置
            if (taskData.params && Array.isArray(taskData.params)) {
                this.formData.params = taskData.params.map(param => ({
                    display_name: param.display_name || '',
                    bind_value: param.bind_value || '',
                    input_type: param.input_type || 'input',
                    describe: param.describe || '',
                    is_required: param.is_required || false,
                    placeholder: param.placeholder || '',
                    select_param_option: {
                        is_multiple: param.select_param_option?.is_multiple || false,
                        options: param.select_param_option?.options || [],
                        data_type: param.select_param_option?.data_type || 'string'
                    },
                    time_param_option: {
                        timezone: param.time_param_option?.timezone || 'Asia/Shanghai',
                        display_format: param.time_param_option?.display_format || 'YYYY-MM-DD HH:mm:ss',
                        value_format: param.time_param_option?.value_format || 'YYYY-MM-DD HH:mm:ss',
                        is_timestamp_value: param.time_param_option?.is_timestamp_value || false
                    },
                    array_param_options: {
                        data_type: param.array_param_options?.data_type || 'string'
                    },
                    input_param_options: {
                        data_type: param.input_param_options?.data_type || 'string'
                    },
                    checkbox_param_option: {
                        default_value: param.checkbox_param_option?.default_value || false
                    }
                }));
            }
            
            // 设置为编辑模式，显示所有步骤的数据
            this.step = 1;
            
            // 清除验证状态
            this.$nextTick(() => {
                if (this.$refs.taskForm) {
                    this.$refs.taskForm.clearValidate();
                }
            });
        },
        
        handleAccessTypeChange() {
            // 只保留proto定义的字段
            this.formData.access_config.http_access_config = {
                method: 'POST',
                port: '',
                path: '',
                headers: {}
            };
            this.formData.access_config.grpc_access_config = {
                service: '',
                method: '',
                headers: {}
            };
        },
        
        nextStep() {
            this.$refs.taskForm.validate((valid) => {
                if (valid) {
                    this.step++;
                }
            });
        },
        
        prevStep() {
            if (this.step > 1) this.step--;
        },
        
        async submitForm() {
            //判断是否为更新
            if (this.editTaskData) {
                this.$refs.taskForm.validate(async (valid) => {
                if (valid) {
                    const taskConfig = {
                        base_config: this.formData.base_config,
                        access_config: this.formData.access_config,
                        params: this.formData.params,
                        commit_info: this.formData.commit_info
                    }
                    try {
                        await apiService.request('updateRepairTask', taskConfig)
                        ElMessage.success('保存成功')
                        this.$emit('task-added', taskConfig)
                    } catch (e) {
                        ElMessage.error(e?.message || '保存失败')
                    }
                } else {
                    ElMessage.error('请填写必填项')
                    return false
                }
            })
               return
            }

            this.$refs.taskForm.validate(async (valid) => {
                if (valid) {
                    const taskConfig = {
                        base_config: this.formData.base_config,
                        access_config: this.formData.access_config,
                        params: this.formData.params,
                        commit_info: this.formData.commit_info
                    }
                    try {
                        await apiService.request('registerRepairTask', taskConfig)
                        ElMessage.success('保存成功')
                        this.$emit('task-added', taskConfig)
                    } catch (e) {
                        ElMessage.error(e?.message || '保存失败')
                    }
                } else {
                    ElMessage.error('请填写必填项')
                    return false
                }
            })
        },
        
        resetForm() {
            this.$refs.taskForm.resetFields()
            this.formData.params = []
            this.formData.access_config.http_access_config.headers = []
            this.formData.access_config.grpc_access_config.headers = []
        },
        
        handleHeaderButtonClick(action) {
            if (action === 'back') {
                this.handleCancel();
            }
        },
        
        handleCancel() {
            // 发送取消编辑事件给父组件
            this.$emit('cancel-edit');
        }
    }
}
</script>

<style scoped>
/* 基础布局样式 */
.add-task-container {
    height: 100%;
    background: #f6f8fa;
    margin: auto;
}

.form {
    width: 100%;
}

/* 卡片容器样式 */
.form-card {
    background: #fff;
    border-radius: 0 0 16px 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    width: 100%;
    margin: 0 auto;
    padding: 0;
    border: none;
    transition: all 0.3s ease;
}

.form-card:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

/* 表单内容区域 */
.form-content {
    padding: 10px;
    background: #fff;
    margin-bottom: 2px;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-form-item__label) {
    text-align: right;
    padding-right: 16px;
    color: #606266;
    font-weight: 500;
    min-width: 120px;
    font-size: 14px;
}

:deep(.el-form-item__content) {
    line-height: 32px;
    display: flex;
    justify-content: flex-start;
    flex: 1;
}

.compact-form .el-form-item__label {
    padding-bottom: 0;
    text-align: right;
    line-height: 32px;
    font-size: 14px;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
    .form-card {
        max-width: 100% !important;
        margin: 0 16px;
    }
    
    .form-content {
        padding: 16px;
    }
    
    .add-task-container {
        padding: 16px 0;
    }
}
</style> 