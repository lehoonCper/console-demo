import { accountInfo } from '../utils/Account';

export default {
  install(app) {
    app.config.globalProperties.$accountInfo = accountInfo;
  }
};