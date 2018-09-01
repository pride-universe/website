const UnauthorizedError = require('./errors/UnauthorizedError');
const unless = require('express-unless');
const DiscordSession = require('./discordSession');

module.exports = function (required) {
  var middleware = async function (req, res, next) {
    let token;
    if (req.headers && req.headers['x-jwt']) {
      token = req.headers['x-jwt'];
    }

    if (!token) {
      if (required) {
        return next(new UnauthorizedError('credentials_required', { message: 'No authorization token was found' }));
      } else {
        return next();
      }
    }

    var session;

    try {
      session = new DiscordSession(token);
      const refreshed = await session.refreshIfNeeded();
      if (refreshed) res.header('X-jwt', session.JWT);
      if (refreshed === null) {
        session = null;
        throw new UnauthorizedError('credentials_required', { message: 'Failed to refresh token' });
      }
    } catch (err) {
      if (required) {
        return next(new UnauthorizedError('credentials_required', { message: 'No authorization token was found' }));
      } else {
        return next();
      }
    }
    if (session) {
      req.discordSession = session;
    }
    next();
  };

  middleware.unless = unless;
  middleware.UnauthorizedError = UnauthorizedError;

  return middleware;
};

module.exports.UnauthorizedError = UnauthorizedError;
