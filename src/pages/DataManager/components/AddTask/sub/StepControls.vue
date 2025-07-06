<template>
    <div class="form-actions">
        <el-button v-if="currentStep > 1" @click="$emit('prev')" size="small">上一步</el-button>
        <el-button v-if="currentStep < totalSteps" type="primary" @click="$emit('next')" size="small">下一步</el-button>
        <el-button v-if="currentStep === totalSteps" type="primary" @click="$emit('submit')" size="small">提交</el-button>
        <el-button @click="$emit('reset')" size="small">重置</el-button>
    </div>
</template>

<script>
export default {
    name: 'StepControls',
    props: {
        currentStep: {
            type: Number,
            required: true
        },
        totalSteps: {
            type: Number,
            required: true
        }
    },
    emits: ['prev', 'next', 'submit', 'reset']
}
</script>

<style scoped>
/* 表单操作按钮 */
.form-actions {
    margin-top: 40px;
    display: flex;
    justify-content: flex-start;
    gap: 16px;
    padding: 0;
    border-top: none;
    background: transparent;
    position: static;
    max-width: 100%;
}

/* 按钮样式 */
.el-button {
    font-weight: 500;
    min-width: 90px;
    border-radius: 8px;
    height: 36px;
    transition: all 0.3s ease;
}

.el-button--primary {
    background: linear-gradient(to right, #409eff, #53a8ff);
    border: none;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.el-button--primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
}

.el-button--default {
    border-color: #dcdfe6;
}

.el-button--default:hover {
    border-color: #409eff;
    color: #409eff;
    background-color: rgba(64, 158, 255, 0.05);
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
    .form-actions {
        flex-wrap: wrap;
    }
    
    .el-button {
        min-width: 80px;
    }
}
</style> 