export default {
  /**
   * 飞书登录
   * @param {Object} options - 登录选项
   * @returns {Promise<Object>} 用户信息
   */
  async login(options = {}) {
    const authCodeServerUrl = import.meta.env.VITE_APP_AUTH_CODE_SERVER_ADDR;
    const clientId = import.meta.env.VITE_APP_AUTH_CLIENT_ID;
    const callbackAddr = import.meta.env.VITE_APP_AUTH_CALLBACK_ADDR;

    if (!authCodeServerUrl || !clientId || !callbackAddr) {
      throw new Error('飞书登录配置不完整');
    }

    // 构建授权URL
    const authUrl = `${authCodeServerUrl}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(callbackAddr)}`;
    
    // 跳转到授权页面
    window.location.href = authUrl;
    
    // 这里返回一个Promise，实际的用户信息会在回调页面处理
    return new Promise((resolve, reject) => {
      // 在实际应用中，这里会在回调页面处理授权码并获取用户信息
      // 这里只是示例，实际需要根据飞书API文档实现
      setTimeout(() => {
        reject(new Error('需要在回调页面处理'));
      }, 1000);
    });
  },

  /**
   * 处理授权回调
   * @param {string} code - 授权码
   * @returns {Promise<Object>} 用户信息
   */
  async handleCallback(code) {
    if (!code) {
      throw new Error('授权码不能为空');
    }

    try {
      // 这里应该调用后端API来交换访问令牌并获取用户信息
      // 示例实现
      const response = await fetch(`${import.meta.env.VITE_APP_SERVER_API_URL}/auth/lark/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          redirect_uri: import.meta.env.VITE_APP_AUTH_CALLBACK_ADDR
        })
      });

      if (!response.ok) {
        throw new Error('获取用户信息失败');
      }

      const data = await response.json();
      
      return {
        username: data.user_info.name,
        nickname: data.user_info.nickname,
        email: data.user_info.email,
        avatarUrl: data.user_info.avatar_url,
        miniAvatarUrl: data.user_info.mini_avatar_url
      };
    } catch (error) {
      console.error('飞书登录回调处理失败:', error);
      throw error;
    }
  }
};