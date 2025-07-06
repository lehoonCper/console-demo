<template>
<div class="wc-container">
    <div class="loading-overlay" v-if="isFirstLoading">
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-text">加载中...</div>
        </div>
    </div>

    <h2 class="wc-title">
        卫生间使用状态
        <div class="powered-by">Powered by Cursor | Model: claude-3.5-sonnet</div>
        <br>
        <div class="refresh-info">
            <span class="last-update">上次更新: {{ formatTime(lastUpdateTime) }}</span>
            <span class="next-update">
                <span class="refresh-loading" v-if="isRefreshing"></span>
                {{ countdown }}秒后更新
            </span>
        </div>
        <div class="notice-info">传感器采集时间间隔较大，数据仅供参考</div>
    </h2>

    <div class="wc-section" :class="{ 'refreshing': isRefreshing }">
        <!-- 女卫生间区域 -->
        <div class="wc-area female">
            <div style=" text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px;">
                <span class="icon">👩</span>
                女卫生间
            </div>
            <div class="room-grid">
                <div v-for="toilet in toilets.female" :key="toilet.room" class="room-item" :class="[
              toilet.status === 'available' ? 'status-available' : 
              toilet.status === 'unavailable' ? 'status-unavailable' : 
              'status-unknown'
            ]">
                    <div class="room-number">{{ toilet.room }}号</div>
                    <div class="room-status">
                        <span class="status-dot"></span>
                        {{ getStatusText(toilet.status) }}
                    </div>
                    <div class="duration-wrapper" v-if="toilet.status === 'unavailable'">
                        <div class="duration">
                            <i class="duration-icon">⏱</i>
                            <span>{{ formatDuration(toilet.duration) }}</span>

                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 男卫生间区域 -->
        <div class="wc-area male">
            <div style=" text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px;">
                <span class="icon">👨</span>
                男卫生间
            </div>

            <div class="room-grid">
                <div v-for="toilet in toilets.male" :key="toilet.room" class="room-item" :class="getStatusClass(toilet.status)">
                    <div class="room-number">{{ toilet.room }}号</div>
                    <div class="room-status">
                        <span class="status-dot"></span>
                        {{ getStatusText(toilet.status) }}
                    </div>
                    <div class="duration-wrapper" v-if="toilet.status === 'unavailable' || toilet.status === ''">
                        <div class="duration">
                            <i class="duration-icon">⏱</i>
                            <span>{{ formatDuration(toilet.duration) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import axios from 'axios';
import {
    ElMessage
} from 'element-plus';
import 'element-plus/dist/index.css';
import {
    onMounted,
    onUnmounted,
    ref
} from 'vue';

export default {
    name: 'WC',
    setup() {
        const toilets = ref({
            female: [],
            male: []
        })
        const lastUpdateTime = ref(null)
        const countdown = ref(9)
        const isFirstLoading = ref(true)
        const isRefreshing = ref(false)

        const REFRESH_INTERVAL = 10 // 10秒刷新一次

        // 获取卫生间状态数据
        const fetchToiletStatus = async () => {
            if (!isFirstLoading.value) {
                isRefreshing.value = true
            }

            try {
                const response = await axios.get('https://washroom.dev.longbridge-inc.com/status')
                toilets.value = response.data.toilets || {
                    female: [],
                    male: []
                }
                lastUpdateTime.value = new Date()
                countdown.value = REFRESH_INTERVAL
            } catch (error) {
                ElMessage.error('获取卫生间状态失败: ' + (error.message || '未知错误'))
            } finally {
                isFirstLoading.value = false
                isRefreshing.value = false
            }
        }

        // 更新倒计时
        const updateCountdown = () => {
            if (countdown.value > 0) {
                countdown.value--
            }
        }

        // 格式化时间
        const formatTime = (time) => {
            if (!time) return '--:--'
            const date = new Date(time)
            return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
        }

        // 格式化持续时间
        const formatDuration = (seconds) => {
            if (seconds === 0) return '未知'
            const minutes = Math.floor(seconds / 60)
            const remainingSeconds = seconds % 60
            if (minutes === 0) return `${remainingSeconds}秒`
            if (remainingSeconds === 0) return `${minutes}分钟`
            return `${minutes}分${remainingSeconds}秒`
        }

        // 获取状态文本
        const getStatusText = (status) => {
            const statusMap = {
                'available': '空闲',
                'unavailable': '使用中',
            }
            return statusMap[status] || '传感器状态异常'
        }

        // 获取状态对应的样式类
        const getStatusClass = (status) => {
            return {
                'status-available': status === 'available',
                'status-unavailable': status === 'unavailable',
                'status-unknown': status === 'unknown'
            }
        }

        onMounted(() => {
            fetchToiletStatus()

            // 设置数据刷新定时器 (10秒)
            const refreshTimer = setInterval(fetchToiletStatus, REFRESH_INTERVAL * 1000)
            // 设置倒计时定时器 (1秒)
            const countdownTimer = setInterval(updateCountdown, 1000)

            onUnmounted(() => {
                clearInterval(refreshTimer)
                clearInterval(countdownTimer)
            })
        })

        return {
            toilets,
            lastUpdateTime,
            countdown,
            isFirstLoading,
            isRefreshing,
            formatTime,
            formatDuration,
            getStatusText,
            getStatusClass
        }
    }
}
</script>

<style scoped>
.wc-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.wc-title {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
}

.wc-section {
    display: flex;
    gap: 30px;
    justify-content: center;
    transition: opacity 0.2s ease;
}

.wc-section.refreshing {
    opacity: 0.6;
}

.wc-area {
    flex: 1;
    max-width: 500px;
    padding: 20px;
    border-radius: 12px;
    background-color: #f5f5f5;
    user-select: none;
    background-image: linear-gradient(45deg,
            rgba(255, 255, 255, 0.3) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0.3) 75%,
            transparent 75%,
            transparent);
    background-size: 50px 50px;
}

.female {
    background-color: #f8e9fa;
}

.male {
    background-color: #cbe0f1;
}

.wc-area h3 {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.icon {
    font-size: 24px;
}

.room-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
}

.room-item {
    padding: 14px;
    border-radius: 8px;
    text-align: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 90px;
    cursor: pointer;
}

.room-number {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 2px;
    text-align: center;
}

.room-status {
    font-size: 15px;
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
}

.duration-wrapper {
    margin-top: 8px;
}

.duration {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background-color: rgba(255, 255, 255, 0.2);
}

.duration-icon {
    font-style: normal;
    font-size: 14px;
}

/* 状态样式更新 */
.status-available {
    background: linear-gradient(145deg, #52c41a, #49ad18);
}

.status-unavailable {
    background: linear-gradient(145deg, #ff4d4f, #f5222d);
}

.status-unknown {
    background: linear-gradient(145deg, #d9d9d9, #bfbfbf);
}

/* 响应式调整 */
@media (max-width: 768px) {
    .room-item {
        min-height: 80px;
        padding: 10px;
    }

    .room-number {
        font-size: 16px;
    }

    .room-status {
        font-size: 12px;
    }

    .duration {
        font-size: 11px;
        padding: 2px 6px;
    }

    .room-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 8px;
    }
}

.refresh-info {
    font-size: 14px;
    color: #666;
    font-weight: normal;
    margin-top: 8px;
    display: flex;
    justify-content: center;
    gap: 16px;
}

.last-update,
.next-update {
    background-color: #f0f2f5;
    padding: 4px 12px;
    border-radius: 12px;
}

.next-update {
    color: #1890ff;
    font-weight: 500;
}

@media (max-width: 768px) {
    .refresh-info {
        flex-direction: column;
        gap: 8px;
        align-items: center;
    }
}

.powered-by {
    font-size: 12px;
    color: #8c8c8c;
    font-weight: normal;
    margin-top: 4px;
    font-style: italic;
    letter-spacing: 0.5px;
    opacity: 0.8;
}

@media (max-width: 768px) {
    .powered-by {
        font-size: 11px;
    }
}

/* 确保 Element Plus 的消息提示在最上层 */
.el-message {
    z-index: 9999 !important;
}

.notice-info {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
    font-style: italic;
}

.info-icon {
    font-style: normal;
    font-size: 14px;
    opacity: 0.8;
    cursor: help;
}

.info-icon:hover {
    opacity: 1;
}

/* 确保tooltip在最上层 */
:deep(.el-tooltip__popper) {
    z-index: 9999;
}

@media (max-width: 768px) {
    .notice-info {
        font-size: 11px;
        padding: 0 15px;
        text-align: center;
    }
}

.notify-button {
    margin-top: 4px;
}

/* Loading 样式 */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
}

.loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #1890ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loading-text {
    color: #1890ff;
    font-size: 16px;
    font-weight: 500;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* 刷新时的loading效果 */
.refresh-loading {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid #1890ff;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 6px;
    vertical-align: middle;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .refresh-loading {
        width: 10px;
        height: 10px;
        border-width: 1.5px;
        margin-right: 4px;
    }
}
</style>
