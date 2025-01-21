const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const config = require('../config');
const apiRouter = require('../routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../docs/swagger');
const helmetConfig = require('../config/helmet');
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
const isProd = env === 'production';

// CSRF Configuration - only in prod
const csrfMiddleware = csrf({
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
  },
});

// Middleware pour gérer la protection CSRF
const csrfProtection = (req, res, next) => {
  if (!isProd) {
    return next();
  }

  // En production, appliquer la protection CSRF
  if (req.method === 'GET' || req.path.startsWith('/api/v1/auth/')) {
    if (req.method === 'GET' && !req.path.startsWith('/api/v1/auth/')) {
      csrfMiddleware(req, res, () => {
        res.cookie('XSRF-TOKEN', req.csrfToken(), {
          httpOnly: false,
          secure: true,
          sameSite: 'strict',
        });
        next();
      });
    } else {
      next();
    }
  } else {
    csrfMiddleware(req, res, next);
  }
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
  allowedHeaders: ['Content-Type', 'Authorization', 'CSRF-Token'],
  credentials: true, // Important for CSRF
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

app.use(helmet(helmetConfig));
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser(config.cookieSecret));
app.use(createMorganMiddleware(env));
app.use(limiter);

// Apply CSRF protection only in prod
if (isProd) {
  app.use(csrfProtection);

  app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid CSRF token',
      });
    }
    next(err);
  });
}

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

// Test route for monitoring, only in dev mod
if (process.env.NODE_ENV !== 'production') {
  app.get('/monitoring-test', (_req, res) => {
    res.sendFile(path.join(__dirname, '../public/monitoring-test.html'));
  });
}

module.exports = { app, logger };
