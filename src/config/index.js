const dotenv = require('dotenv');

const ENV = process.env.NODE_ENV || 'development';

let envFile = '';

switch (ENV) {
  case 'development':
    envFile = 'env/.env.dev';
    break;
  case 'production':
    envFile = 'env/.env.prod';
    break;
  case 'test':
    envFile = 'env/.env.test';
    break;
  default:
    envFile = 'env/.env.dev';
}

dotenv.config({ path: envFile });

const {
  PORT,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  ALLOWED_ORIGINS,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
} = process.env;

if (
  (!PORT,
  !DB_HOST,
  !DB_PORT,
  !DB_NAME,
  !DB_USER,
  !DB_PASSWORD,
  !ALLOWED_ORIGINS,
  !JWT_SECRET,
  !JWT_REFRESH_SECRET)
) {
  throw new Error('Some environment variables are missing');
}

const config = {
  env: ENV,
  port: PORT,
  db: {
    host: DB_HOST,
    port: DB_PORT,
    name: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
  },
  allowedOrigins: ALLOWED_ORIGINS.split(','),
  jwtSecret: JWT_SECRET,
  jwtRefreshSecret: JWT_REFRESH_SECRET,
};

module.exports = config;
