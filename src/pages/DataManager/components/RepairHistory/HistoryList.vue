<template>
  <div class="history-list-container">
    <el-card class="card" shadow="never">
      <DataManagerHeader title="执行历史" />
      <div class="content">
        <el-table
          v-loading="historyLoading"
          :data="filteredHistoryList"
          style="width: 100%"
          empty-text="暂无历史记录"
          max-height="500px"
          size="small"
          :border="false"
          :row-class-name="tableRowClassName"
          highlight-current-row
        >
          <el-table-column
            prop="submitTime"
            label="提交时间"
            min-width="140"
            align="center"
          >
            <template #default="scope">
              <span class="time">{{ scope.row.submitTime }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="userInfo"
            label="提交人"
            min-width="120"
            align="center"
          >
            <template #default="scope">
              <div class="user-info">
                <el-avatar 
                  v-if="scope.row.userInfo?.avatar" 
                  :src="scope.row.userInfo.avatar" 
                  :size="24"
                  class="user-avatar"
                />
                <el-avatar 
                  v-else
                  :size="24"
                  class="user-avatar"
                >
                  {{ (scope.row.userInfo?.name || '未知')[0] }}
                </el-avatar>
                <span class="user-name">{{ scope.row.userInfo?.name || '未知用户' }}</span>
              </div>
            </template>
          </el-table-column>
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
                effect="light"
                class="tag"
              >
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="80"
            align="center"
            fixed="right"
          >
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                link
                class="action"
                @click="showDetails(scope.row)"
              >详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="footer">
        <el-pagination
          @current-change="handlePageChange"
          :current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          layout="total, prev, pager, next"
          :total="totalCount"
          size="small"
          background
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import apiService from '@/services/api.service';
import { ElMessage } from 'element-plus';
import DataManagerHeader from '../Header.vue';

export default {
  name: 'HistoryList',
  components: {
    DataManagerHeader
  },
  props: {
    // 接收新添加的历史记录项
    newHistoryItem: {
      type: Object,
      default: null
    },
    // 当前任务的task_key
    currentTaskKey: {
      type: String,
      default: ''
    }
  },
  emits: ['show-details', 'task-executed', 'refresh-history'],
  data() {
    return {
      historyList: [],
      historyLoading: false,
      lastLoadedTaskKey: '', // 记录上次加载的taskKey，避免重复加载
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      }
    }
  },
  computed: {
    // 分页后的历史记录列表
    filteredHistoryList() {
      const start = (this.pagination.currentPage - 1) * this.pagination.pageSize;
      const end = start + this.pagination.pageSize;
      return this.historyList.slice(start, end);
    },
    // 总记录数
    totalCount() {
      return this.historyList.length;
    }
  },
  watch: {
    // 监听新添加的历史记录项
    newHistoryItem: {
      handler(newItem, oldItem) {
        if (newItem && newItem !== oldItem) {
          // 检查是否已存在相同ID的记录，避免重复添加
          const existingIndex = this.historyList.findIndex(item => item.id === newItem.id);
          if (existingIndex === -1) {
            // 添加到历史列表顶部
            this.historyList.unshift(newItem);
          }
        }
      },
      deep: false
    },
    // 监听currentTaskKey变化，重新加载历史记录
    currentTaskKey: {
      handler(newTaskKey, oldTaskKey) {
        if (newTaskKey !== oldTaskKey) {
          if (newTaskKey) {
            this.pagination.currentPage = 1;
            this.loadHistory();
          } else {
            this.historyList = [];
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    // 设置表格行的类名
    tableRowClassName({ row }) {
      // 为成功、处理中和失败状态设置不同的类名
      if (row.status === 'finished') {
        return 'success-row';
      } else if (row.status === 'executing' || row.status === 'waiting_for_execute') {
        return 'pending-row';
      } else if (row.status === 'failed') {
        return 'failed-row';
      }
      return '';
    },
    
    // 处理分页变化
    handlePageChange(page) {
      this.pagination.currentPage = page;
    },
    
    // 加载历史记录
    async loadHistory(forceReload = false) {
      if (!this.currentTaskKey) {
        this.historyList = [];
        this.lastLoadedTaskKey = '';
        return;
      }
      
      // 防止重复加载相同的taskKey（除非强制重新加载）
      if (!forceReload && (this.historyLoading || this.lastLoadedTaskKey === this.currentTaskKey)) {
        return;
      }
      
      // 显示加载状态
      this.historyLoading = true;
      
      try {
        const response = await apiService.request('listRepairTaskHistory', {
          task_key: this.currentTaskKey
        });
        
        // 转换数据格式
        const newHistoryList = (response.base_info_list || []).map(item => this.transformHistoryItem(item));
        
        // 使用Vue.set或者直接赋值来避免响应式问题
        this.historyList = newHistoryList;
        this.lastLoadedTaskKey = this.currentTaskKey;
        
      } catch (error) {
        console.error('获取历史记录失败:', error);
        ElMessage.error('获取历史记录失败，请稍后重试');
        this.historyList = [];
        this.lastLoadedTaskKey = '';
      } finally {
        this.historyLoading = false;
      }
    },
    
    // 转换历史记录数据格式
    transformHistoryItem(item) {
      return {
        id: String(item.task_id), // 确保task_id是字符串类型
        taskKey: item.task_key,
        submitTime: this.formatTimestamp(item.created_timestamp),
        approvedTime: item.approved_timestamp ? this.formatTimestamp(item.approved_timestamp) : null,
        executeTime: item.execute_timestamp ? this.formatTimestamp(item.execute_timestamp) : null,
        finishedTime: item.finished_timestamp ? this.formatTimestamp(item.finished_timestamp) : null,
        status: this.transformStatus(item.status),
        userInfo: item.created_user ? {
          name: item.created_user.name || item.created_user.email || '未知用户',
          email: item.created_user.email || '',
          avatar: item.created_user.avatar || ''
        } : null,
        approvedUser: item.approved_user ? {
          name: item.approved_user.name || item.approved_user.email || '未知用户',
          email: item.approved_user.email || '',
          avatar: item.approved_user.avatar || ''
        } : null,
        isNeedApproval: item.is_need_approval || false,
        isAsyncTask: item.is_async_task || false,
        clusters: item.clusters || [],
        // 保留原始数据用于详情显示
        rawData: item
      };
    },
    
    // 格式化时间戳
    formatTimestamp(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp * 1000); // 假设是秒级时间戳
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    
    // 转换状态
    transformStatus(status) {
      // 根据新的proto定义，状态包括：
      // creating: 创建中, waiting_for_approval: 等待审批, waiting_for_execute: 等待执行
      // executing: 执行中, finished: 已完成, failed: 失败
      return status;
    },
    
    // 显示详情
    showDetails(row) {
      this.$emit('show-details', row);
    },
    
    // 获取状态标签类型
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
    
    // 获取状态文本
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
    },
    
    // 外部调用刷新历史记录的方法
    async refreshHistory() {
      this.pagination.currentPage = 1;
      this.lastLoadedTaskKey = ''; // 重置，强制重新加载
      await this.loadHistory(true);
    }
  }
}
</script>

<style scoped>
.history-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  margin: 0;
}

.card, .card :deep(.el-card__body) {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: none;
  margin: 0;
  padding: 0;
}

.content {
  flex: 1;
  padding: 12px;
  background-color: #fff;
  overflow: hidden;
}

.footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  padding: 0 12px 12px;
  border-top: none;
}

/* 表格样式 */
:deep(.el-table) {
  font-size: 13px;
  border-radius: 4px;
  overflow: hidden;
  background-color: transparent;
  width: 100% !important;
}

:deep(.el-table__inner-wrapper) {
  height: 100%;
  padding: 0;
  margin: 0;
}

:deep(.el-table::before) {
  display: none;
}

:deep(.el-table__header-wrapper) {
  background-color: #f9fafc;
  border-radius: 4px 4px 0 0;
}

:deep(.el-table__header) {
  border-bottom: 1px solid #ebeef5 !important;
  width: 100% !important;
  table-layout: fixed;
}

:deep(.el-table__body) {
  width: 100% !important;
  table-layout: fixed;
}

:deep(.el-table th) {
  background-color: #f9fafc !important;
  color: #606266;
  font-weight: 600;
  height: 40px;
  border: none;
  text-align: center;
}

:deep(.el-table td) {
  padding: 8px 0;
  border: none;
  text-align: center;
}

:deep(.el-table tr) {
  background-color: transparent !important;
  border-bottom: 1px solid #f0f2f5;
}

:deep(.el-table tr:last-child) {
  border-bottom: none;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: #f2f8ff !important;
}

/* 卡片内容区域 */
:deep(.el-card__body) {
  padding: 0 !important;
  margin: 0 !important;
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.el-card__header) {
  padding: 0 !important;
  margin: 0 !important;
  border-bottom: none !important;
}

/* 状态行样式 */
:deep(.success-row) {
  background-color: #f0fdf4 !important;
}

:deep(.pending-row) {
  background-color: #fffbeb !important;
}

:deep(.failed-row) {
  background-color: #fef2f2 !important;
}

/* 标签样式 */
.tag {
  font-weight: 500;
  padding: 0 10px;
  min-width: 60px;
}

/* 时间列样式 */
.time {
  font-family: 'Courier New', monospace;
  color: #606266;
  letter-spacing: 0.5px;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  flex-shrink: 0;
}

.user-name {
  font-weight: 500;
  color: #606266;
}

/* 操作按钮样式 */
.action {
  font-weight: 500;
}

:deep(.el-table__empty-text) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #909399;
}

