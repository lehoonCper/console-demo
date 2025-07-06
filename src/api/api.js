import apiConfig from '@/api/config.json'
import axios from 'axios'

// 获取 baseURL，优先用环境变量，否则用配置文件
const baseUrl = import.meta.env.VITE_APP_SERVER_API_URL || (apiConfig.baseUrls && apiConfig.baseUrls[import.meta.env.VITE_APP_ENV]) || (apiConfig.baseUrls && apiConfig.baseUrls.development)

// 创建 axios 实例
const axiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    },
    maxRedirects: 0
})

// 请求拦截器：自动携带 token
axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器：统一错误处理
axiosInstance.interceptors.response.use(
    response => {
        // 直接返回 data
        return response.data
    },
    error => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    window.location.href = '/login'
                    break
                case 403:
                    console.error('权限不足')
                    break
                case 404:
                    console.error('请求的资源不存在')
                    break
                case 500:
                    console.error('服务器错误')
                    break
                default:
                    console.error('请求失败')
            }
        }
        return Promise.reject(error)
    }
)

class ApiService {
    // 获取 API 路径
    getEndpoint (key) {
        if (!apiConfig.endpoints[key]) {
            throw new Error(`API endpoint '${key}' not found in configuration`)
        }
        return apiConfig.endpoints[key]
    }

    // 统一请求方法
    async request (key, data = {}, config = {}) {
        const endpoint = this.getEndpoint(key)
        try {
            const response = await axiosInstance.post(endpoint, data, config)
            if (!response) {
                throw new Error('响应数据为空')
            }
            if (response.code !== 200) {
                ElNotification({
                    style: {
                        width: '500px',
                        borderRadius: '10px',
                        padding: '10px',
                    },
                    title: 'API请求失败: ',
                    message: h(ElDescriptions, { column: 1, border: true }, () => [
                        h(ElDescriptionsItem, { label: '请求URL' }, () => endpoint),
                        h(ElDescriptionsItem, { label: '错误代码' }, () => response.code),
                        h(ElDescriptionsItem, { label: '错误信息' }, () => response.message),
                    ]),
                    type: 'error'
                })
                throw new Error(response.message || '请求失败')
            }
            return response
        } catch (error) {
            console.error('API请求失败:', error)
            // element-plus 右侧notification 提示
            ElNotification({
                style: {
                    width: '500px',
                    borderRadius: '10px',
                    padding: '10px',
                },
                title: 'API请求失败: ',
                message: h(ElDescriptions, { column: 1, border: true }, () => [
                    h(ElDescriptionsItem, { label: '请求URL' }, () => endpoint),
                    h(ElDescriptionsItem, { label: '错误代码' }, () => error.code),
                    h(ElDescriptionsItem, { label: '错误信息' }, () => error.message),
                ]),
                type: 'error'
            })
            return Promise.reject(error)
        }
    }

    // 也可以暴露 axiosInstance 以便直接用 get/post
    get axios () {
        return axiosInstance
    }
}

// 单例
const apiService = new ApiService()
export default apiService