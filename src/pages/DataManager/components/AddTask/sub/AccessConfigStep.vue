<template>
    <div class="form-section">
        <h3 class="section-subtitle">访问配置</h3>
        <div class="form-grid">
            <el-form-item label="访问类型" prop="access_config.access_type">
                <el-select 
                    v-model="modelValue.access_type" 
                    placeholder="请选择访问类型" 
                    @change="handleAccessTypeChange" 
                    class="form-control"
                >
                    <el-option label="HTTP" value="http"></el-option>
                    <el-option label="GRPC" value="grpc"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="资源类型" prop="access_config.resource_kind">
                <el-select 
                    v-model="modelValue.resource_kind" 
                    placeholder="请选择服务资源类型" 
                    class="form-control"
                    @change="updateValue"
                >
                    <el-option label="Deployment" value="Deployment"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="服务资源名称" prop="access_config.resource_name">
                <el-input 
                    v-model="modelValue.resource_name" 
                    placeholder="请输入服务资源名称,和k8s集群资源保持一致" 
                    class="form-control"
                    @input="updateValue"
                />
            </el-form-item>
            <el-form-item label="是否为异步调用">
                <el-checkbox 
                    v-model="modelValue.is_async"
                    disabled
                    @change="updateValue"
                />
            </el-form-item>
            <el-form-item label="允许的集群" prop="access_config.allowed_clusters">
                <el-select
                    v-model="modelValue.allowed_clusters"
                    multiple
                    placeholder="请选择允许的集群"
                    class="form-control"
                    @change="updateValue"
                >
                    <el-option label="prod-hk-ack-1" value="prod-hk-ack-1"></el-option>
                    <el-option label="prod-sz-ack-1" value="prod-sz-ack-1"></el-option>
                    <el-option label="prod-sh-ack-1" value="prod-sh-ack-1"></el-option>
                    <el-option label="local" value="local"></el-option>
                </el-select>
            </el-form-item>
            
            <!-- HTTP配置 -->
            <template v-if="modelValue.access_type === 'http'">
                <el-form-item label="请求方法" prop="access_config.http_access_config.method">
                    <el-select 
                        v-model="modelValue.http_access_config.method" 
                        placeholder="请选择请求方法" 
                        class="form-control"
                        @change="updateValue"
                    >
                        <el-option label="GET" value="GET"></el-option>
                        <el-option label="POST" value="POST"></el-option>
                        <el-option label="PUT" value="PUT"></el-option>
                        <el-option label="DELETE" value="DELETE"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="端口" prop="access_config.http_access_config.port">
                    <el-input 
                        v-model="modelValue.http_access_config.port" 
                        placeholder="请输入端口号" 
                        class="form-control"
                        @input="updateValue"
                    />
                </el-form-item>
                <el-form-item label="路径" prop="access_config.http_access_config.path">
                    <el-input 
                        v-model="modelValue.http_access_config.path" 
                        placeholder="请输入API路径" 
                        class="form-control"
                        @input="updateValue"
                    />
                </el-form-item>
                <el-form-item label="Headers">
                    <div class="headers-container">
                        <div v-for="(header, index) in modelValue.http_access_config.headers" :key="index" class="header-item">
                            <el-input 
                                v-model="header.key" 
                                placeholder="Key" 
                                class="header-key form-control"
                                @input="updateValue"
                            />
                            <el-input 
                                v-model="header.value" 
                                placeholder="Value" 
                                class="header-value form-control"
                                @input="updateValue"
                            />
                            <el-button 
                                type="danger" 
                                @click="removeHeader('http', index)" 
                                circle 
                                size="small"
                                class="param-delete-btn"
                            >
                                <el-icon><Delete /></el-icon>
                            </el-button>
                        </div>
                        <el-button 
                            type="primary" 
                            @click="addHeader('http')" 
                            plain 
                            size="small"
                        >
                            添加Header
                        </el-button>
                    </div>
                </el-form-item>
            </template>
            
            <!-- GRPC配置 -->
            <template v-if="modelValue.access_type === 'grpc'">
                <el-form-item label="服务" prop="access_config.grpc_access_config.service">
                    <el-input 
                        v-model="modelValue.grpc_access_config.service" 
                        placeholder="请输入服务名称" 
                        class="form-control"
                        @input="updateValue"
                    />
                </el-form-item>
                <el-form-item label="方法" prop="access_config.grpc_access_config.method">
                    <el-input 
                        v-model="modelValue.grpc_access_config.method" 
                        placeholder="请输入方法名称" 
                        class="form-control"
                        @input="updateValue"
                    />
                </el-form-item>
                <el-form-item label="Headers">
                    <div class="headers-container">
                        <div v-for="(header, index) in modelValue.grpc_access_config.headers" :key="index" class="header-item">
                            <el-input 
                                v-model="header.key" 
                                placeholder="Key" 
                                class="header-key form-control"
                                @input="updateValue"
                            />
                            <el-input 
                                v-model="header.value" 
                                placeholder="Value" 
                                class="header-value form-control"
                                @input="updateValue"
                            />
                            <el-button 
                                type="danger" 
                                @click="removeHeader('grpc', index)" 
                                circle 
                                size="small"
                                class="param-delete-btn"
                            >
                                <el-icon><Delete /></el-icon>
                            </el-button>
                        </div>
                        <el-button 
                            type="primary" 
                            @click="addHeader('grpc')" 
                            plain 
                            size="small"
                        >
                            添加Header
                        </el-button>
                    </div>
                </el-form-item>
            </template>
        </div>
    </div>
