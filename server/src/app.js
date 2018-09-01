const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const DiscordSession = require('./discordSession');
const { getAuthUrl } = require('./discordAPI');
const app = express();
const { Client } = require('node-ipc-requests');
const cookieParser = require('cookie-parser');
const JWT = require('./jwt');
const ipcClient = new Client('pridebot');
ipcClient.start();

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors({allowedHeaders: ['X-jwt', 'Content-Type'], exposedHeaders: ['X-jwt', 'Content-Type']}));
app.use(cookieParser());

app.get('/posts', (req, res) => {
  res.send(
    [{
      title: 'Hello World!',
      description: 'Hi there! How are you?'
    }]
  );
});

app.get('/oauthUrl', async (req, res) => {
  res.send(getAuthUrl());
});

app.post('/oauthLogin', async (req, res, next) => {
  try {
    const session = await DiscordSession.instanceFromCallback(req);
    res.header('X-jwt', session.JWT);
    res.send({id: session.userId, name: await session.getUsername()});
  } catch (err) {
    next(err);
  }
});

app.get('/me', JWT(true),
  async (req, res, next) => {
    try {
      const apiRes = await req.discordSession.api.me();
      if (apiRes.status !== 200) {
        const err = new Error(apiRes.statusText);
        err.code = apiRes.status;
        throw err;
      }
      res.send({
        id: apiRes.body.id,
        avatar: apiRes.body.avatar,
        name: apiRes.body.username,
        discriminator: apiRes.body.discriminator,
        locale: apiRes.body.locale
      });
    } catch (err) {
      next(err);
    }
  });
const guilds = {
  BRU: '448171713444708362'
};

app.get('/members/me', JWT(true), async (req, res, next) => {
  try {
    res.send(await ipcClient.request('me', {
      loginUser: req.discordSession.userId
    }));
  } catch (err) {
    next(err);
  }
});

app.get('/guilds/:guild/members', JWT(true),
  async (req, res, next) => {
    try {
      const guild = guilds[req.params.guild];
      if (!guild) throw new Error('Unknown guild');
      res.send(await ipcClient.request('members', {
        guild,
        loginUser: req.discordSession.userId
      }));
    } catch (err) {
      next(err);
    }
  });

app.get('/guilds/:guild/roles', JWT(true),
  async (req, res, next) => {
    try {
      const guild = guilds[req.params.guild];
      if (!guild) throw new Error('Unknown guild');
      res.send(await ipcClient.request('roles', {
        guild,
        loginUser: req.discordSession.userId
      }));
    } catch (err) {
      next(err);
    }
  });

app.listen(process.env.PORT || 8081);
