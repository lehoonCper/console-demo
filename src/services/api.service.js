import apiConfig from '@/utils/api/config.json';
import axios from 'axios';

// 获取 baseURL，优先用环境变量，否则用配置文件
const baseUrl = import.meta.env.VITE_APP_SERVER_API_URL;

// 创建 axios 实例
const axiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    },
    maxRedirects: 0
});

// 请求拦截器：自动携带 token
axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器：统一错误处理
axiosInstance.interceptors.response.use(
    response => {
        // 直接返回 data
        return response.data;
    },
    error => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    window.location.href = '/auth';
                    break;
                case 403:
                    console.error('权限不足');
                    break;
                case 404:
                    console.error('请求的资源不存在');
                    break;
                case 500:
                    console.error('服务器错误');
                    break;
                default:
                    console.error('请求失败');
            }
        }
        return Promise.reject(error);
    }
);

class ApiService {
    // 获取 API 路径
    getEndpoint(key) {
        if (!apiConfig.endpoints[key]) {
            throw new Error(`API endpoint '${key}' not found in configuration`);
        }
        return apiConfig.endpoints[key];
    }

    // 统一请求方法
    async request(key, data = {}, config = {}) {
        const endpoint = this.getEndpoint(key);
        try {
            const response = await axiosInstance.post(endpoint, data, config);
            if (!response) {
                throw new Error('响应数据为空');
            }
            if (response.code && response.code !== 200) {
                throw new Error(response.message || '请求失败');
            }
            return response;
        } catch (error) {
            console.error('API请求失败:', error);
            return Promise.reject(error);
        }
    }

    // 也可以暴露 axiosInstance 以便直接用 get/post
    get axios() {
        return axiosInstance;
    }
}

// 单例
const apiService = new ApiService();
export default apiService;