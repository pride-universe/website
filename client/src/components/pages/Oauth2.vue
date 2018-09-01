<template>
  <div class="posts">
    {{ status }}
  </div>
</template>

<script>
import OauthService from '@/services/OauthService';

export default {
  name: 'posts',
  data () {
    return {
      error: null,
      status: 'loading'
    };
  },
  mounted () {
    if (!this.$route.query.code) {
      this.status = 'error';
      switch (this.$route.query.error) {
        case 'access_denied':
          this.error = 'Login aborted';
          return;
        default:
          this.error = 'Unkown error';
          return;
      }
    }
    this.status = 'logging in';
    this.loginWithCode(this.$route.query.code);
  },
  methods: {
    async loginWithCode (code) {
      try {
        const response = await OauthService.loginWithCode(code);
        console.log(response);
        this.$root.$data.user = response.data;
        this.status = `Logged in as ${response.data.name} ^_^`;
      } catch (err) {
        this.status = 'Failed to log in';
      }
    }
  }
};
</script>
