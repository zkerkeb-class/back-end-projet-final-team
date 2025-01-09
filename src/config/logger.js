const winston = require('winston');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const logDir = path.join(__dirname, '../../logs');
fs.mkdirSync(logDir, { recursive: true });

const logFormat = {
  console: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf((info) => {
      const { timestamp, level, message, ...meta } = info;
      const metaString = Object.keys(meta).length
        ? JSON.stringify(meta, null, 2)
        : '';
      return `${timestamp} ${level}: ${message} ${metaString}`;
    }),
  ),
  file: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
  ),
};

const logger = winston.createLogger({
  level: 'info',
  format: logFormat.file,
  transports: [
    new winston.transports.Console({
      format: logFormat.console,
    }),

    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),

    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

const configureLogger = (env) => {
  logger.configure({
    transports: [
      new winston.transports.Console({
        format: logFormat.console,
        level: env === 'production' ? 'warn' : 'debug',
      }),

      ...(env !== 'test'
        ? [
            new winston.transports.File({
              filename: path.join(logDir, 'error.log'),
              level: 'error',
              maxsize: 5242880,
              maxFiles: 5,
            }),
            new winston.transports.File({
              filename: path.join(logDir, 'combined.log'),
              maxsize: 5242880,
              maxFiles: 5,
            }),
          ]
        : []),
    ],
  });

  return logger;
};

const morganStream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

const morganFormats = {
  development: 'dev',
  production: 'combined',
  test: 'tiny',
};

const createMorganMiddleware = (env = 'development') => {
  return morgan(morganFormats[env] || 'dev', {
    stream: morganStream,
    skip: (req, res) => {
      return env === 'production' && res.statusCode < 400;
    },
  });
};

module.exports = {
  logger,
  configureLogger,
  createMorganMiddleware,
};
