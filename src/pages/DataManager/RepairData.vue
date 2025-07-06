<template>
    <div class="repair-data-container">
        <!-- 任务表单和历史记录 -->
        <div class="layout" :class="{ 'expanded': isHistoryExpanded }">
            <!-- 左侧表单部分 -->
            <div class="left">
                <RepairForm 
                    :currentTask="currentTask"
                    :loading="loading"
                    @submit-form="handleSubmit" 
                    @edit-task="handleEditTask" 
                    @delete-task="handleDeleteTask" 
                />
            </div>

            <!-- 右侧历史记录部分 -->
            <div class="right">
                <RepairHistory 
                    ref="repairHistoryRef"
                    :newHistoryItem="newHistoryItem"
                    :currentTaskKey="currentTaskKey"
                    @history-expanded="isHistoryExpanded = true" 
                    @history-collapsed="isHistoryExpanded = false"
                    @task-executed="handleTaskExecuted"
                    @refresh-history="refreshHistory"
                />
            </div>
        </div>
    </div>
</template>

<script>
import apiService from '@/services/api.service';
import { ElMessage } from 'element-plus';
import RepairForm from './components/RepairForm.vue';
import RepairHistory from './components/RepairHistory.vue';

export default {
    name: 'RepairData',
    components: {
        RepairForm,
        RepairHistory
    },
    props: {
        currentTaskKey: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            loading: false,
            currentTask: null,
            isHistoryExpanded: false,
            repairTaskConfigs: [],
            newHistoryItem: null
        }
    },
    computed: {
        // 当前任务是否已加载
        isTaskLoaded() {
            return this.currentTask !== null;
        }
    },
    watch: {
        currentTaskKey: {
            handler(newTaskKey) {
                if (newTaskKey) {
                    this.loadCurrentTask(newTaskKey);
                } else {
                    this.currentTask = null;
                }
            },
            immediate: true
        }
    },
    methods: {
        async fetchRepairTaskConfigs() {
            try {
                const response = await apiService.request('getRepairTaskConfigs');
                this.repairTaskConfigs = response.task_list || [];
            } catch (error) {
                console.error('获取任务配置失败:', error);
                this.repairTaskConfigs = [];
            }
        },
        
        async loadCurrentTask(taskKey) {
            if (!taskKey) {
                this.currentTask = null;
                return;
            }
            
            // 如果配置未加载，先加载配置
            if (this.repairTaskConfigs.length === 0) {
                await this.fetchRepairTaskConfigs();
            }
            
            // 查找对应的任务配置
            this.currentTask = this.repairTaskConfigs.find(
                task => task.base_config.task_key === taskKey
            ) || null;
            
            if (!this.currentTask) {
                ElMessage.warning(`未找到任务配置: ${taskKey}`);
            }
        },

        async refreshHistory() {
            console.log('refreshHistory!!!');
            // 直接调用子组件的刷新方法
            if (this.$refs.repairHistoryRef) {
                await this.$refs.repairHistoryRef.refreshHistory();
            }
            // 同时发出事件，供父组件监听
            this.$emit('refresh-history');
        },

        async handleSubmit(formData) {
            if (!this.currentTask) {
                ElMessage.error('请先选择任务类型');
                return;
            }

            this.loading = true;
            
            try {
                const response = await apiService.request('createRepairTask', formData);
                
                // 创建历史记录项
                const newItem = {
                    id: response.task_id || Date.now(),
                    taskKey: this.currentTask.base_config.task_key,
                    taskName: this.currentTask.base_config.task_name,
                    submitTime: new Date().toLocaleString(),
                    status: 'creating',
                    formValues: formData.formValues
                };
                
                // 使用nextTick确保在下一个tick中更新，避免同步更新导致的问题
                this.$nextTick(() => {
                    this.newHistoryItem = newItem;
                });
                
                ElMessage.success(response.message || '任务提交成功');
            } catch (error) {
                console.error('提交任务失败:', error);
                ElMessage.error(error.message || '提交失败，请稍后重试');
            } finally {
                this.loading = false;
            }
            this.refreshHistory();
        },

        handleEditTask(data) {
            // 编辑任务：通知父组件打开AddTask组件
            this.$emit('edit-task', data);
        },

        async handleDeleteTask(taskData) {
            try {
                // 标记删除
                const deleteData = { ...taskData, is_delete: true };
                await apiService.request('updateRepairTask', deleteData);
                
                ElMessage.success('任务删除成功');
                this.$emit('task-updated');
            } catch (error) {
                console.error('删除任务失败:', error);
                ElMessage.error('删除任务失败，请稍后重试');
            }
        },

        async handleTaskExecuted() {
            // 任务执行后，刷新历史列表
            await this.refreshHistory();
            ElMessage.success('任务已提交执行');
        },


    },
    
    async created() {
        await this.fetchRepairTaskConfigs();
        
        // 如果有初始任务key，加载对应任务
        if (this.currentTaskKey) {
            this.loadCurrentTask(this.currentTaskKey);
        }
    }
}
</script>

<style scoped>
.repair-data-container {
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
}

.layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    height: 100%;
    transition: grid-template-columns 0.3s ease;
}

.layout.expanded {
    grid-template-columns: 1fr 2fr;
}

.left,
.right {
    min-width: 0;
    height: 100%;
}

.add-task-layout {
    width: 60%;
    margin: auto;
}

@media screen and (max-width: 1200px) {
    .layout {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    
    .layout.expanded {
        grid-template-columns: 1fr;
    }
}
</style>
