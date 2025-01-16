const redis = require('redis');
const logger = require('../utils/loggerUtil');
const config = require('../config');

const REDIS_TIMEOUT = 5000;
const OPERATION_TIMEOUT = 3000;

const client = redis.createClient({
  url: `redis://${config.redis.host || 'localhost'}:${config.redis.port || 6379}`,
  socket: {
    connectTimeout: REDIS_TIMEOUT,
    timeout: OPERATION_TIMEOUT,
  },
});

client.on('connect', () => {
  logger.info('Redis client connected');
});

client.on('ready', () => {
  logger.info('Redis client ready');
});

client.on('error', (err) => {
  logger.error('Redis error:', err);
});

client.on('end', () => {
  logger.info('Redis client disconnected');
});

const connectWithTimeout = () => {
  return Promise.race([
    client.connect(),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Redis connection timeout')),
        REDIS_TIMEOUT,
      ),
    ),
  ]).catch((err) => {
    logger.error('Redis connection failed:', err);
    throw err;
  });
};

// Connect avec timeout
connectWithTimeout().catch(logger.error);

const cacheService = {
  async get(key) {
    try {
      if (!client.isReady) {
        throw new Error('Redis client is not ready');
      }

      const result = await Promise.race([
        client.get(key),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Redis get operation timeout')),
            OPERATION_TIMEOUT,
          ),
        ),
      ]);

      return result ? JSON.parse(result) : null;
    } catch (err) {
      logger.error('Error getting data from cache:', err);
      return null;
    }
  },

  async set(key, value, expiration = 3600) {
    try {
      if (!client.isReady) {
        throw new Error('Redis client is not ready');
      }

      const data = JSON.stringify(value);
      await Promise.race([
        client.set(key, data, {
          EX: expiration,
        }),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Redis set operation timeout')),
            OPERATION_TIMEOUT,
          ),
        ),
      ]);
    } catch (err) {
      logger.error('Error setting data to cache:', err);
    }
  },

  async close() {
    try {
      await client.quit();
      logger.info('Redis connection closed');
    } catch (err) {
      logger.error('Error closing Redis connection:', err);
    }
  },

  async isRedisReady() {
    try {
      await client.ping();
      return true;
    } catch (err) {
      return err;
    }
  },
};

module.exports = cacheService;
