<template>
    <div class="auth-main-container">
        <div class="auth-card">
            <div class="logo-section">
                <el-image 
                    src="https://ezquote-statics.oss-cn-hangzhou.aliyuncs.com/quote-monitor-icons/v2/quote-console-icon.png" 
                    style="height: 80px; width: 160px;" 
                    fit="contain"
                />
                <h1 class="app-title">Quote Console</h1>
                <p class="app-subtitle">行情控制台</p>
            </div>

            <div class="auth-section" v-loading="loading">
                <h2 class="auth-title">选择登录方式</h2>
                
                <div class="auth-providers">
                    <div 
                        v-for="provider in availableProviders" 
                        :key="provider.name"
                        class="auth-provider"
                        @click="handleLogin(provider.name)"
                    >
                        <div class="provider-icon">
                            <el-image 
                                v-if="provider.icon && provider.name !== 'dev'"
                                :src="getProviderIcon(provider.icon)" 
                                style="width: 24px; height: 24px;"
                                fit="contain"
                            />
                            <el-icon v-else-if="provider.name === 'dev'" size="24">
                                <User />
                            </el-icon>
                        </div>
                        <span class="provider-name">{{ getProviderDisplayName(provider.name) }}</span>
                    </div>
                </div>

                <div class="env-info">
                    <el-tag :type="getEnvTagType()" size="small">
                        {{ getEnvDisplayName() }} 环境
                    </el-tag>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { User } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { auth } from '@/utils/oauth/auth.js';
import larkAuth from '@/utils/oauth/lark.js';

export default {
    name: 'AuthMain',
    components: {
        User
    },
    data() {
        return {
            loading: false,
            availableProviders: []
        }
    },
    computed: {
        currentEnv() {
            return import.meta.env.VITE_APP_ENV || 'dev';
        }
    },
    async created() {
        this.availableProviders = auth.getAvailableProviders();
        
        // 检查是否有授权回调
        await this.handleAuthCallback();
    },
    methods: {
        async handleAuthCallback() {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            
            if (code) {
                this.loading = true;
                try {
                    // 处理飞书登录回调
                    const userInfo = await larkAuth.handleCallback(code);
                    
                    // 保存用户信息
                    this.$accountInfo.set(
                        userInfo.username,
                        userInfo.nickname,
                        userInfo.email,
                        userInfo.avatarUrl,
                        userInfo.miniAvatarUrl
                    );
                    
                    ElMessage.success('登录成功');
                    this.$router.push('/');
                } catch (error) {
                    console.error('登录回调处理失败:', error);
                    ElMessage.error('登录失败，请重试');
                } finally {
                    this.loading = false;
                }
            }
        },

        async handleLogin(providerName) {
            this.loading = true;
            
            try {
                await auth.login(providerName);
                ElMessage.success('登录成功');
                this.$router.push('/');
            } catch (error) {
                console.error('登录失败:', error);
                if (error.message !== '需要在回调页面处理') {
                    ElMessage.error('登录失败，请重试');
                }
            } finally {
                this.loading = false;
            }
        },

        getProviderIcon(iconName) {
            // 这里可以根据实际情况返回图标URL
            return `/icons/${iconName}`;
        },

        getProviderDisplayName(providerName) {
            const nameMap = {
                lark: '飞书登录',
                slack: 'Slack登录',
                dev: '开发者登录'
            };
            return nameMap[providerName] || providerName;
        },

        getEnvTagType() {
            const typeMap = {
                dev: 'info',
                staging: 'warning',
                prod: 'danger'
            };
            return typeMap[this.currentEnv] || 'info';
        },

        getEnvDisplayName() {
            const nameMap = {
                dev: '开发',
                staging: '测试',
                prod: '生产'
            };
            return nameMap[this.currentEnv] || this.currentEnv;
        }
    }
}
</script>

<style scoped>
.auth-main-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.auth-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    padding: 40px;
    width: 100%;
    max-width: 400px;
    text-align: center;
}

.logo-section {
    margin-bottom: 40px;
}

.app-title {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    margin: 16px 0 8px 0;
}

.app-subtitle {
    font-size: 16px;
    color: #7f8c8d;
    margin: 0;
}

.auth-section {
    margin-bottom: 20px;
}

.auth-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 24px;
}

.auth-providers {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
}

.auth-provider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px 20px;
    border: 2px solid #e1e8ed;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #fff;
}

.auth-provider:hover {
    border-color: #409eff;
    background: #f0f7ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.provider-icon {
    display: flex;
    align-items: center;
    justify-content: center;
}

.provider-name {
    font-size: 16px;
    font-weight: 500;
    color: #2c3e50;
}

.env-info {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 480px) {
    .auth-card {
        padding: 30px 20px;
        margin: 10px;
    }
    
    .app-title {
        font-size: 24px;
    }
    
    .auth-title {
        font-size: 18px;
    }
}
</style>