<template>
    <div class="form-section">
        <h3 class="section-subtitle">基本信息</h3>
        <div class="form-grid">
            <el-form-item label="任务名称" prop="base_config.task_name">
                <el-input 
                    v-model="modelValue.task_name" 
                    placeholder="请输入任务名称" 
                    class="form-control"
                    @input="updateValue"
                />
            </el-form-item>
            <el-form-item label="任务key" prop="base_config.task_key">
                <el-input 
                    v-model="modelValue.task_key" 
                    placeholder="请输入一个key来唯一标识任务（英文）" 
                    class="form-control"
                    @input="updateValue"
                />
            </el-form-item>
            <el-form-item label="任务描述" prop="base_config.describe">
                <el-input 
                    type="textarea" 
                    v-model="modelValue.describe" 
                    placeholder="请输入任务描述" 
                    :rows="2" 
                    class="form-control"
                    @input="updateValue"
                />
            </el-form-item>
            <el-form-item label="所属分类">
                <el-input
                    v-model="modelValue.category_name"
                    :placeholder="newCategoryMode ? '请输入分类名称' : '分类名称（自动填入）'"
                    class="form-control"
                    :disabled="!newCategoryMode"
                    :readonly="!newCategoryMode"
                    @input="updateValue"
                />
             
            </el-form-item>
            <el-form-item label="分类标识">
                <el-input
                    v-model="modelValue.category_key"
                    :placeholder="newCategoryMode ? '请输入分类标识（英文）' : '分类标识（自动填入）'"
                    class="form-control"
                    :disabled="!newCategoryMode"
                    :readonly="!newCategoryMode"
                    @input="updateValue"
                />
               
            </el-form-item>
            <el-form-item label="是否需要审批" prop="base_config.is_need_approval">
                <el-switch 
                    v-model="modelValue.is_need_approval"
                    @change="updateValue"
                />
            </el-form-item>
        </div>
    </div>
</template>

<script>
export default {
    name: 'BasicInfoStep',
    props: {
        modelValue: {
            type: Object,
            required: true
        },
        currentCategory: {
            type: String,
            default: ''
        },
        isNewCategory: {
            type: Boolean,
            default: false
        },
        newCategoryMode: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:modelValue'],
    methods: {
        updateValue() {
            this.$emit('update:modelValue', this.modelValue);
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

/* 表单网格布局 */
.form-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
    max-width: 100%;
    margin: 0;
}

/* 表单项样式 */
.el-form-item {
    margin-bottom: 20px;
    width: 100%;
    align-items: center;
}

.form-control {
    width: 100% !important;
    max-width: 400px !important;
}

/* 分类信息提示样式 */
.category-info {
    margin-top: 8px;
    padding: 8px 12px;
    background-color: #f0f9ff;
    border: 1px solid #e1f5fe;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.category-info .el-icon {
    color: #409eff;
    font-size: 14px;
}
</style> 