<template>
    <div class="form-section">
        <h3 class="section-subtitle">参数配置</h3>
        <div class="params-container">
            <div v-for="(param, index) in modelValue.params" :key="index" class="param-card">
                <div class="param-header">
                    <h4 class="param-title">参数 {{ index + 1 }}</h4>
                    <el-button 
                        type="danger" 
                        @click="removeParam(index)" 
                        circle 
                        size="small"
                        class="param-delete-btn"
                    >
                        <el-icon><Delete /></el-icon>
                    </el-button>
                </div>
                
                <div class="param-content">
                    <!-- 基本信息 -->
                    <div class="param-row">
                        <el-form-item label="字段展示名称" class="param-field">
                            <el-input 
                                v-model="param.display_name" 
                                placeholder="请输入字段展示名称"
                                @input="updateValue"
                            />
                        </el-form-item>
                        <el-form-item label="字段变量名称" class="param-field">
                            <el-input 
                                v-model="param.bind_value" 
                                placeholder="请输入字段变量名称"
                                @input="updateValue"
                            />
                        </el-form-item>
                    </div>
                    
                    <div class="param-row">
                        <el-form-item label="输入组件类型" class="param-field">
                            <el-select 
                                v-model="param.input_type" 
                                placeholder="请选择输入组件类型"
                                @change="handleInputTypeChange(param, index)"
                            >
                                <el-option label="文本输入" value="input"></el-option>
                                <el-option label="下拉选择" value="select"></el-option>
                                <el-option label="时间选择" value="time"></el-option>
                                <el-option label="数组输入" value="array"></el-option>
                                <el-option label="复选框" value="checkbox"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="是否必填" class="param-field">
                            <el-switch 
                                v-model="param.is_required"
                                @change="updateValue"
                            />
                        </el-form-item>
                    </div>
                    
                    <div class="param-row">
                        <el-form-item label="字段描述" class="param-field">
                            <el-input 
                                v-model="param.describe" 
                                placeholder="请输入字段描述"
                                @input="updateValue"
                            />
                        </el-form-item>
                        <el-form-item label="占位符" class="param-field">
                            <el-input 
                                v-model="param.placeholder" 
                                placeholder="请输入占位符"
                                @input="updateValue"
                            />
                        </el-form-item>
                    </div>
                    
                    <!-- 根据输入类型显示不同的配置选项 -->
                    
                    <!-- 输入组件选项 -->
                    <div v-if="param.input_type === 'input'" class="param-options">
                        <h5 class="options-title">输入组件选项</h5>
                        <el-form-item label="数据类型">
                            <el-select 
                                v-model="param.input_param_options.data_type" 
                                placeholder="请选择数据类型"
                                @change="updateValue"
                            >
                                <el-option label="字符串" value="string"></el-option>
                                <el-option label="整数" value="int"></el-option>
                                <el-option label="浮点数" value="float"></el-option>
                                <el-option label="布尔值" value="bool"></el-option>
                            </el-select>
                        </el-form-item>
                    </div>
                    
                    <!-- 下拉选择组件选项 -->
                    <div v-if="param.input_type === 'select'" class="param-options">
                        <h5 class="options-title">下拉选择组件选项</h5>
                        <div class="select-config">
                            <el-form-item label="是否多选">
                                <el-switch 
                                    v-model="param.select_param_option.is_multiple"
                                    @change="updateValue"
                                />
                            </el-form-item>
                            <el-form-item label="选项数据类型">
                                <el-select 
                                    v-model="param.select_param_option.data_type" 
                                    placeholder="请选择数据类型"
                                    @change="updateValue"
                                >
                                    <el-option label="字符串" value="string"></el-option>
                                    <el-option label="整数" value="int"></el-option>
                                    <el-option label="浮点数" value="float"></el-option>
                                    <el-option label="布尔值" value="bool"></el-option>
                                </el-select>
                            </el-form-item>
                        </div>
                        
                        <div class="select-options">
                            <label class="options-label">选项列表</label>
                            <div v-for="(option, optIndex) in param.select_param_option.options" :key="optIndex" class="option-item">
                                <el-input 
                                    v-model="option.label" 
                                    placeholder="显示文本"
                                    class="option-input"
                                    @input="updateValue"
                                />
                                <el-input 
                                    v-model="option.value" 
                                    placeholder="选项值"
                                    class="option-input"
                                    @input="updateValue"
                                />
                                <el-button 
                                    type="danger" 
                                    @click="removeSelectOption(param, optIndex)" 
                                    circle 
                                    size="small"
                                    class="option-delete-btn"
                                >
                                    <el-icon><Delete /></el-icon>
                                </el-button>
                            </div>
                            <el-button 
                                type="primary" 
                                @click="addSelectOption(param)" 
                                plain 
                                size="small"
                            >
                                添加选项
                            </el-button>
                        </div>
                    </div>
                    
                    <!-- 时间组件选项 -->
                    <div v-if="param.input_type === 'time'" class="param-options">
                        <h5 class="options-title">时间组件选项</h5>
                        <div class="time-config">
                            <el-form-item label="时区">
                                <el-input 
                                    v-model="param.time_param_option.timezone" 
                                    placeholder="请输入时区，如：Asia/Shanghai"
                                    @input="updateValue"
                                />
                            </el-form-item>
                            <el-form-item label="展示格式">
                                <el-input 
                                    v-model="param.time_param_option.display_format" 
                                    placeholder="请输入展示格式，如：YYYY-MM-DD HH:mm:ss"
                                    @input="updateValue"
                                />
                            </el-form-item>
                            <el-form-item label="数据格式">
                                <el-input 
                                    v-model="param.time_param_option.value_format" 
                                    placeholder="请输入数据格式，如：YYYY-MM-DD HH:mm:ss"
                                    @input="updateValue"
                                />
                            </el-form-item>
                            <el-form-item label="数据是否为时间戳">
                                <el-switch 
                                    v-model="param.time_param_option.is_timestamp_value"
                                    @change="updateValue"
                                />
                            </el-form-item>
                        </div>
                    </div>
                    
                    <!-- 数组组件选项 -->
                    <div v-if="param.input_type === 'array'" class="param-options">
                        <h5 class="options-title">数组组件选项</h5>
                        <el-form-item label="数组数据类型">
                            <el-select 
                                v-model="param.array_param_options.data_type" 
                                placeholder="请选择数组数据类型"
                                @change="updateValue"
                            >
                                <el-option label="字符串" value="string"></el-option>
                                <el-option label="整数" value="int"></el-option>
                                <el-option label="浮点数" value="float"></el-option>
                                <el-option label="布尔值" value="bool"></el-option>
                            </el-select>
                        </el-form-item>
                    </div>
                    
                    <!-- 复选框组件选项 -->
                    <div v-if="param.input_type === 'checkbox'" class="param-options">
                        <h5 class="options-title">复选框组件选项</h5>
                        <el-form-item label="默认值">
                            <el-switch 
                                v-model="param.checkbox_param_option.default_value"
                                @change="updateValue"
                            />
                        </el-form-item>
                    </div>
                </div>
            </div>
            
            <div class="add-param-container">
                <el-button 
                    type="primary" 
                    @click="addParam" 
                    plain 
                    size="large"
                    class="add-param-btn"
                >
                    <el-icon><Plus /></el-icon>
                    添加参数
                </el-button>
            </div>
        </div>
    </div>