:deep(.el-table__empty-text)::before {
  content: "";
  display: block;
  width: 60px;
  height: 60px;
  margin-bottom: 16px;
  background-image: url('data:image/svg+xml;utf8,<svg t="1618828039468" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1334" width="128" height="128"><path d="M855.7 622.7c0-15.4-6.7-29-17.6-39.9l-51.7-52.6 51.7-52.6c10.9-10.9 17.6-24.5 17.6-39.9 0-29-22.1-52.1-51.2-52.1H549.2V140.2c0-29-23.1-53.1-54-53.1H360.8c-29 0-53.1 24-53.1 53.1v245.4H159.5c-29 0-55 23.1-55 52.1 0 15.4 6.7 29 17.6 39.9l55.8 52.6-55.8 52.6c-10.9 10.9-17.6 24.5-17.6 39.9 0 29 26 54 55 54h148.2v245.4c0 29 24 54 53.1 54h134.4c30.8 0 54-25 54-54V677.6h255.3c29.1 0 51.2-24.9 51.2-54.9z" fill="%23e1e2e3" p-id="1335"></path></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.6;
}

:deep(.el-pagination.is-background .el-pager li:not(.disabled).active) {
  background-color: #409EFF;
  color: #fff;
}

/* 响应式调整 */
@media screen and (max-width: 1200px) {
  .history-list-container {
    height: auto;
    min-height: 300px;
  }
}
</style> 