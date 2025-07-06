<template>
  <div class="repair-history-container">
    <!-- 历史记录列表 -->
    <HistoryList
      ref="historyListRef"
      :newHistoryItem="newHistoryItem"
      :currentTaskKey="currentTaskKey"
      @show-details="handleShowDetails"
      @task-executed="handleTaskExecuted"
    />
    
    <!-- 详情弹窗 -->
    <HistoryDetail
      v-model:visible="detailDialogVisible"
      :taskRow="selectedTaskRow"
      @task-executed="handleTaskExecuted"
      @refresh-history="refreshHistory"
    />
  </div>
</template>

<script>
import HistoryDetail from './HistoryDetail.vue';
import HistoryList from './HistoryList.vue';

export default {
  name: 'RepairHistory',
  components: {
    HistoryList,
    HistoryDetail
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
  emits: ['task-executed'],
  data() {
    return {
      detailDialogVisible: false,
      selectedTaskRow: null
    }
  },
  methods: {
    // 显示详情弹窗
    handleShowDetails(row) {
      this.selectedTaskRow = row;
      this.detailDialogVisible = true;
    },
    
    // 处理任务执行后的事件
    handleTaskExecuted() {
      // 刷新历史记录列表
      if (this.$refs.historyListRef) {
        this.$refs.historyListRef.refreshHistory();
      }
      // 向上传递事件
      this.$emit('task-executed');
    },
    
    // 外部调用刷新历史记录的方法
    async refreshHistory() {
      if (this.$refs.historyListRef) {
        await this.$refs.historyListRef.refreshHistory();
      }
    },
  }
}
</script>

<style scoped>
.repair-history-container {
  height: 100%;
  width: 100%;
}
</style> 