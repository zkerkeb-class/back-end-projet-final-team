const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const apiRouter = require('../routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../docs/swagger');
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
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
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
app.use('/api/v1', apiRouter);

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

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Spotify Clone API Documentation',
    customfavIcon: '/assets/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      deepLinking: true,
    },
  }),
);

module.exports = { app, logger };