</template>

<script>
import { Delete, Plus } from '@element-plus/icons-vue';

export default {
    name: 'ParamsConfigStep',
    components: {
        Delete,
        Plus
    },
    props: {
        modelValue: {
            type: Object,
            required: true
        }
    },
    emits: ['update:modelValue'],
    methods: {
        updateValue() {
            this.$emit('update:modelValue', this.modelValue);
        },
        addParam() {
            const newParam = {
                display_name: '',
                bind_value: '',
                input_type: 'input',
                describe: '',
                is_required: false,
                placeholder: '',
                select_param_option: {
                    is_multiple: false,
                    options: [],
                    data_type: 'string'
                },
                time_param_option: {
                    timezone: 'Asia/Shanghai',
                    display_format: 'YYYY-MM-DD HH:mm:ss',
                    value_format: 'YYYY-MM-DD HH:mm:ss',
                    is_timestamp_value: false
                },
                array_param_options: {
                    data_type: 'string'
                },
                input_param_options: {
                    data_type: 'string'
                },
                checkbox_param_option: {
                    default_value: false
                }
            };
            this.modelValue.params.push(newParam);
            this.updateValue();
        },
        removeParam(index) {
            this.modelValue.params.splice(index, 1);
            this.updateValue();
        },
        handleInputTypeChange(param, index) {
            // 当输入类型改变时，可以重置相关配置
            this.updateValue();
        },
        addSelectOption(param) {
            param.select_param_option.options.push({
                label: '',
                value: ''
            });
            this.updateValue();
        },
        removeSelectOption(param, optIndex) {
            param.select_param_option.options.splice(optIndex, 1);
            this.updateValue();
        }
    }
}
</script>

