<template>
    <span class="navbar-item">
        <a class="button is-primary is-inverted" v-if="user">
            <img class="icon" style="border-radius: 50%" :src="avatarURL" />
            <span>{{user.name}}</span>
        </a>
        <a class="button is-primary is-inverted" @click="doLogin" v-else>
            <span class="icon">
            <i class="fab fa-discord"></i>
            </span>
            <span>Login</span>
        </a>
    </span>
</template>

<script>
import OauthService from '@/services/OauthService';

function openWindow (url, w, h, name) {
  const ww = window.outerWidth;
  const wh = window.outerHeight;
  return window.open(url, name, `height=${h},width=${w},left=${ww / 2 - w / 2},top=${wh / 2 - h / 2},location=yes,status=no,titlebar=no,toolbar=no`, true);
}
const oauth2URL = OauthService.getAuthUrl();
export default {
  name: 'TopBar',
  data () {
    return {
    };
  },
  computed: {
    global () {
      return this.$root.$data;
    },
    user () {
      return this.global.user;
    },
    avatarURL () {
      const base = 'https://cdn.discordapp.com/avatars/';
      return `${base}${this.user.id}/${this.user.avatar}.png`;
    }
  },
  methods: {
    async doLogin () {
      const url = (await oauth2URL).data;
      openWindow(url, 500, 500, 'oauth2');
    }
  }
};
</script>
