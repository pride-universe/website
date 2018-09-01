import Api from '@/services/Api';

export default {
  members (guild) {
    return Api.get(`guilds/${guild}/members`);
  }
};
