<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleClose"
    title="任务执行详情"
    width="80%"
    :before-close="handleClose"
    center
  >
    <div v-loading="detailLoading" class="detail-content">
      <div v-if="taskDetail">
        <!-- 基本信息 -->
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="任务ID">{{ taskDetail.base_info?.task_id }}</el-descriptions-item>
          <el-descriptions-item label="任务Key">{{ taskDetail.base_info?.task_key }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <div class="status-container">
              <el-tag
                :type="getStatusTagType(taskDetail.base_info?.status)"
                size="small"
              >
                {{ getStatusText(taskDetail.base_info?.status) }}
              </el-tag>
              <el-button
                v-if="taskDetail.base_info?.status === 'waiting_for_execute'"
                type="primary"
                size="small"
                :loading="executeLoading"
                @click="executeTask"
                class="ml-2"
              >
                执行
              </el-button>
              <el-button
                v-if="taskDetail.base_info?.status === 'failed'"
                type="warning"
                size="small"
                :loading="retryLoading"
                @click="retryTask"
                class="ml-2"
              >
                重试
              </el-button>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="是否需要审批">
            {{ taskDetail.base_info?.is_need_approval ? '是' : '否' }}
          </el-descriptions-item>
          <el-descriptions-item label="是否异步任务">
            {{ taskDetail.base_info?.is_async_task ? '是' : '否' }}
          </el-descriptions-item>
          <el-descriptions-item label="执行集群">
            <div class="cluster-list">
              <el-tag 
                v-for="cluster in taskDetail.base_info?.clusters" 
                :key="cluster"
                size="small"
                type="info"
                class="cluster-tag"
              >
                {{ cluster }}
              </el-tag>
            </div>
          </el-descriptions-item>
        </el-descriptions>
        
        <!-- 集群执行详情 -->
        <div v-if="taskDetail.base_info?.clusters && taskDetail.base_info.clusters.length > 0" class="mt-4">
          <h3 class="text-lg font-semibold mb-2">集群执行详情</h3>
          <el-tabs v-model="activeClusterTab" type="card">
            <el-tab-pane 
              v-for="cluster in taskDetail.base_info.clusters" 
              :key="cluster"
              :label="`${cluster} (${getClusterPodCount(cluster)})`"
              :name="cluster"
            >
              <div v-if="taskDetail.results && taskDetail.results[cluster]" class="cluster-detail">
                <!-- 集群概览信息 -->
                <el-card class="cluster-summary mb-3" shadow="never">
                  <div class="summary-info">
                    <div class="info-item">
                      <span class="label">集群名称:</span>
                      <span class="value">{{ cluster }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">目标Pod数量:</span>
                      <span class="value">{{ getClusterPodTotalCount(cluster) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">执行成功:</span>
                      <span class="value success">{{ getSuccessCount(cluster) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">执行失败:</span>
                      <span class="value danger">{{ getFailedCount(cluster) }}</span>
                    </div>
                  </div>
                </el-card>
                
                <!-- 执行详情表格 -->
                <div>
                  <h4 class="subtitle">执行详情</h4>
                  <el-table 
                    :data="getPodExecuteList(cluster)"
                    border
                    size="small"
                  >
                    <el-table-column type="index" label="序号" width="60" align="center" />
                    <el-table-column prop="pod_name" label="Pod名称" min-width="180" />
                    <el-table-column prop="code" label="状态码" width="100" align="center">
                      <template #default="scope">
                        <el-tag 
                          :type="getCodeTagType(scope.row.code)"
                          size="small"
                        >
                          {{ scope.row.code }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="message" label="执行消息" min-width="300" />
                  </el-table>
                </div>
              </div>
              <el-empty v-else description="暂无执行记录" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import apiService from '@/services/api.service';
import { ElMessage } from 'element-plus';

export default {
  name: 'HistoryDetail',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    taskRow: {
      type: Object,
      default: null
    }
  },
  emits: ['update:visible', 'task-executed'],
  data() {
    return {
      detailLoading: false,
      taskDetail: null,
      activeClusterTab: '',
      executeLoading: false,
      retryLoading: false
    }
  },
  watch: {
    visible: {
      handler(newVal) {
        if (newVal && this.taskRow) {
          this.loadTaskDetail();
        } else if (!newVal) {
          this.taskDetail = null;
          this.activeClusterTab = '';
        }
      },
      immediate: true
    }
  },
  methods: {
    // 加载任务详情
    async loadTaskDetail() {
      if (!this.taskRow) return;
      
      this.detailLoading = true;
      
      try {
        const response = await apiService.request('getRepairTaskHistoryDetail', {
          task_key: this.taskRow.taskKey,
          task_id: String(this.taskRow.id)
        });
        
        this.taskDetail = response.history;
        
        // 设置默认的集群tab
        if (this.taskDetail?.base_info?.clusters && this.taskDetail.base_info.clusters.length > 0) {
          this.activeClusterTab = this.taskDetail.base_info.clusters[0];
        }
        
      } catch (error) {
        console.error('获取任务详情失败:', error);
        ElMessage.error('获取任务详情失败，请稍后重试');
        this.handleClose();
      } finally {
        this.detailLoading = false;
      }
    },
    
    // 关闭弹窗
    handleClose() {
      this.$emit('update:visible', false);
    },
    
    // 执行任务
    async executeTask() {
      if (!this.taskDetail?.base_info?.task_id) {
        ElMessage.error('任务信息不完整，无法执行');
        return;
      }
      
      this.executeLoading = true;
      
      try {
        await apiService.request('executeRepairTask', {
          task_id: this.taskDetail.base_info.task_id,
          task_key: this.taskDetail.base_info.task_key
        });
        
        ElMessage.success('任务执行成功');
        
        // 重新加载任务详情
        await this.loadTaskDetail();
        
        // 通知父组件任务已执行
        this.$emit('task-executed', this.taskDetail.base_info);
        
      } catch (error) {
        console.error('执行任务失败:', error);
        ElMessage.error('执行任务失败，请稍后重试');
      } finally {
        this.executeLoading = false;
      }

      //刷新历史记录列表
      this.$emit('refresh-history');
    },
    
    // 重试任务
    async retryTask() {
      if (!this.taskDetail?.base_info?.task_id) {
        ElMessage.error('任务信息不完整，无法重试');
        return;
      }
      
      this.retryLoading = true;
      
      try {
        await apiService.request('retryRepairTask', {
          task_id: this.taskDetail.base_info.task_id,
          task_key: this.taskDetail.base_info.task_key
        });
        
        ElMessage.success('任务重试成功');
        
        // 重新加载任务详情
        await this.loadTaskDetail();
        
        // 通知父组件任务已执行
        this.$emit('task-executed', this.taskDetail.base_info);
        
      } catch (error) {
        console.error('重试任务失败:', error);
        ElMessage.error('重试任务失败，请稍后重试');
      } finally {
        this.retryLoading = false;
      }
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
    
    // 获取集群的Pod数量统计
    getClusterPodCount(cluster) {
      if (!this.taskDetail?.results?.[cluster]?.pod_response) {
        return '0个Pod';
      }
      const count = Object.keys(this.taskDetail.results[cluster].pod_response).length;
      return `${count}个Pod`;
    },
    
    // 获取集群Pod总数量
    getClusterPodTotalCount(cluster) {
      if (!this.taskDetail?.results?.[cluster]?.pod_response) {
        return 0;
      }
      return Object.keys(this.taskDetail.results[cluster].pod_response).length;
    },
    
    // 获取集群执行成功的数量
    getSuccessCount(cluster) {
      if (!this.taskDetail?.results?.[cluster]?.pod_response) {
        return 0;
      }
      return Object.values(this.taskDetail.results[cluster].pod_response).filter(
        pod => pod.code === 200
      ).length;
    },
    
    // 获取集群执行失败的数量
    getFailedCount(cluster) {
      if (!this.taskDetail?.results?.[cluster]?.pod_response) {
        return 0;
      }
      return Object.values(this.taskDetail.results[cluster].pod_response).filter(
        pod => pod.code !== 200
      ).length;
    },
    
    // 获取Pod执行列表
    getPodExecuteList(cluster) {
      if (!this.taskDetail?.results?.[cluster]?.pod_response) {
        return [];
      }
      
      const podResponse = this.taskDetail.results[cluster].pod_response;
      return Object.keys(podResponse).map(podName => {
        const podResult = podResponse[podName];
        
        return {
          pod_name: podName,
          code: podResult.code || 0,
          message: podResult.message || ''
        };
      });
    },
    
    // 获取状态码标签类型
    getCodeTagType(code) {
      if (code === 200) {
        return 'success';
      } else if (code >= 400 && code < 500) {
        return 'warning';
      } else {
        return 'danger';
      }
    }
  }
}
</script>

<style scoped>
.detail-content {
  max-height: 70vh;
  overflow-y: auto;
}

.mt-4 {
  margin-top: 16px;
}

.ml-2 {
  margin-left: 8px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mb-3 {
  margin-bottom: 12px;
}

.text-lg {
  font-size: 18px;
}

.font-semibold {
  font-weight: 600;
}

.status-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cluster-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cluster-tag {
  margin: 0;
}

.cluster-detail {
  padding: 0;
}

.cluster-summary {
  background: linear-gradient(135deg, #f6f9ff 0%, #e8f4fd 100%);
  border: 1px solid #d4edda;
  border-radius: 8px;
}

.summary-info {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item .label {
  font-weight: 500;
  color: #606266;
  font-size: 13px;
}

.info-item .value {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.info-item .value.success {
  color: #67c23a;
}

.info-item .value.danger {
  color: #f56c6c;
}

.subtitle {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
  display: inline-block;
}
</style> 