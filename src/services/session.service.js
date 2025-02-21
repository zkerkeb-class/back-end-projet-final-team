const { cacheService } = require('./redisCache.service');

class SessionService {
  constructor() {
    this.sessionPrefix = 'session:';
    this.sessionDuration = 3600; // 1 hour
  }

  async createSession(userId, additionalData = {}) {
    const sessionId = `${this.sessionPrefix}${userId}`;
    const sessionData = {
      userId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ...additionalData,
    };

    await cacheService.set(sessionId, sessionData, this.sessionDuration);
    return sessionData;
  }

  async getSession(userId) {
    const sessionId = `${this.sessionPrefix}${userId}`;
    return await cacheService.get(sessionId);
  }

  async updateSession(userId, updateData = {}) {
    const sessionId = `${this.sessionPrefix}${userId}`;
    const currentSession = await this.getSession(userId);

    if (!currentSession) {
      return null;
    }

    const updatedSession = {
      ...currentSession,
      ...updateData,
      lastActivity: new Date().toISOString(),
    };

    await cacheService.set(sessionId, updatedSession, this.sessionDuration);
    return updatedSession;
  }

  async deleteSession(userId) {
    const sessionId = `${this.sessionPrefix}${userId}`;
    await cacheService.set(sessionId, null, 0);
  }
}

module.exports = new SessionService();
