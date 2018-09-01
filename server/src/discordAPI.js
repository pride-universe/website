const popsicle = require('popsicle');
const querystring = require('querystring');
const { api: BASE_URL, redirectUri } = require('../config').discord;
const { discord: secrets } = require('../secrets');

class DiscordAPI {
  constructor (session) {
    this.session = session;
  }

  async request (options) {
    options.url = BASE_URL + options.url;
    options = this.session.token.sign(options);
    return popsicle.request(options)
      .use(popsicle.plugins.parse('json'));
  }

  get (url, options) {
    if (typeof url === 'object') options = url;
    if (typeof options !== 'object') options = {};
    options.url = url || options.url;
    options.method = 'GET';
    return this.request(options);
  }

  me () {
    return this.get('/users/@me');
  }

  user (userId) {
    return this.get('/users/' + userId);
  }

  static me (token) {
    return this.prototype.request.call({session: { token }}, {url: '/users/@me', method: 'GET'});
  }

  static getAuthUrl () {
    const base = 'https://discordapp.com/api/oauth2/authorize?';
    const query = querystring.stringify({
      client_id: secrets.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: ['identify'].join()
    });
    return base + query;
  }
}

module.exports = DiscordAPI;
