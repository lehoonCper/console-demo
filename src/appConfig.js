export const envManager = {

    getAppName() {
        return import.meta.env.QUOTE_CONSOLE_APP_NAME
    },

    getAppVersion() {
       // 从git获取commit hash
       return execSync('git rev-parse --short HEAD').toString().trim()
    },

    getEnv() {
        return import.meta.env.QUOTE_CONSOLE_ENV
    },

    getApiUrl() {
        return import.meta.env.QUOTE_CONSOLE_API_URL
    },

    getAuthUrl() {
        return import.meta.env.QUOTE_CONSOLE_AUTH_URL
    },

    getAuthCodeServerUrl() {
        return import.meta.env.QUOTE_CONSOLE_AUTH_CODE_SERVER_URL
    },

    getAuthClientId() {
        return import.meta.env.QUOTE_CONSOLE_AUTH_CLIENT_ID
    },

    getAuthCallbackAddr() { 
        return import.meta.env.QUOTE_CONSOLE_AUTH_CALLBACK_ADDR
    },

    info(){
        return {
            appName: this.getAppName(),
            appVersion: this.getAppVersion(),
            env: this.getEnv(),
            apiUrl: this.getApiUrl(),
            authUrl: this.getAuthUrl(),
            authCodeServerUrl: this.getAuthCodeServerUrl(),
            authClientId: this.getAuthClientId(),
            authCallbackAddr: this.getAuthCallbackAddr()
        }
    }
}