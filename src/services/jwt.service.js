const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/loggerUtil');

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      user_type: user.user_type,
      roles: user.Roles?.map((role) => role.name),
    },
    config.jwtSecret,
    { expiresIn: '5h', audience: 'zakharmonie', issuer: 'auth0' },
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, config.jwtRefreshSecret, {
    expiresIn: '7d',
  });
};

const verifyToken = (token, options = {}) => {
  try {
    const defaultOptions = {
      audience: 'zakharmonie',
      issuer: 'auth0',
      ...options,
    };

    return jwt.verify(token, config.jwtSecret, defaultOptions);
  } catch (err) {
    logger.error(err.message);
    return null;
  }
};

module.exports = { generateAccessToken, verifyToken, generateRefreshToken };
