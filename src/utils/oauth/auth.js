import { accountInfo } from '../Account.js';
import authConfig from '../auth.json';
import devAuth from './dev.js';
import larkAuth from './lark.js';
import slackAuth from './slack.js';

// OAuth 提供商映射
const authProviders = {
  lark: larkAuth,
  slack: slackAuth,
  dev: devAuth
};

export const auth = {
  /**
   * 获取可用的认证提供商
   * @returns {Array} 可用的认证提供商列表
   */
  getAvailableProviders() {
    return authConfig.vendors.filter(vendor => vendor.enabled);
  },

  /**
   * 执行登录
   * @param {string} providerName - 认证提供商名称
   * @param {Object} options - 登录选项
   * @returns {Promise} 登录结果
   */
  async login(providerName, options = {}) {
    const provider = authProviders[providerName];
    if (!provider) {
      throw new Error(`不支持的认证提供商: ${providerName}`);
    }

    try {
      const userInfo = await provider.login(options);
      
      // 保存用户信息
      accountInfo.set(
        userInfo.username,
        userInfo.nickname || userInfo.username,
        userInfo.email,
        userInfo.avatarUrl,
        userInfo.miniAvatarUrl || userInfo.avatarUrl
      );

      return userInfo;
    } catch (error) {
      console.error(`${providerName} 登录失败:`, error);
      throw error;
    }
  },

  /**
   * 退出登录
   */
  logout() {
    accountInfo.clear();
  },

  /**
   * 检查是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    const user = accountInfo.get();
    return !!(user.email && user.username);
  },

  /**
   * 获取当前用户信息
   * @returns {Object} 用户信息
   */
  getCurrentUser() {
    return accountInfo.get();
  }
};