<style scoped>
/* 表单区块样式 */
.form-section {
    margin-bottom: 10px;
    background: #f8fafd;
    border-radius: 12px;
    padding: 10px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
    transition: all 0.3s ease;
}

.form-section:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

/* 子标题样式 */
.section-subtitle {
    font-size: 18px;
    font-weight: 600;
    color: #222;
    margin-bottom: 14px;
    padding-bottom: 14px;
    background: transparent;
    position: relative;
    border-bottom: 2px solid #ebeef5;
}

/* 参数容器 */
.params-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* 参数卡片 */
.param-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    border: 1px solid #e4e7ed;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
    transition: all 0.3s ease;
}

.param-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #409eff;
}

/* 参数头部 */
.param-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f2f5;
}

.param-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 0;
}

/* 参数内容 */
.param-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.param-row {
    display: flex;
    gap: 16px;
    align-items: flex-start;
}

.param-field {
    flex: 1;
    margin-bottom: 0;
}

/* 参数选项 */
.param-options {
    background: #f8f9fa;
    border-radius: 6px;
    padding: 16px;
    border: 1px solid #e9ecef;
}

.options-title {
    font-size: 14px;
    font-weight: 600;
    color: #495057;
    margin: 0 0 12px 0;
}

.options-label {
    font-size: 14px;
    font-weight: 500;
    color: #606266;
    display: block;
    margin-bottom: 8px;
}

/* 下拉选择配置 */
.select-config {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
}

.select-config .el-form-item {
    flex: 1;
    margin-bottom: 0;
}

/* 选项列表 */
.select-options {
    margin-top: 12px;
}

.option-item {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    align-items: center;
}

.option-input {
    flex: 1;
}

/* 时间配置 */
.time-config {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* 删除按钮样式 */
.param-delete-btn,
.option-delete-btn {
    background: #fff !important;
    color: #f56c6c !important;
    border: 1px solid #f56c6c !important;
    box-shadow: none !important;
    min-width: 32px !important;
    width: 32px !important;
    height: 32px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px !important;
    transition: all 0.3s ease;
    border-radius: 6px;
}

.param-delete-btn:hover,
.option-delete-btn:hover {
    background: #f56c6c !important;
    color: #fff !important;
    border-color: #f56c6c !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(245, 108, 108, 0.2);
}

/* 添加参数容器 */
.add-param-container {
    display: flex;
    justify-content: center;
    padding: 20px;
}

.add-param-btn {
    min-width: 200px;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 8px;
    border: 2px dashed #409eff;
    color: #409eff;
    background: rgba(64, 158, 255, 0.05);
    transition: all 0.3s ease;
}

.add-param-btn:hover {
    background: rgba(64, 158, 255, 0.1);
    border-color: #66b1ff;
    color: #66b1ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
    .param-row {
        flex-direction: column;
        gap: 12px;
    }
    
    .select-config {
        flex-direction: column;
        gap: 12px;
    }
    
    .option-item {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
    }
    
    .option-delete-btn {
        align-self: flex-end;
        margin-top: 8px;
    }
}
</style> 