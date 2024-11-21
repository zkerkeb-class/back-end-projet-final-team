const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const {
  logger,
  configureLogger,
  createMorganMiddleware,
} = require('../config/logger');

const app = express();

const env = process.env.NODE_ENV || 'development';
const configuredLogger = configureLogger(env);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const corsOptions = {
  origin: config.allowedOrigins || '<http://localhost:3000>',
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(createMorganMiddleware(env));
app.use(limiter);

app.use((req, _res, next) => {
  configuredLogger.info(`Request received: ${req.method} ${req.url}`);
  next();
});

app.use((err, req, res, _next) => {
  configuredLogger.error(`Error: ${err.message}\nStack: ${err.stack}`, {
    method: req.method,
    path: req.path,
    body: req.body,
  });

  res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred',
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = { app, logger };
