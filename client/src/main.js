import Vue from 'vue';
import App from './App';
import router from './router';
import OauthService from '@/services/OauthService';

require('./assets/sass/main.scss');

Vue.config.productionTip = false;

/* eslint-disable no-new */
const instance = new Vue({
  el: '#app',
  router,
  render: h => h(App),
  data: {
    user: null
  }
});

async function checkLogin (newJwt) {
  const jwt = newJwt || window.localStorage.getItem('jwt') || window.sessionStorage.getItem('jwt');
  if (!jwt) {
    instance.$data.user = null;
    return;
  }
  try {
    const response = (await OauthService.me()).data;
    instance.$data.user = response;
  } catch (err) {
    window.localStorage.removeItem('jwt');
  }
}

window.addEventListener('storage', function (event) {
  if (event.key === 'jwt') {
    checkLogin(event.newValue);
  }
});

checkLogin();
