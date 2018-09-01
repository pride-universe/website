const { PRIV_KEY, PUB_KEY, alg } = require('./KeysRSA');
const { KJUR } = require('jsrsasign');
const { discord: discordSecrets } = require('../secrets');
const { redirectUri } = require('../config').discord;
const ClientOAuth2 = require('client-oauth2');
const DiscordAPI = require('./discordAPI');

const discordOauth = new ClientOAuth2({
  clientId: discordSecrets.clientId,
  clientSecret: discordSecrets.clientSecret,
  accessTokenUri: 'https://discordapp.com/api/oauth2/token',
  authorizationUri: 'https://discordapp.com/api/oauth2/authorize',
  redirectUri: redirectUri,
  scopes: ['identify']
});

function decrypt (str) {
  return KJUR.crypto.Cipher.decrypt(str, PRIV_KEY);
}

function encrypt (str) {
  return KJUR.crypto.Cipher.encrypt(str, PUB_KEY);
}

class DiscordSession {
  constructor (data, userId, name) {
    Reflect.defineProperty(this, '_userId', { value: null, writable: true });
    Reflect.defineProperty(this, '_accessToken', { value: null, writable: true });
    Reflect.defineProperty(this, '_accessTokenEnc', { value: null, writable: true });
    Reflect.defineProperty(this, '_refreshToken', { value: null, writable: true });
    Reflect.defineProperty(this, '_refreshTokenEnc', { value: null, writable: true });
    Reflect.defineProperty(this, '_refreshAt', { value: null, writable: true });
    Reflect.defineProperty(this, '_scope', { value: null, writable: true });
    Reflect.defineProperty(this, '_type', { value: null, writable: true });
    Reflect.defineProperty(this, '_token', { value: null, writable: true });
    Reflect.defineProperty(this, '_jws', { value: null, writable: true });
    this.api = new DiscordAPI(this);
    if (typeof data === 'object') {
      if (!userId) throw new Error('When creating using a token-object, userId must be specified');
      this.token = data;
      this._userId = userId;
      this._name = name;
    } else if (typeof data === 'string') {
      this.JWT = data;
    }
  }
  get accessToken () {
    if (!this._accessToken) {
      if (!this._accessTokenEnc) return undefined;
      this._accessToken = decrypt(this._accessTokenEnc);
    }
    return this._accessToken;
  }
  set accessToken (val) {
    if (this._accessToken === val) return;
    this._jws = null;
    this._accessTokenEnc = null;
    this._token = null;
    this._accessToken = val;
  }
  get refreshToken () {
    if (!this._refreshToken) {
      if (!this._refreshTokenEnc) return undefined;
      this._refreshToken = decrypt(this._refreshTokenEnc);
    }
    return this._refreshToken;
  }
  set refreshToken (val) {
    if (this._refreshToken !== val) return;
    this._jws = null;
    this._refreshTokenEnc = null;
    this._token = null;
    this._refreshToken = val;
  }
  get accessTokenEnc () {
    if (!this._accessTokenEnc) {
      if (!this._accessToken) return undefined;
      this._accessTokenEnc = encrypt(this._accessToken);
    }
    return this._accessTokenEnc;
  }
  set accessTokenEnc (val) {
    if (this._accessTokenEnc === val) return;
    this._jws = null;
    this._accessToken = null;
    this._token = null;
    this._accessTokenEnc = val;
  }
  get refreshTokenEnc () {
    if (!this._refreshTokenEnc) {
      if (!this._refreshToken) return undefined;
      this._refreshTokenEnc = encrypt(this._refreshToken);
    }
    return this._refreshTokenEnc;
  }
  set refreshTokenEnc (val) {
    if (this._refreshTokenEnc === val) return;
    this._jws = null;
    this._refreshToken = null;
    this._token = null;
    this._refreshTokenEnc = val;
  }
  get scope () {
    return this._scope;
  }
  get type () {
    return this._type;
  }
  get userId () {
    return this._userId;
  }
  get refreshAt () {
    return this._refreshAt;
  }
  async getUsername () {
    if (!this._name) this._name = (await this.api.me()).username;
    return this._name;
  }
  get JWT () {
    if (!this._jws) {
      const headerString = JSON.stringify({alg});
      const payloadString = JSON.stringify({
        userId: this.userId,
        accessTokenEnc: this.accessTokenEnc,
        refreshTokenEnc: this.refreshTokenEnc,
        refreshAt: this.refreshAt,
        type: this.type,
        scope: this.scope
      });
      this._jws = KJUR.jws.JWS.sign(alg, headerString, payloadString, PRIV_KEY);
    }
    return this._jws;
  }
  set JWT (val) {
    if (this._jws === val) return;
    if (!KJUR.jws.JWS.verify(val, PUB_KEY, [alg])) {
      throw new Error('INVALID JWS SIGNATURE');
    }
    const { payloadObj: payload } = KJUR.jws.JWS.parse(val);
    if (this.userId && payload.userId !== this.userId) throw new Error('Cannot change userId of existing login');
    this._userId = null;
    this._accessToken = null;
    this._accessTokenEnc = null;
    this._refreshToken = null;
    this._refreshTokenEnc = null;
    this._refreshAt = null;
    this._scope = null;
    this._type = null;
    this._token = null;
    this._jws = null;

    this._userId = payload.userId;
    this._accessTokenEnc = payload.accessTokenEnc;
    this._refreshTokenEnc = payload.refreshTokenEnc;
    this._refreshAt = payload.refreshAt;
    this._scope = payload.scope;
    this._type = payload.type;
    this._jws = val;
  }
  get token () {
    if (!this._token) {
      const refreshAt = new Date(this.refreshAt);
      const expiresIn = Math.max(0, Math.round((refreshAt.getTime() - new Date().getTime()) / 1000));
      this._token = discordOauth.createToken(this.accessToken, this.refreshToken, this.type, { scope: this.scope.join(), expires_in: expiresIn });
      this._token.expiresIn(new Date(this.refreshAt));
    }
    return this._token;
  }
  set token (val) {
    if (this._token === val) return;
    this._accessToken = val.accessToken;
    this._accessTokenEnc = null;
    this._refreshToken = val.refreshToken;
    this._refreshTokenEnc = null;
    this._refreshAt = val.expires.getTime();
    this._scope = val.data.scope.split();
    this._type = val.tokenType;
    this._token = val;
    this._jws = null;
  }

  async refreshIfNeeded () {
    if (this.refreshAt > new Date().getTime()) {
      return false;
    } else {
      try {
        const newToken = await this.token.refresh();
        this.token = newToken;
        return true;
      } catch (err) {
        return null;
      }
    }
  }

  static async instanceFromCallback (req) {
    const referrer = req.headers.referrer || `${redirectUri}?code=${encodeURIComponent(req.body.code)}`;
    const token = await discordOauth.code.getToken(referrer);
    const { id: userId, username: name } = (await DiscordAPI.me(token)).body;
    return new this(token, userId, name);
  }
}

module.exports = DiscordSession;
