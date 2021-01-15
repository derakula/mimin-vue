import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "./styles/index.css";

/*
import moment from "moment";
moment.locale("zh-cn");
Vue.prototype.$moment = moment;
*/

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

Vue.use(Toast, {
  newestOnTop: true,
  timeout: 1495,
  hideProgressBar: false,
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