</template>

<script>
import { Delete } from '@element-plus/icons-vue';

export default {
    name: 'AccessConfigStep',
    components: {
        Delete
    },
    props: {
        modelValue: {
            type: Object,
            required: true
        }
    },
    emits: ['update:modelValue', 'access-type-change'],
    methods: {
        updateValue() {
            this.$emit('update:modelValue', this.modelValue);
        },
        handleAccessTypeChange(value) {
            this.$emit('access-type-change', value);
            this.updateValue();
        },
        addHeader(type) {
            const headers = type === 'http' 
                ? this.modelValue.http_access_config.headers 
                : this.modelValue.grpc_access_config.headers;
            headers.push({ key: '', value: '' });
            this.updateValue();
        },
        removeHeader(type, index) {
            const headers = type === 'http' 
                ? this.modelValue.http_access_config.headers 
                : this.modelValue.grpc_access_config.headers;
            headers.splice(index, 1);
            this.updateValue();
        }
    }
}
</script>

<style scoped>
/* 表单区块样式 */
.form-section {
    margin-bottom: 10px;
    background: #f8fafd;
    border-radius: 12px;
    padding: 10px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
    transition: all 0.3s ease;
}

.form-section:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

/* 子标题样式 */
.section-subtitle {
    font-size: 18px;
    font-weight: 600;
    color: #222;
    margin-bottom: 14px;
    padding-bottom: 14px;
    background: transparent;
    position: relative;
    border-bottom: 2px solid #ebeef5;
}

/* 表单网格布局 */
.form-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
    max-width: 100%;
    margin: 0;
}

/* 表单项样式 */
.el-form-item {
    margin-bottom: 20px;
    width: 100%;
    align-items: center;
}

.form-control {
    width: 100% !important;
    max-width: 400px !important;
}

/* 头部容器 */
.headers-container {
    max-width: 80%;
    width: 100%;
}

.header-item {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    align-items: center;
}

.header-key,
.header-value {
    flex: 1;
}

/* 删除按钮样式 */
.param-delete-btn {
    background: #fff !important;
    color: #f56c6c !important;
    border: 1px solid #f56c6c !important;
    box-shadow: none !important;
    margin-left: 8px;
    min-width: 32px !important;
    width: 32px !important;
    height: 32px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px !important;
    transition: all 0.3s ease;
    border-radius: 6px;
}

.param-delete-btn:hover {
    background: #f56c6c !important;
    color: #fff !important;
    border-color: #f56c6c !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(245, 108, 108, 0.2);
}
</style> 