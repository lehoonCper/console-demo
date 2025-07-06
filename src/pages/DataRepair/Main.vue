<template>
    <div class="data-repair-main-container">
        <!-- 顶部导航栏 -->
        <div class="header">
            <CommonHeader />
        </div>
        
        <!-- 主体内容区域 -->
        <div class="content">
            <!-- 左侧菜单 -->
            <div class="left-nav">
                <LeftNav 
                    :menuItems="menuItems" 
                    :activeIndex="currentPath"
                    :showAddButton="true"
                    @select="handleMenuSelect" 
                    @add-new="handleAddNew"
                />
            </div>
            
            <!-- 右侧内容区 -->
            <div class="right-content">
                <router-view 
                    :key="$route.fullPath"
                    :currentTaskKey="currentTaskKey"
                    :taskConfigs="taskConfigs"
                />
            </div>
        </div>
    </div>
</template>

<script>
import CommonHeader from '@/global_components/CommonHeader.vue';
import LeftNav from '@/global_components/LeftNav.vue';
import apiService from '@/services/api.service.js';
import { ElMessage } from 'element-plus';

export default {
    name: 'DataRepairMain',
    components: {
        CommonHeader,
        LeftNav
    },
    data() {
        return {
            menuItems: [],
            taskConfigs: [],
            currentPath: ''
        }
    },
    computed: {
        // 提取当前任务key
        currentTaskKey() {
            const pathParts = this.currentPath.split('/');
            return pathParts[pathParts.length - 1] || '';
        }
    },
    async created() {
        await this.fetchRepairTaskConfigs();
        this.currentPath = this.$route.path;
    },
    watch: {
        '$route.path': {
            handler(newPath) {
                this.currentPath = newPath;
            },
            immediate: true
        }
    },
    methods: {
        async fetchRepairTaskConfigs() {
            try {
                const response = await apiService.request('getRepairTaskConfigs');
                this.taskConfigs = response.task_list || [];
                this.menuItems = this.transformMenuData(response);
            } catch (error) {
                console.error('获取任务配置失败:', error);
                ElMessage.error('获取任务配置失败');
                this.menuItems = [];
            }
        },
        
        transformMenuData(config) {
            if (!config?.task_list?.length) {
                return [];
            }

            // 按分类组织任务
            const categoryMap = new Map();
            
            config.task_list.forEach(task => {
                const { category_key, category_name } = task.base_config;
                
                if (!categoryMap.has(category_key)) {
                    categoryMap.set(category_key, {
                        index: `/data-repair/${category_key}`,
                        title: category_name,
                        icon: 'Folder',
                        children: []
                    });
                }
                
                categoryMap.get(category_key).children.push({
                    index: `/data-repair/${category_key}/${task.base_config.task_key}`,
                    title: task.base_config.task_name,
                    icon: 'Document'
                });
            });

            return Array.from(categoryMap.values());
        },
        
        handleMenuSelect(index) {
            this.currentPath = index;
            
            // 更新路由
            if (this.$route.path !== index) {
                this.$router.push(index).catch(err => {
                    if (err.name !== 'NavigationDuplicated') {
                        console.error('路由更新失败:', err);
                    }
                });
            }
        },
        
        handleAddNew() {
            ElMessage.info('新增功能开发中...');
        }
    }
}
</script>

<style scoped>
.data-repair-main-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

.header {
    width: 100%;
    flex-shrink: 0;
}

.content {
    display: flex;
    flex-direction: row;
    height: calc(100vh - 60px);
    overflow: hidden;
}

.left-nav {
    width: 280px;
    flex-shrink: 0;
    border-right: 1px solid #e4e7ed;
    height: 100%;
    overflow-y: auto;
}

.right-content {
    flex: 1;
    height: 100%;
    overflow-y: auto;
    background-color: #f5f7fa;
}

/* 响应式设计 */
@media (max-width: 1024px) {
    .left-nav {
        width: 240px;
    }
}

@media (max-width: 768px) {
    .content {
        flex-direction: column;
    }
    
    .left-nav {
        width: 100%;
        height: 200px;
        border-right: none;
        border-bottom: 1px solid #e4e7ed;
    }
    
    .right-content {
        height: calc(100vh - 260px);
    }
}
</style>