import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { createApp } from 'vue';
import App from './App.vue';
import accountInfoPlugin from './plugins/plugins_account';
import router from './router';
import { common } from './utils/Common';

// 添加全局 ResizeObserver 错误处理
const resizeHandler = (callback, time) => {
    let timer = null
    return (entries) => {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            callback(entries)
        }, time)
    }
};
window.ResizeObserver = class ResizeObserver extends window.ResizeObserver {
    constructor(callback) {
        callback = resizeHandler(callback, 16)
        super(callback);
    }
};

const app = createApp(App)
app.use(accountInfoPlugin)
app.use(router)
app.use(ElementPlus, {
    select: {
        popperOptions: {
            modifiers: [
                {
                    name: 'computeStyles',
                    options: {
                        gpuAcceleration: false
                    }
                },
                {
                    name: 'preventOverflow',
                    options: {
                        padding: 10
                    }
                },
                {
                    name: 'flip',
                    options: {
                        padding: 10
                    }
                }
            ]
        }
    }
})
app.config.globalProperties.$common = common
app.mount('#app')