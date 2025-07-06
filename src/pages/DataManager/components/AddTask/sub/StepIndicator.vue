<template>
    <el-steps :active="currentStep" finish-status="success" align-center class="mini-steps">
        <el-step title="基本信息" />
        <el-step title="访问配置" />
        <el-step title="参数配置" />
    </el-steps>
</template>

<script>
export default {
    name: 'StepIndicator',
    props: {
        currentStep: {
            type: Number,
            required: true
        }
    }
}
</script>

<style scoped>
/* 步骤条样式 */
.mini-steps {
    margin-bottom: 32px !important;
    padding: 0 20px;
}

.mini-steps :deep(.el-step__title) {
    font-size: 14px !important;
    font-weight: 500;
}

.mini-steps :deep(.el-step__icon) {
    width: 24px !important;
    height: 24px !important;
    font-size: 14px !important;
}

.mini-steps :deep(.el-step__main) {
    min-width: 80px !important;
}

.mini-steps :deep(.el-step.is-horizontal .el-step__line) {
    top: 12px;
}
</style> 