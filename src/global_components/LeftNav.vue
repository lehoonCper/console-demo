<template>
    <div class="left-nav-container">
        <el-menu
            class="nav-menu"
            :collapse="isCollapse"
            @select="handleSelect"
            :default-openeds="openedMenus"
            :default-active="activeIndex"
        >
            <!-- 动态菜单项 -->
            <template v-for="item in menuItems" :key="item.index">
                <!-- 如果有子菜单 -->
                <el-sub-menu 
                    v-if="item.children && item.children.length > 0" 
                    :index="item.index"
                >
                    <template #title>
                        <el-icon v-if="item.icon">
                            <component :is="item.icon" />
                        </el-icon>
                        <span>{{ item.title }}</span>
                    </template>
                    <!-- 递归渲染子菜单项 -->
                    <el-menu-item 
                        v-for="child in item.children" 
                        :key="child.index" 
                        :index="child.index"
                    >
                        <el-icon v-if="child.icon">
                            <component :is="child.icon" />
                        </el-icon>
                        <span>{{ child.title }}</span>
                    </el-menu-item>
                </el-sub-menu>
                <!-- 如果没有子菜单 -->
                <el-menu-item 
                    v-else 
                    :index="item.index"
                >
                    <el-icon v-if="item.icon">
                        <component :is="item.icon" />
                    </el-icon>
                    <span>{{ item.title }}</span>
                </el-menu-item>
            </template>

            <!-- 新增选项按钮 -->
            <el-menu-item v-if="showAddButton" @click="handleAddNew">
                <el-icon><Plus /></el-icon>
                <span>新增选项</span>
            </el-menu-item>
        </el-menu>
    </div>
</template>

<script>
import { Plus } from '@element-plus/icons-vue';

export default {
    name: 'LeftNav',
    components: {
        Plus
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
        },
        showAddButton: {
            type: Boolean,
            default: false
        },
        collapse: {
            type: Boolean,
            default: false
        }
    },
    emits: ['select', 'add-new'],
    data() {
        return {
            isCollapse: this.collapse,
            openedMenus: []
        }
    },
    watch: {
        collapse(newVal) {
            this.isCollapse = newVal;
        },
        activeIndex: {
            immediate: true,
            handler(newIndex) {
                this.updateMenuState(newIndex);
            }
        }
    },
    methods: {
        handleSelect(index) {
            this.$emit('select', index);
        },
        
        handleAddNew() {
            this.$emit('add-new');
        },
        
        // 更新菜单状态（展开和选中）
        updateMenuState(currentPath) {
            if (!currentPath) return;
            
            // 清空当前展开的菜单
            this.openedMenus = [];
            
            // 遍历菜单项，找到需要展开的父菜单
            this.menuItems.forEach(item => {
                if (item.children && item.children.length > 0) {
                    const hasMatch = item.children.some(child => {
                        // 检查完整路径匹配
                        if (child.index === currentPath) return true;
                        
                        // 检查路径前缀匹配（用于支持子路径）
                        if (currentPath.startsWith(child.index)) return true;
                        
                        return false;
                    });
                    
                    if (hasMatch) {
                        this.openedMenus.push(item.index);
                    }
                }
            });
        }
    }
}
</script>

<style scoped>
.left-nav-container {
    height: 100%;
    background-color: #fff;
    border-right: 1px solid #e4e7ed;
}

.nav-menu {
    height: 100%;
    border-right: none;
}

.nav-menu:not(.el-menu--collapse) {
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