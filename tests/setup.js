// Configuration for Jest tests timeout
jest.setTimeout(10000);

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRATION = '1h';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret';
process.env.REFRESH_TOKEN_EXPIRATION = '7d';

// Mock Redis
jest.mock('../src/services/redisCache.service', () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(null),
  del: jest.fn().mockResolvedValue(null),
}));
