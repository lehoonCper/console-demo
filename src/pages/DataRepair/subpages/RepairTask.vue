<template>
    <div class="repair-task-container">
        <div class="task-layout">
            <!-- 左侧动态表单 -->
            <div class="left-panel">
                <DynamicForm 
                    :currentTaskKey="currentTaskKey"
                    :taskConfigs="taskConfigs"
                    @form-submit="handleFormSubmit"
                />
            </div>
            
            <!-- 右侧历史记录 -->
            <div class="right-panel">
                <History 
                    :currentTaskKey="currentTaskKey"
                    :newHistoryItem="newHistoryItem"
                />
            </div>
        </div>
    </div>
</template>

<script>
import DynamicForm from './DynamicForm.vue';
import History from './History.vue';
import apiService from '@/services/api.service.js';
import { ElMessage } from 'element-plus';

export default {
    name: 'RepairTask',
    components: {
        DynamicForm,
        History
    },
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
    data() {
        return {
            newHistoryItem: null
        }
    },
    methods: {
        async handleFormSubmit(formData) {
            try {
                const response = await apiService.request('createRepairTask', formData);
                
                // 创建历史记录项
                this.newHistoryItem = {
                    id: response.task_id || Date.now(),
                    taskKey: this.currentTaskKey,
                    submitTime: new Date().toLocaleString(),
                    status: 'creating',
                    formValues: formData.formValues
                };
                
                ElMessage.success('任务提交成功');
            } catch (error) {
                console.error('提交任务失败:', error);
                ElMessage.error('提交失败，请稍后重试');
            }
        }
    }
}
</script>

<style scoped>
.repair-task-container {
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
}

.task-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    height: 100%;
}

.left-panel,
.right-panel {
    min-width: 0;
    height: 100%;
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .task-layout {
        grid-template-columns: 1fr;
        gap: 16px;
    }
}
</style>