import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: '/', // Use relative base URL to work with Vite proxy
    timeout: 10000,
    maxRedirects: 0,
    // 跨域相关配置
    withCredentials: false, // 如需要携带 cookie 设为 true
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // 如果后端需要特定的跨域头
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// 请求拦截器
axiosInstance.interceptors.request.use(config => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    
    // 对于 POST 请求，确保正确的 Content-Type
    if (config.method === 'post' && config.data) {
        if (config.data instanceof FormData) {
            // FormData 会自动设置 Content-Type
            delete config.headers['Content-Type']
        }
    }
    
    return config;
}, error => {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 响应拦截器
axiosInstance.interceptors.response.use(response => {
    // 对响应数据做些什么
    return response;
}, error => {
    // 处理跨域错误
    if (error.code === 'ERR_NETWORK') {
        console.error('网络错误，可能是跨域问题:', error);
    }
    
    // 对响应错误做些什么
    return Promise.reject(error);
});

export default axiosInstance;