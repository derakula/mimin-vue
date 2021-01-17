import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "./styles/index.css";

import firebase from 'firebase/app';
import 'firebase/auth';
import firebaseConfig from './config/firebase.config';

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
  created() {
    firebase.initializeApp(firebaseConfig)
    firebase.auth().onAuthStateChanged((user) => {
      if (user !== null) {
        user.getIdTokenResult().then((result) => {
          let claims = result.claims;
          console.log('claims', claims);
          if (user) {
            this.$store.dispatch('autoSignIn', claims)
          }
        });
      }else{
        this.$store.dispatch('logout')
      }
    })
  }
}).$mount("#app");
