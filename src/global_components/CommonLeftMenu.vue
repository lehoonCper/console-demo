<template>
    <div class="menu-wrapper">
        <el-container class="common-left-menu-container">
            <el-aside width="100%">
                <el-menu
                    class="el-menu-vertical"
                    @select="handleSelect"
                    :default-active="$route.path"
                >
                    <template v-for="item in menuItems">
                        <!-- 如果有子菜单 -->
                        <el-sub-menu 
                            v-if="item.children" 
                            :index="item.index"
                            :key="item.index"
                        >
                            <template #title>
                                <el-icon><component :is="item.icon" /></el-icon>
                                <span>{{ item.title }}</span>
                            </template>
                            <!-- 递归渲染子菜单项 -->
                            <el-menu-item 
                                v-for="child in item.children" 
                                :key="child.index" 
                                :index="child.index"
                            >
                                <el-icon><component :is="child.icon" /></el-icon>
                                <span>{{ child.title }}</span>
                            </el-menu-item>
                        </el-sub-menu>
                        <!-- 如果没有子菜单 -->
                        <el-menu-item 
                            v-else 
                            :key="`menu-${item.index}`"
                            :index="item.index"
                        >
                            <el-icon><component :is="item.icon" /></el-icon>
                            <span>{{ item.title }}</span>
                        </el-menu-item>
                    </template>

                    <el-menu-item v-if="!addingCategory" @click="showAddCategoryInput">
                        <el-icon><Plus /></el-icon>
                        新增类别
                    </el-menu-item>
                    <el-menu-item v-else style="padding: 0 8px;">
                        <el-input v-model="newCategoryName" placeholder="类别名称" size="small" class="add-category-input" @keyup.enter="submitAddCategory" />
                        <el-button type="primary" size="small" @click="submitAddCategory">提交</el-button>
                        <el-button size="small" @click="cancelAddCategory">取消</el-button>
                    </el-menu-item>
                </el-menu>
            </el-aside>
        </el-container>
    </div>
</template>

<script>
import { Crop, Download, List, Money, PieChart, Plus, Refresh, Upload } from '@element-plus/icons-vue';
export default {
    name: 'CommonLeftMenu',
    components: {
        Money,
        PieChart,
        Refresh,
        List,
        Upload,
        Download,
        Crop,
        Plus
    },
    props: {
        menuItems: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            addingCategory: false,
            newCategoryName: ''
        }
    },
    methods: {
        handleSelect(index) {
            this.$emit('select', index)
            this.$router.push(index)
        },
        showAddCategoryInput() {
            this.addingCategory = true;
            this.newCategoryName = '';
        },
        cancelAddCategory() {
            this.addingCategory = false;
            this.newCategoryName = '';
        },
        submitAddCategory() {
            const name = this.newCategoryName.trim();
            if (!name) {
                this.$message.error('类别名称不能为空');
                return;
            }
            this.$emit('add-category', name);
            this.addingCategory = false;
            this.newCategoryName = '';
        }
    }
}
</script>

<style scoped>
.menu-wrapper {
    position: fixed;
    top: 60px;
    height: 100vh;
    background: #ffffff;
    border-right: 1px solid #e8edf2;
    width: 100%;
}

.common-left-menu-container {
    height: 100%;
}

.el-menu-vertical {
    height: 100%;
    border-right: none;
}

:deep(.el-menu) {
    background: transparent;
}

:deep(.el-menu-item) {
    height: 46px;
    line-height: 46px;
    margin: 4px 8px;
    padding: 0 16px !important;
    border-radius: 6px;
    color: #4c5667;
    font-size: 14px;
}

:deep(.el-menu-item.is-active) {
    background: #f0f7ff;
    color: #2468f2;
    font-weight: 500;
}

:deep(.el-menu-item:hover) {
    background: #f6f8fa;
    color: #2468f2;
}

:deep(.el-sub-menu__title) {
    height: 46px;
    line-height: 46px;
    margin: 4px 8px;
    padding: 0 16px !important;
    border-radius: 6px;
    color: #4c5667;
    font-size: 14px;
}

:deep(.el-sub-menu__title:hover) {
    background: #f6f8fa;
    color: #2468f2;
}

:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
    margin-right: 10px;
    font-size: 16px;
    color: #8792a8;
}

:deep(.el-menu-item.is-active .el-icon) {
    color: #2468f2;
}

:deep(.el-menu-item:hover .el-icon) {
    color: #2468f2;
}

/* 子菜单样式 */
:deep(.el-menu--inline) {
    padding: 4px;
    background: #fafbfc;
    margin: 0 8px;
    border-radius: 6px;
}

:deep(.el-menu--inline .el-menu-item) {
    height: 40px;
    line-height: 40px;
    margin: 2px 0;
}

:deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
    color: #2468f2;
}

:deep(.el-sub-menu.is-opened > .el-sub-menu__title .el-icon) {
    color: #2468f2;
}

/* 动画效果 */
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 弹出的子菜单样式 */
:deep(.el-menu--popup) {
    padding: 4px;
    min-width: 80%;
    border-radius: 8px;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
}



.menu-wrapper::-webkit-scrollbar {
    width: 6px;
}

.menu-wrapper::-webkit-scrollbar-thumb {
    background: #e0e3e9;
    border-radius: 3px;
}

.menu-wrapper::-webkit-scrollbar-track {
    background: transparent;
}

.add-category-footer {
    position: absolute;
    height: 20px;
    bottom: 0;
    width: 100%;
}

.add-category-btn {
    width: 100%;
    border-radius: 0;
}

.add-category-input {
    margin-right: 8px;
    width: 120px;
}

</style>
