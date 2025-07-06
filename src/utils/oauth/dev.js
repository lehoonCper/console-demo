export default {
  /**
   * 开发环境登录（后门）
   * @param {Object} options - 登录选项
   * @returns {Promise<Object>} 用户信息
   */
  async login(options = {}) {
    // 开发环境后门登录
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          username: 'dev',
          nickname: 'Developer',
          email: 'dev@quote-console.com',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev',
          miniAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev&size=32'
        });
      }, 500);
    });
  }
};