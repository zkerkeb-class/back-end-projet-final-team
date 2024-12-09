const { verifyToken } = require('../services/jwt.service');
const logger = require('../utils/loggerUtil');

const isAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const payload = await verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    logger.error(error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = isAuth;
