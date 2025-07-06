<template>
<div class="common-header-container">
    <header class="header">
        <div class="nav-container">
            <div class="logo">
                <el-image src="https://ezquote-statics.oss-cn-hangzhou.aliyuncs.com/quote-monitor-icons/v2/quote-console-icon.png" style="height: 60px; width: 120px; max-height: 60px;" fit="cover">
                </el-image>
            </div>
            <el-menu mode="horizontal" class="nav-menu" :router="true" :ellipsis="false">
                <el-menu-item index="/">首页</el-menu-item>
                <el-menu-item index="/data-manager">数据管理</el-menu-item>
            </el-menu>
            <el-dropdown @command="handleCommand" trigger="hover">
                <el-avatar :size="40" :src="$accountInfo.miniAvatarUrl"></el-avatar>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="user-info" disabled>当前用户: {{ $accountInfo.username }}</el-dropdown-item>
                        <el-dropdown-item 
                            v-if="$accountInfo.username !== 'quote-console-admin' && isLocal()" 
                            command="switch-user-quote-console-admin"
                        >
                            切换用户: quote-console-admin
                        </el-dropdown-item>
                        <el-dropdown-item 
                            v-if="$accountInfo.username !== 'test' && isLocal()" 
                            command="switch-user-test"
                        >
                            切换用户: test
                        </el-dropdown-item>
                        <el-dropdown-item divided command="logout" style="color: red;">
                            退出登录
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </header>
    <div class="content-wrapper">
        <slot></slot>
    </div>
</div>
</template>

<script>
import {
    ElNotification
} from 'element-plus';

export default {
    name: 'CommonHeader',
    methods: {
        handleCommand(command) {
            // 用户信息项不处理（已设置为disabled）
            if (command === 'user-info') {
                return;
            }
            
            if (command === 'logout') {
                // 处理退出登录逻辑
                console.log('用户退出登录');
                this.$accountInfo.clear()
                this.$router.push('/auth')
                return
            }

            if (command === 'switch-user-quote-console-admin') {
                // 处理切换用户逻辑
                this.$accountInfo.clear()
                this.$accountInfo.set(
                    'quote-console-admin', 
                    'quote-console-admin', 
                    'quote-console-admin@test.com', 
                    'https://ezquote-statics.oss-cn-hangzhou.aliyuncs.com/quote-monitor-icons/hacker.jpeg', 
                    'https://ezquote-statics.oss-cn-hangzhou.aliyuncs.com/quote-monitor-icons/hacker.jpeg'
                );
            }

            if (command === 'switch-user-test') {
                // 处理切换用户逻辑
                this.$accountInfo.clear()
                this.$accountInfo.set(
                    'test', 
                    'test', 
                    'test@test.com', 
                    'https://ezquote-statics.oss-cn-hangzhou.aliyuncs.com/quote-monitor-icons/v2/goten-logo-dark.png', 
                    'https://ezquote-statics.oss-cn-hangzhou.aliyuncs.com/quote-monitor-icons/v2/goten-logo-dark.png'
                );
            }

            //刷新当前页面
            window.location.reload();
        },
        isLocal() {
            return import.meta.env.VITE_APP_ENV === 'local';
        }
    },

    mounted() {
        //检查是否登录
        if (this.$accountInfo.get().email === undefined) {
            ElNotification({
                title: '需要登陆',
                type: 'error',
            })
            this.$router.push('/auth')
        }
    }
}
</script>

<style scoped>
.common-header-container {
    /* 组件容器样式 */
}

.header {
    position: fixed;
    width: 100%;
    box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    background-color: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(1px);
    /* 5px 是模糊半径，可以根据需要调整 */
    transition: 0.2s;
    top: 0;
    left: 0;
    z-index: 100;
}

.header:hover {
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(1px);
}

.content-wrapper {
    padding-top: 64px;
}

.nav-container {
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    height: 60px;
}

.logo {
    height: 100%;
    font-size: 36px;
    font-weight: normal;
    color: #409eff;
    cursor: pointer;
    user-select: none;
    text-align: left;
    align-items: center;
    padding-top: 10px;
    overflow: hidden;
}

.nav-menu {
    background-color: transparent;
    margin-left: auto;
}

:deep(.el-menu--horizontal.el-menu) {
    border-bottom: none;
}

:deep(.el-menu--horizontal > .el-menu-item) {
    font-size: 16px;
    font-weight: 500;
    color: #606266;
    height: 60px;
    line-height: 60px;
}

:deep(.el-menu--horizontal > .el-menu-item:not(.is-disabled):hover) {
    color: #409eff;
}

:deep(.el-menu--horizontal > .el-menu-item.is-active) {
    color: #409eff;
}

.el-dropdown {
    cursor: pointer;
    margin-left: 20px;
}
</style>
