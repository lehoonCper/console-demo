<template>
    <div class="login_view">
        <div class="auth_lv1">
            <el-image style=""
                      src="https://ezquote-statics.oss-cn-hangzhou.aliyuncs.com/quote-monitor-icons/v2/goten-logo-dark.png"
                      fit="scale-down"></el-image>
        </div>

        <br><br>
        <div class="auth_login_box"
             :hidden="hidden"
             @click="jump_lark">
            <el-image style="width:30px; height: 30px;"
                      src="https://ezquote-statics.oss-cn-hangzhou.aliyuncs.com/quote-monitor-icons/feishu_3x.webp">
            </el-image>

            <span class="auth_login_text"
                  @click="pre_login_redirect">飞书统一登录</span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LoginView',
    data () {
        return {
            login_success: false,
            hidden: false,
            
        }
    },

    methods: {
        async login (code) {
            try {
                let response = await this.$common.post('/auth/login', {
                    email: this.email,
                    code: code,
                    redirect_uri: import.meta.env.VITE_APP_AUTH_CALLBACK_ADDR
                })
                this.$accountInfo.set(response.data.user_info.name, response.data.user_info.nickname, response.data.user_info.email, response.data.user_info.avatar_url, response.data.user_info.mini_avatar_url);
                this.login_success = true;
                this.$router.push('/')
            } catch (error) {
                this.$message.error(error)
                return
            }
        },

        pre_login_redirect () {
            let addr = import.meta.env.VITE_APP_AUTH_CODE_SERVER_ADDR + "?client_id=" + import.meta.env.VITE_APP_AUTH_CLIENT_ID + "&response_type=code&redirect_uri=" + import.meta.env.VITE_APP_AUTH_CALLBACK_ADDR
            window.location.replace(addr)
        },

    },

    mounted () {
        if (import.meta.env.VITE_APP_ENV === 'local') {
            console.log('local环境，设置当前用户: test, test@test.com', import.meta.env.VITE_APP_ENV);
            this.$accountInfo.set('test', 'test', 'test@test.com', 'https://ezquote-statics.oss-cn-hangzhou.aliyuncs.com/quote-monitor-icons/v2/goten-logo-dark.png', 'https://ezquote-statics.oss-cn-hangzhou.aliyuncs.com/quote-monitor-icons/v2/goten-logo-dark.png');
            this.login_success = true;
            this.$router.push('/')
            return;
        }
        
        const queryParams = this.$common.getQueryParams();
        const code = queryParams.code;
        if (code == null || code == undefined) {
            return;
        } else {
            this.hidden = true;
            this.login(code);
        }
    }
}

</script>

<style scoped>
.login_view {
    height: 100%;
    background-image: linear-gradient(
        to right,
        #ffffff 0%,
        #ffffff 50%,
        #80e8ebc8 85%,
        #04befe 100%
    );
    display: flex;
    flex-direction: column;
    align-items: center;
}

.auth_title {
    width: 800px;
    height: 30px;
    margin: auto;
}

.auth_lv1 {
    width: 600px;
    height: 160px;
    margin: auto;
    margin-top: 50px;
    box-shadow: 1px 1px 20px 5px rgba(211, 211, 211, 0.9);
}

.auth_login_box {
    width: 140px;
    height: 30px;
    margin: auto;
    border: 1px solid rgb(193, 193, 193);
    text-align: left;
    padding-left: 10px;
    background-color: #fffffc;
    border-radius: 20px;
    cursor: pointer;
    transition: 0.2s;
}

.auth_login_box:hover {
    width: 140px;
    height: 30px;
    margin: auto;
    border: 1px solid rgb(127, 127, 127);
    text-align: left;
    padding-left: 10px;
    background-color: #f1f1ef;
    border-radius: 20px;
    transition: 0.2s;
}

.auth_login_text {
    height: 30px;
    margin: auto;
    float: right;
    line-height: 30px;
    font-size: 14px;
    margin-right: 10px;
}

.icon-enter-active,
.icon-leave-active {
    transition: opacity 0.5s;
}

.icon-enter,
.icon-leave-to

/* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
    height: 0px;
}
</style>
