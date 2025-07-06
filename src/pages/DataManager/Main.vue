<template>
    <!-- 主容器 -->
    <div class="data-manager-main-container">
        <!-- 顶部导航栏 -->
        <div class="header">
            <CommonHeader />
        </div>
        <!-- 主体内容区域 -->
        <div class="content">
            <!-- 左侧菜单 -->
            <div class="left">
                <LeftMenu 
                    :menuItems="menuItems" 
                    :activeIndex="currentPath"
                    @select="handleMenuSelect" 
                    @add-task="handleAddTask"
                />
            </div>
            <!-- 右侧内容区 -->
            <div class="right">
                <!-- 添加/编辑任务界面 -->
                <div v-if="showAddTask" class="add-task-layout">
                    <AddTask 
                        :current-category="addTaskData?.categoryKey || ''"
                        :is-new-category="addTaskData?.isNewCategory || false"
                        :category-info="addTaskData?.categoryInfo || null"
                        :edit-task-data="addTaskData?.taskData || null"
                        @task-added="handleTaskUpdated" 
                        @cancel-edit="handleCloseAddTask" 
                    />
                </div>
                
                <!-- 任务管理界面 -->
                <RepairData 
                    v-else-if="isTaskRoute"
                    :currentTaskKey="currentTaskKey"
                    :showAddTask="false"
                    :addTaskData="null"
                    @edit-task="handleEditTask"
                    @task-updated="handleTaskUpdated"
                />
                
                <!-- 其他页面（看板、统计等） -->
                <div v-else class="page-placeholder">
                    <el-empty :description="getPageDescription()" />
                </div>
            </div>  
        </div>
    </div>
</template>

<script>
import CommonHeader from '@/global_components/CommonHeader.vue'
import apiService from '@/services/api.service'
import AddTask from './components/AddTask.vue'
import LeftMenu from './components/LeftMenu.vue'
import RepairData from './RepairData.vue'

export default {
    name: 'DataManagerMain',
    components: {
        CommonHeader,
        LeftMenu,
        RepairData,
        AddTask
    },
    data() {
        return {
            menuItems: [],
            currentPath: '',
            showAddTask: false,
            addTaskData: null
        }
    },
    computed: {
        // 判断是否是任务相关路由
        isTaskRoute() {
            return this.currentPath.includes('/data-manager/') && 
                   !this.currentPath.includes('/data-manager/s/');
        },
        
        // 提取当前任务key
        currentTaskKey() {
            if (!this.isTaskRoute) return '';
            const pathParts = this.currentPath.split('/');
            return pathParts[pathParts.length - 1] || '';
        }
    },
    methods: {
        async fetchMenuConfig() {
            try {
                const response = await apiService.request('getRepairTaskConfigs');
                this.menuItems = this.transformMenuData(response);
            } catch (error) {
                console.error('获取菜单配置失败:', error);
                this.menuItems = this.getDefaultMenuItems();
            }
        },
        
        transformMenuData(config) {
            const menuItems = this.getDefaultMenuItems();
            
            if (!config?.task_list?.length) {
                return menuItems;
            }

            // 按分类组织任务
            const categoryMap = new Map();
            
            config.task_list.forEach(task => {
                const { category_key, category_name } = task.base_config;
                
                if (!categoryMap.has(category_key)) {
                    categoryMap.set(category_key, {
                        index: `/data-manager/${category_key}`,
                        title: category_name,
                        icon: 'List',
                        key: category_key,
                        children: []
                    });
                }
                
                categoryMap.get(category_key).children.push({
                    index: `/data-manager/${category_key}/${task.base_config.task_key}`,
                    title: task.base_config.task_name,
                    icon: 'Document',
                    key: task.base_config.task_key
                });
            });

            menuItems.push(...Array.from(categoryMap.values()));
            return menuItems;
        },
        
        getDefaultMenuItems() {
            return [
                { index: '/data-manager/s/dashboard', title: '看板', icon: 'Money' },
                { index: '/data-manager/s/statistics', title: '数据统计', icon: 'PieChart' },
                { index: '/data-manager/s/sync', title: '数据同步', icon: 'Refresh' }
            ];
        },
        
        handleMenuSelect(index) {
            this.currentPath = index;
            this.showAddTask = false;
            
            // 更新路由
            if (this.$route.path !== index) {
                this.$router.replace(index).catch(err => {
                    if (err.name !== 'NavigationDuplicated') {
                        console.error('路由更新失败:', err);
                    }
                });
            }
        },
        
        handleAddTask(data) {
            this.showAddTask = true;
            this.addTaskData = {
                categoryKey: data.categoryKey,
                isNewCategory: data.isNewCategory,
                categoryInfo: data.categoryInfo,
                taskData: null
            };
        },
        
        handleCloseAddTask() {
            this.showAddTask = false;
            this.addTaskData = null;
        },
        
        handleEditTask(data) {
            // 编辑任务：打开AddTask组件并传递任务数据
            this.showAddTask = true;
            this.addTaskData = {
                categoryKey: null,
                isNewCategory: false,
                taskData: data.taskData
            };
        },
        
        handleTaskUpdated() {
            // 任务更新后刷新菜单配置
            this.fetchMenuConfig();
            this.handleCloseAddTask();
        },
        
        getPageDescription() {
            const pageMap = {
                'dashboard': '看板功能开发中...',
                'statistics': '数据统计功能开发中...',
                'sync': '数据同步功能开发中...'
            };
            
            const pageName = this.currentPath.split('/').pop();
            return pageMap[pageName] || '页面开发中...';
        }
    },
    
    async created() {
        await this.fetchMenuConfig();
        this.currentPath = this.$route.path;
    },
    
    watch: {
        '$route.path': {
            handler(newPath) {
                this.currentPath = newPath;
            },
            immediate: true
        }
    }
}
</script>

<style scoped>
.data-manager-main-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.header {
    width: 100%;
    flex-shrink: 0;
}

.content {
    display: flex;
    flex-direction: row;
    height: calc(100% - 60px);
    overflow: hidden;
}   

.left {
    width: 20%;
    flex-shrink: 0;
    border-right: 1px solid #e8edf2;
    height: 100%;
    overflow: hidden;
}

.right {
    flex: 1;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: #f0f2f5;
}

.page-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background-color: #fff;
    margin: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.add-task-layout {
    padding: 20px;
}
</style>