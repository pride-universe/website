module.exports = {
  discord: {
    api: 'https://discordapp.com/api/v6',
    redirectUri: process.env.NODE_ENV === 'production' ? 'https://puc.lgbt/oauth2' : 'http://localhost:8080/oauth2'
  }
};
