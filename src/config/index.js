const dotenv = require('dotenv');
const ENV = process.env.NODE_ENV || 'development';

// Load .env from root directory
dotenv.config();

const requiredEnvVars = [
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'ALLOWED_ORIGINS',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET',
  'AWS_CDN_URL',
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_PASSWORD',
  'SECRET_SESSION',
  'COOKIE_SECRET',
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing environment variables: ${missingEnvVars.join(', ')}`,
  );
}

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
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET,
  AWS_CDN_URL,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  SECRET_SESSION,
  COOKIE_SECRET,
} = process.env;

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
  allowedOrigins:
    ENV === 'development'
      ? ALLOWED_ORIGINS.split(',').concat('http://localhost:3000')
      : ALLOWED_ORIGINS.split(','),
  jwtSecret: JWT_SECRET,
  jwtRefreshSecret: JWT_REFRESH_SECRET,
  cookieSecret: COOKIE_SECRET,
  aws: {
    region: AWS_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    bucket: AWS_S3_BUCKET,
    cdnUrl: AWS_CDN_URL,
  },
  redis: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    secretSession: SECRET_SESSION,
  },
};

module.exports = config;
