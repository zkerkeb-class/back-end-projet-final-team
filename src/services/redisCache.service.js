const Redis = require('ioredis');
const { logger } = require('../config/logger');

class RedisCacheService {
  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });

    this.client.on('connect', () => {
      logger.info('Connected to Redis');
    });
  }

  async isRedisReady() {
    try {
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }

  async set(key, value, expiration = 3600) {
    try {
      const serializedValue = JSON.stringify(value);
      if (expiration) {
        await this.client.setex(key, expiration, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      logger.error('Redis set error:', error);
      return false;
    }
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  }

  getClient() {
    return this.client;
  }
}

const redisCacheService = new RedisCacheService();
module.exports = {
  redisClient: redisCacheService.getClient(),
  cacheService: redisCacheService,
};
