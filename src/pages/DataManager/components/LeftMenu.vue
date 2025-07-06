<template>
    <div class="left-menu-container">
        <el-menu
            class="menu"
            :collapse="isCollapse"
            @select="handleSelect"
            :default-openeds="openedMenus"
            :default-active="activeIndex"
        >
            <!-- 固定菜单项 -->
            <el-menu-item 
                v-for="item in fixedMenuItems" 
                :key="item.index"
                :index="item.index"
            >
                <el-icon v-if="item.icon">
                    <component :is="item.icon" />
                </el-icon>
                <template #title>{{ item.title }}</template>
            </el-menu-item>

            <!-- 添加任务选项（固定位置） -->
            <el-sub-menu index="add-task">
                <template #title>
                    <el-icon><Plus /></el-icon>
                    <span>添加任务</span>
                </template>
                <!-- 现有分类列表 -->
                <el-menu-item 
                    v-for="category in categoryMenuItems" 
                    :key="category.key"
                    :index="`add-task-${category.key}`"
                >
                    <el-icon><List /></el-icon>
                    <template #title>{{ category.title }}</template>
                </el-menu-item>
                <!-- 新增分类选项 -->
                <el-menu-item index="add-task-new">
                    <el-icon><Plus /></el-icon>
                    <template #title>新增分类</template>
                </el-menu-item>
            </el-sub-menu>

            <!-- 动态分类菜单 -->
            <el-sub-menu 
                v-for="item in categoryMenuItems" 
                :key="item.index"
                :index="item.index"
            >
                <template #title>
                    <el-icon v-if="item.icon">
                        <component :is="item.icon" />
                    </el-icon>
                    <span>{{ item.title }}</span>
                </template>
                <!-- 分类下的任务列表 -->
                <el-menu-item 
                    v-for="child in item.children" 
                    :key="child.index" 
                    :index="child.index"
                >
                    <el-icon v-if="child.icon">
                        <component :is="child.icon" />
                    </el-icon>
                    <template #title>{{ child.title }}</template>
                </el-menu-item>
            </el-sub-menu>
        </el-menu>
    </div>
</template>

<script>
import { Connection, Crop, Document, List, Money, PieChart, Plus, Refresh } from '@element-plus/icons-vue'

export default {
    name: 'LeftMenu',
    components: {
        Money,
        PieChart,
        Refresh,
        Plus,
        List,
        Document,
        Connection,
        Crop
    },
    props: {
        menuItems: {
            type: Array,
            required: true,
            default: () => []
        },
        activeIndex: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            isCollapse: false,
            openedMenus: []
        }
    },
    computed: {
        // 固定菜单项（看板、数据统计、数据同步）
        fixedMenuItems() {
            return this.menuItems.filter(item => 
                !item.children && 
                ['/data-manager/s/dashboard', '/data-manager/s/statistics', '/data-manager/s/sync'].includes(item.index)
            )
        },
        // 分类菜单项
        categoryMenuItems() {
            return this.menuItems.filter(item => item.children && item.children.length > 0)
        }
    },
    watch: {
        activeIndex: {
            immediate: true,
            handler(newIndex) {
                this.updateMenuState(newIndex)
            }
        }
    },
    methods: {
        handleSelect(index) {
            // 处理添加任务菜单项
            if (index.startsWith('add-task-')) {
                const categoryKey = index.replace('add-task-', '');
                const isNewCategory = categoryKey === 'new';
                
                let categoryInfo = null;
                if (!isNewCategory) {
                    // 查找对应的分类信息
                    const category = this.categoryMenuItems.find(item => item.key === categoryKey);
                    if (category) {
                        categoryInfo = {
                            key: category.key,
                            name: category.title
                        };
                    }
                }
                
                // 发送添加任务事件给父组件
                this.$emit('add-task', {
                    categoryKey: isNewCategory ? null : categoryKey,
                    isNewCategory: isNewCategory,
                    categoryInfo: categoryInfo
                });
                
                // 不进行路由跳转，直接返回
                return;
            }
            
            // 发送选择事件给父组件，由父组件处理路由
            this.$emit('select', index)
        },
        
        // 更新菜单状态（展开和选中）
        updateMenuState(currentPath) {
            if (!currentPath) return;
            
            // 清空当前展开的菜单
            this.openedMenus = []
            
            // 遍历分类菜单项，找到需要展开的分类
            this.categoryMenuItems.forEach(category => {
                const hasMatch = category.children.some(child => {
                    // 检查完整路径匹配
                    if (child.index === currentPath) return true
                    
                    // 检查路径前缀匹配（用于支持子路径）
                    if (currentPath.startsWith(child.index)) return true
                    
                    return false
                })
                
                if (hasMatch) {
                    this.openedMenus.push(category.index)
                }
            })
        }
    }
}
</script>

<style scoped>
.left-menu-container {
    height: 100%;
    background-color: #fff;
    box-shadow: 0px -1px 1px 1px rgba(0, 0, 0, 0.1);
    border-right: 1px solid rgba(0, 0, 0, 0.1);
}

.menu {
    height: 100%;
}

.menu:not(.el-menu--collapse) {
    width: 100%;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
    height: 50px;
    line-height: 50px;
    padding: 0 20px;
    font-size: 14px;
    color: #303133;
    border-right: 3px solid transparent;
    transition: all 0.3s ease;
}

:deep(.el-menu-item.is-active) {
    background-color: #ecf5ff;
    color: #409eff;
    border-right: 3px solid #409eff;
    font-weight: 500;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
    background-color: #f5f7fa;
    color: #409eff;
}

:deep(.el-sub-menu .el-menu-item) {
    min-width: 260px;
    padding-left: 48px !important;
    height: 45px;
    line-height: 45px;
}

:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
    margin-right: 12px;
    width: 20px;
    height: 20px;
    font-size: 18px;
}

:deep(.el-menu--collapse) {
    width: 64px;
}

:deep(.el-menu--collapse .el-sub-menu__title span) {
    display: none;
}

:deep(.el-menu--collapse .el-sub-menu__title .el-sub-menu__icon-arrow) {
    display: none;
}

/* 分类标题样式 */
:deep(.el-sub-menu__title) {
    font-weight: 500;
    background-color: #f8fafd;
}

/* 子菜单容器样式 */
:deep(.el-menu--inline) {
    padding: 4px 0;
    background-color: #fff;
}

/* 选中状态的子菜单项 */
:deep(.el-menu--inline .el-menu-item.is-active) {
    background-color: #ecf5ff;
    color: #409eff;
    border-right: 3px solid #409eff;
    font-weight: 500;
}

/* 子菜单项悬停效果 */
:deep(.el-menu--inline .el-menu-item:hover) {
    background-color: #f5f7fa;
    color: #409eff;
}

/* 子菜单展开图标样式 */
:deep(.el-sub-menu__icon-arrow) {
    right: 20px;
    font-size: 12px;
    color: #909399;
}

/* 菜单项图标容器 */
:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
