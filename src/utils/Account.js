import { common } from './Common';

export const accountInfo = {
    username: '',
    nickname: '',
    email: '',
    isAdmin: false,
    env: '',
    avatarUrl: '',
    miniAvatarUrl: '',

    get () {
        this.env = import.meta.env.VITE_APP_ENV;
        this.username = common.getCookie('username');
        this.nickname = common.getCookie('nickname');
        this.email = common.getCookie('email');
        this.avatarUrl = common.getCookie('avatarUrl');
        this.miniAvatarUrl = common.getCookie('miniAvatarUrl');
        this.isAdmin = this.email === 'hao.liu@longbridge-inc.com';
        return this
    },
    set (username, nickname, email, avatarUrl, miniAvatarUrl) {
        this.username = username;
        this.nickname = nickname;
        this.email = email;
        this.avatarUrl = avatarUrl;
        this.miniAvatarUrl = miniAvatarUrl;
        this.isAdmin = this.email === 'hao.liu@longbridge-inc.com';
        common.setCookie('username', username);
        common.setCookie('nickname', nickname);
        common.setCookie('email', email);
        common.setCookie('avatarUrl', avatarUrl);
        common.setCookie('miniAvatarUrl', miniAvatarUrl);
    },
    clear () {
        this.username = '';
        this.nickname = '';
        this.email = '';
        this.avatarUrl = '';
        this.miniAvatarUrl = '';
        this.isAdmin = false;

        common.removeCookie('username');
        common.removeCookie('nickname');
        common.removeCookie('email');
        common.removeCookie('avatarUrl');
        common.removeCookie('miniAvatarUrl');
    }
};