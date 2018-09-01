import Api from '@/services/Api';

export default {
  loginWithCode (code) {
    return Api.post('oauthLogin', {
      code
    });
  },
  getAuthUrl () {
    return Api.get('oauthUrl');
  },
  me () {
    return Api.get('me');
  }
};
