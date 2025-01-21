const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const apiRouter = require('../routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../docs/swagger');
const {
  serveImages,
  // negotiateImageFormat,
} = require('../middlewares/cdn.middleware');
const path = require('path');
const {
  logger,
  configureLogger,
  createMorganMiddleware,
} = require('../config/logger');

const app = express();

const env = process.env.NODE_ENV || 'development';
const configuredLogger = configureLogger(env);

const helmetConfig = {
  // Protection XSS de base
  xssFilter: true,

  // Désactive la détection automatique du type MIME
  noSniff: true,

  // Configuration CSP pour GraphQL et les ressources statiques
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // for graphql playground
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'], // for images and avatar
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },

  // for clickjacking
  frameguard: {
    action: 'deny',
  },

  // Configuration HSTS
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  nocache: true,

  // for MIME-sniffing
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // for cross-origin attacks
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },

  dnsPrefetchControl: {
    allow: false,
  },

  ieNoOpen: true,

  originAgentCluster: true,
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const domain = req.get('origin') || req.get('referrer');
    const allowedDomains = config.allowedOrigins;
    return allowedDomains.some(
      (allowedDomain) => domain && domain.includes(allowedDomain),
    );
  },
});

const corsOptions = {
  origin: config.allowedOrigins || '<http://localhost:3000>',
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

app.use(helmet(helmetConfig));
app.use(cors(corsOptions));
app.use(express.json());
app.use(createMorganMiddleware(env));
app.use(limiter);
app.use('/api/v1', apiRouter);
// app.use(negotiateImageFormat);
app.use('/storage', serveImages(path.join(__dirname, '../../storage')));

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
    customSiteTitle: 'Zakharmony API Documentation',
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
