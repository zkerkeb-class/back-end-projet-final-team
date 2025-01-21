const helmetConfig = {
  xssFilter: true,

  noSniff: true,

  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", 'https://studio.apollographql.com'],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://studio.apollographql.com',
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://studio.apollographql.com',
      ],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://studio.apollographql.com'],
      connectSrc: [
        "'self'",
        'https://studio.apollographql.com',
        'wss://studio.apollographql.com', // For WebSocket connection
      ],
      fontSrc: ["'self'", 'data:', 'https://studio.apollographql.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", 'https://studio.apollographql.com'],
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

module.exports = helmetConfig;
