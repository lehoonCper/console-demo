<template>
    <div class="header-container">
      <h2 class="title">{{ title }}</h2>
      <div class="header-buttons" v-if="computedButtons && computedButtons.length > 0">
        <button 
          v-for="(button, index) in computedButtons" 
          :key="`btn-${index}-${button.disabled}`"
          :class="['btn', button.type || 'primary', { 'disabled': button.disabled }]"
          @click="handleButtonClick(button)"
          :disabled="button.disabled"
        >
          <i v-if="button.icon" :class="button.icon"></i>
          {{ button.text }}
        </button>
      </div>
    </div>
  </template>

<script>
export default {
  name: 'DataManagerHeader',
    props: {
        title: {
            type: String,
            default: ''
        },
        buttons: {
            type: Array,
            default: () => []
            // 按钮格式: [{ text: '按钮文字', action: 'functionName', type: 'primary', icon: 'el-icon-plus', disabled: false }]
        }
    },
    computed: {
        // 确保按钮状态的响应性
        computedButtons() {
            return this.buttons.map(button => ({
                ...button,
                // 确保 disabled 属性是响应式的
                disabled: !!button.disabled
            }));
        }
    },
    watch: {
       
    },
    methods: {
        handleButtonClick(button) {
            if (button.disabled) {
                return;
            }
            
            // 触发父组件的事件，传递按钮的action和整个button对象
            this.$emit('button-click', button.action, button);
        }
    }
}
</script>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  margin: 0;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  position: relative;
  padding-left: 12px;
}

.title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 16px;
  width: 4px;
  background: linear-gradient(to bottom, #409EFF, #53a8ff);
  border-radius: 2px;
}

.header-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn {
  padding: 4px 10px;
  font-size: 11px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
}

.btn:hover:not(:disabled) {
  opacity: 0.8;
}

.btn:disabled,
.btn.disabled {
  cursor: not-allowed;
  opacity: 0.5;
  pointer-events: none;
  filter: grayscale(50%);
}

.btn:disabled:hover,
.btn.disabled:hover {
  opacity: 0.5;
  transform: none;
}

.btn.primary {
  background-color: #409EFF;
  color: white;
}

.btn.success {
  background-color: #67C23A;
  color: white;
}

.btn.warning {
  background-color: #E6A23C;
  color: white;
}

.btn.danger {
  background-color: #F56C6C;
  color: white;
}

.btn.info {
  background-color: #909399;
  color: white;
}

.btn.text {
  background-color: transparent;
  color: #409EFF;
  border: 1px solid #DCDFE6;
}

.btn.text:hover:not(:disabled) {
  color: #66b1ff;
  border-color: #66b1ff;
}
</style>