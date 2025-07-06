<template>
    <div class="history-container">
        <el-card class="history-card" shadow="never">
            <template #header>
                <div class="card-header">
                    <h3>执行历史</h3>
                    <el-button 
                        type="primary" 
                        size="small" 
                        @click="refreshHistory"
                        :loading="loading"
                    >
                        刷新
                    </el-button>
                </div>
            </template>
            
            <div class="history-content">
                <el-table
                    v-loading="loading"
                    :data="paginatedHistoryList"
                    style="width: 100%"
                    empty-text="暂无历史记录"
                    size="small"
                    @row-click="showDetails"
                >
                    <el-table-column
                        prop="submitTime"
                        label="提交时间"
                        width="140"
                        align="center"
                    />
                    <el-table-column
                        prop="userInfo.name"
                        label="提交人"
                        width="100"
                        align="center"
                    />
                    <el-table-column
                        prop="status"
                        label="状态"
                        width="80"
                        align="center"
                    >
                        <template #default="scope">
                            <el-tag
                                :type="getStatusTagType(scope.row.status)"
                                size="small"
                            >
                                {{ getStatusText(scope.row.status) }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column
                        label="操作"
                        width="80"
                        align="center"
                    >
                        <template #default="scope">
                            <el-button
                                size="small"
                                type="primary"
                                link
                                @click.stop="showDetails(scope.row)"
                            >
                                详情
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
                
                <!-- 分页 -->
                <div class="pagination-wrapper">
                    <el-pagination
                        @current-change="handlePageChange"
                        :current-page="pagination.currentPage"
                        :page-size="pagination.pageSize"
                        layout="total, prev, pager, next"
                        :total="historyList.length"
                        size="small"
                        background
                    />
                </div>
            </div>
        </el-card>
        
        <!-- 详情弹窗 -->
        <el-dialog
            v-model="detailDialogVisible"
            title="任务执行详情"
            width="70%"
            :before-close="handleDetailClose"
        >
            <div v-if="selectedTask" class="detail-content">
                <!-- 基本信息 -->
                <el-descriptions title="基本信息" :column="2" border>
                    <el-descriptions-item label="任务ID">{{ selectedTask.id }}</el-descriptions-item>
                    <el-descriptions-item label="任务Key">{{ selectedTask.taskKey }}</el-descriptions-item>
                    <el-descriptions-item label="状态">
                        <el-tag :type="getStatusTagType(selectedTask.status)" size="small">
                            {{ getStatusText(selectedTask.status) }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="提交时间">{{ selectedTask.submitTime }}</el-descriptions-item>
                </el-descriptions>
                
                <!-- 表单数据 -->
                <div class="form-data-section">
                    <h4>提交的表单数据</h4>
                    <el-table :data="formDataList" border size="small">
                        <el-table-column prop="key" label="字段名" width="150" />
                        <el-table-column prop="value" label="值" />
                    </el-table>
                </div>
            </div>
            
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="detailDialogVisible = false">关闭</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import apiService from '@/services/api.service.js';
import { ElMessage } from 'element-plus';

export default {
    name: 'History',
    props: {
        currentTaskKey: {
            type: String,
            default: ''
        },
        newHistoryItem: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            historyList: [],
            loading: false,
            detailDialogVisible: false,
            selectedTask: null,
            pagination: {
                currentPage: 1,
                pageSize: 10
            }
        }
    },
    computed: {
        paginatedHistoryList() {
            const start = (this.pagination.currentPage - 1) * this.pagination.pageSize;
            const end = start + this.pagination.pageSize;
            return this.historyList.slice(start, end);
        },
        
        formDataList() {
            if (!this.selectedTask?.formValues) return [];
            
            return Object.entries(this.selectedTask.formValues).map(([key, value]) => ({
                key,
                value: Array.isArray(value) ? value.join(', ') : String(value)
            }));
        }
    },
    watch: {
        currentTaskKey: {
            handler(newTaskKey) {
                if (newTaskKey) {
                    this.loadHistory();
                } else {
                    this.historyList = [];
                }
            },
            immediate: true
        },
        
        newHistoryItem: {
            handler(newItem) {
                if (newItem) {
                    // 添加到历史列表顶部
                    this.historyList.unshift(newItem);
                }
            }
        }
    },
    methods: {
        async loadHistory() {
            if (!this.currentTaskKey) return;
            
            this.loading = true;
            
            try {
                const response = await apiService.request('listRepairTaskHistory', {
                    task_key: this.currentTaskKey
                });
                
                // 转换数据格式
                this.historyList = (response.base_info_list || []).map(item => ({
                    id: item.task_id,
                    taskKey: item.task_key,
                    submitTime: this.formatTimestamp(item.created_timestamp),
                    status: item.status,
                    userInfo: item.created_user || { name: '未知用户' },
                    formValues: {}
                }));
                
            } catch (error) {
                console.error('获取历史记录失败:', error);
                ElMessage.error('获取历史记录失败');
            } finally {
                this.loading = false;
            }
        },
        
        async refreshHistory() {
            await this.loadHistory();
            ElMessage.success('刷新成功');
        },
        
        showDetails(row) {
            this.selectedTask = row;
            this.detailDialogVisible = true;
        },
        
        handleDetailClose() {
            this.detailDialogVisible = false;
            this.selectedTask = null;
        },
        
        handlePageChange(page) {
            this.pagination.currentPage = page;
        },
        
        formatTimestamp(timestamp) {
            if (!timestamp) return '';
            const date = new Date(timestamp * 1000);
            return date.toLocaleString('zh-CN');
        },
        
        getStatusTagType(status) {
            const statusMap = {
                'creating': 'info',
                'waiting_for_approval': 'warning',
                'waiting_for_execute': 'primary',
                'executing': 'warning',
                'finished': 'success',
                'failed': 'danger'
            };
            return statusMap[status] || 'info';
        },
        
        getStatusText(status) {
            const statusMap = {
                'creating': '创建中',
                'waiting_for_approval': '等待审批',
                'waiting_for_execute': '等待执行',
                'executing': '执行中',
                'finished': '已完成',
                'failed': '失败'
            };
            return statusMap[status] || status;
        }
    }
}
</script>

<style scoped>
.history-container {
    height: 100%;
}

.history-card {
    height: 100%;
    display: flex;
    flex-direction: column;
}

:deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 16px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-header h3 {
    margin: 0;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
}

.history-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;
}

.detail-content {
    max-height: 60vh;
    overflow-y: auto;
}

.form-data-section {
    margin-top: 20px;
}

.form-data-section h4 {
    margin: 0 0 12px 0;
    color: #303133;
    font-size: 14px;
    font-weight: 600;
}

/* 表格样式 */
:deep(.el-table) {
    flex: 1;
}

:deep(.el-table .el-table__row) {
    cursor: pointer;
}

:deep(.el-table .el-table__row:hover) {
    background-color: #f5f7fa;
}

/* 滚动条样式 */
.detail-content::-webkit-scrollbar {
    width: 6px;
}

.detail-content::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 3px;
}

.detail-content::-webkit-scrollbar-track {
    background: transparent;
}
</style>