const { logger } = require('../config/logger');

module.exports = class LoggerUtil {
  static info(msg, meta = {}) {
    logger.info(msg, meta);
  }

  static error(msg, meta = {}) {
    logger.error(msg, meta);
  }

  static warn(msg, meta = {}) {
    logger.warn(msg, meta);
  }

  static debug(msg, meta = {}) {
    logger.debug(msg, meta);
  }

  static log(level, msg, context = {}) {
    logger.log({
      level,
      msg,
      ...context,
    });
  }
};
