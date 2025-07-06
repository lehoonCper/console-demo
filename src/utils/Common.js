import dayjs from 'dayjs';
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import axiosInstance from '../api/Axios';
import { accountInfo } from './Account';

dayjs.extend(utc);
dayjs.extend(timezone);
export const common = {
    /**
     * 获取指定名称的 cookie 值
     * @param {string} key - cookie 的名称
     * @returns {string|undefined} 如果找到匹配的 cookie，返回解码后的值；否则返回 undefined
     */
    getCookie (key) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + key.replace(/([?*|{}()[\]\\^$+])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    },

    /**
     * 写入指定的 cookie 值
     * @param {string} key - cookie 的名称
     * @param {string} value - cookie 的值
     * @param {Object} options - 可选的 cookie 选项
     * @returns {void}
     */
    setCookie (key, value, options = {}) {
        options = {
            path: '/',
            ...options
        };

        if (options.expires instanceof Date) {
            options.expires = options.expires.toUTCString();
        }

        let updatedCookie = encodeURIComponent(key) + "=" + encodeURIComponent(value);

        for (let optionKey in options) {
            updatedCookie += "; " + optionKey;
            let optionValue = options[optionKey];
            if (optionValue !== true) {
                updatedCookie += "=" + optionValue;
            }
        }
        document.cookie = updatedCookie;
    },

    removeCookie (key) {
        document.cookie = key + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    },

    /**
     * 发送 HTTP POST 请求
     * @param {string} url - 请求的 URL
     * @param {Object} data - 请求的数据
     * @returns {Promise} - 返回一个 Promise 对象
     */
    post (url, data) {
        return axiosInstance.request({
            url: url, // Use relative URL to work with Vite proxy
            method: 'POST',
            headers: {
                'Trigger-By': accountInfo.get().email,
                'Page': url,
            },
            data: data
        })
    },

    /**
     * 发送 HTTP GET 请求
     * @param {string} url - 请求的 URL
     * @returns {Promise} - 返回一个 Promise 对象
     */
    get (url) {
        return axiosInstance.request({
            url: url, // Use relative URL to work with Vite proxy
            method: 'GET'
        })
    },


    /**
     * 获取 URL 中的查询参数
     * @returns {Object} - 返回一个包含查询参数的对象
     */
    getQueryParams () {
        const queryString = window.location.href.split('?')[1];
        if (!queryString) return {};
        return queryString.split('&').reduce((acc, curr) => {
            const [key, value] = curr.split('=');
            acc[key] = decodeURIComponent(value);
            return acc;
        }, {});
    },
    /**
     * 获取时间戳
     * @param {string} time - 时间字符串 格式: YYYY-MM-DD HH:mm:ss, 可以为空, 为空时返回当前时间戳
     * @param {string} timezone - 时区 默认: Asia/Shanghai
     * @returns {number} - 返回timezone时区的时间戳
     */
    getTimestamp (dateTime = '', timezone = 'Asia/Shanghai') {
        if (!dateTime) {
            dateTime = new Date();
        }

        const localDate = dayjs.tz(dateTime, timezone);
        return localDate.unix();

    },

    /**
     * 格式化时间戳
     * @param {number} timestamp - 时间戳
     * @param {string} format - 格式化字符串 默认: YYYY-MM-DD HH:mm:ss
     * @param {string} timezone - 时区 默认: Asia/Shanghai
     * @returns {string} - 返回timezone时区的时间戳
     */
    formatTime (timestamp = '', format = 'YYYY-MM-DD HH:mm:ss', timezone = 'Asia/Shanghai') {
        if (!timestamp) {
            timestamp = new Date();
        } else {
            if (timestamp.toString().length === 10) {
                timestamp = timestamp * 1000;
            }
        }

        const localDate = dayjs.tz(timestamp, timezone);
        return localDate.format(format);
    },

    getTimezoneByMarket (market) {
        if (market === 'US' || market === 'NUS' || market === 'OTC' || market === 'OTC') {
            return 'America/New_York';
        } else {
            return 'Asia/Shanghai';
        }
    }
}