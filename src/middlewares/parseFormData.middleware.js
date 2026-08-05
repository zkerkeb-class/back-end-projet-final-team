const logger = require('../utils/loggerUtil');

const parseFormData = (req, res, next) => {
  if (req.body.data) {
    try {
      req.body = { ...JSON.parse(req.body.data) };
    } catch (error) {
      logger.error(error);
      return res.status(400).json({ message: 'Invalid JSON in form data' });
    }
  }
  next();
};

module.exports = parseFormData;
