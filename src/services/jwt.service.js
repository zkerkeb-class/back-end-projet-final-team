const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/loggerUtil');

const generateToken = (payload, options = {}) => {
  const defaultOptions = {
    expiresIn: '24h',
    audience: 'zakharmonie',
    issuer: 'auth0',
    ...options,
  };

  return jwt.sign(payload, config.jwtSecret, defaultOptions);
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

module.exports = { generateToken, verifyToken };
