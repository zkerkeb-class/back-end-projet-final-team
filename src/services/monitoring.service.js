const si = require('systeminformation');
const fs = require('fs-extra');
const path = require('path');
const { logger } = require('../config/logger');
const { client: redisClient } = require('../services/redisCache.service');
const { User } = require('../models');
const { Op } = require('sequelize');

class MonitoringService {
  constructor() {
    this.metrics = {
      cpu: null,
      memory: null,
      responseTime: [],
      redis: {
        latency: 0,
        connected: false,
      },
      network: {
        bandwidth: 0,
        bytesIn: 0,
        bytesOut: 0,
      },
      storage: {
        total: 0,
        used: 0,
        free: 0,
      },
      users: {
        active: 0,
        total: 0,
      },
      processing: {
        averageTime: 0,
        queue: 0,
      },
      streams: {
        active: 0,
        total: 0,
      },
      logs: {
        errorCount: 0,
        totalRequests: 0,
        recentErrors: [],
        requestsPerMinute: 0,
        successRate: 100,
      },
    };
    this.updateInterval = 5000;
    this.logPath = path.join(process.cwd(), 'logs');
    this.errorLogPath = path.join(this.logPath, 'error.log');
    this.combinedLogPath = path.join(this.logPath, 'combined.log');
    this.lastLogCheck = Date.now();
    this.mediaProcessingTimes = [];
  }

  async start() {
    this.interval = setInterval(async () => {
      await this.updateMetrics();
    }, this.updateInterval);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  async updateMetrics() {
    try {
      const cpuData = (await si.currentLoad()) || { currentLoad: 0, cpus: [] };
      const memData = (await si.mem()) || { total: 0, used: 0, free: 0 };
      const networkStats = (await si.networkStats()) || [
        {
          tx_sec: 0,
          rx_sec: 0,
          rx_bytes: 0,
          tx_bytes: 0,
        },
      ];
      const fsSize = (await si.fsSize()) || [
        {
          size: 0,
          used: 0,
          available: 0,
          use: 0,
        },
      ];

      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const activeUsers = await User.count({
        where: {
          last_login: {
            [Op.gte]: fifteenMinutesAgo,
          },
        },
      });

      this.metrics.cpu = {
        load: cpuData.currentLoad || 0,
        cores: cpuData.cpus.map((core) => core.load || 0),
      };

      this.metrics.memory = {
        total: memData.total || 0,
        used: memData.used || 0,
        free: memData.free || 0,
        usedPercent: memData.total ? (memData.used / memData.total) * 100 : 0,
      };

      this.metrics.network = {
        bandwidth: networkStats[0].tx_sec + networkStats[0].rx_sec || 0,
        bytesIn: networkStats[0].rx_bytes || 0,
        bytesOut: networkStats[0].tx_bytes || 0,
      };

      const mainDisk = fsSize.find((fs) => fs.mount === '/') ||
        fsSize[0] || {
        size: 0,
        used: 0,
        available: 0,
        use: 0,
      };
      this.metrics.storage = {
        total: mainDisk.size || 0,
        used: mainDisk.used || 0,
        free: mainDisk.available || 0,
        usedPercent: mainDisk.use || 0,
      };

      this.metrics.users = {
        active: activeUsers || 0,
        total: await this.getTotalUsers(),
      };

      await this.checkRedisLatency();
      await this.updateLogMetrics();
      await this.simulateStreamData();
      await this.simulateMediaProcessing();

      logger.debug('Metrics updated successfully');
    } catch (error) {
      logger.error('Error updating metrics:', error);
    }
  }

  async checkRedisLatency() {
    try {
      const start = Date.now();
      await redisClient.ping();
      const end = Date.now();
      this.metrics.redis = {
        latency: end - start,
        connected: true,
      };
    } catch (error) {
      this.metrics.redis = {
        latency: 0,
        connected: false,
      };
      logger.error('Redis latency check failed:', error);
    }
  }

  async updateLogMetrics() {
    try {
      const currentTime = Date.now();
      const timeWindow = currentTime - this.lastLogCheck;

      const errorContent = await this.getNewLogContent(this.errorLogPath);
      const combinedContent = await this.getNewLogContent(this.combinedLogPath);

      const newErrors = this.parseLogContent(errorContent);
      this.metrics.logs.errorCount += newErrors.length;

      this.metrics.logs.recentErrors = [
        ...newErrors,
        ...this.metrics.logs.recentErrors,
      ].slice(0, 10);

      const allRequests = this.parseLogContent(combinedContent);
      const newRequestCount = allRequests.length;
      this.metrics.logs.totalRequests += newRequestCount;

      this.metrics.logs.requestsPerMinute = Math.round(
        (newRequestCount * 60000) / timeWindow,
      );

      if (newRequestCount > 0) {
        const successCount = newRequestCount - newErrors.length;
        this.metrics.logs.successRate = Math.round(
          (successCount / newRequestCount) * 100,
        );
      }

      this.lastLogCheck = currentTime;
    } catch (error) {
      logger.error('Error updating log metrics:', error);
    }
  }

  async getNewLogContent(logPath) {
    try {
      if (!(await fs.pathExists(logPath))) {
        return '';
      }
      const content = await fs.readFile(logPath, 'utf8');
      return content
        .split('\n')
        .filter((line) => {
          try {
            const logEntry = JSON.parse(line);
            return new Date(logEntry.timestamp).getTime() > this.lastLogCheck;
          } catch {
            return false;
          }
        })
        .join('\n');
    } catch (error) {
      logger.error(`Error reading log file ${logPath}:`, error);
      return '';
    }
  }

  parseLogContent(content) {
    return content
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter((log) => log !== null);
  }

  addResponseTime(time) {
    this.metrics.responseTime.push({
      time,
      timestamp: Date.now(),
    });
  }

  addMediaProcessingTime(duration) {
    this.mediaProcessingTimes.push(duration);
    if (this.mediaProcessingTimes.length > 100) {
      this.mediaProcessingTimes.shift();
    }
    this.metrics.processing.averageTime =
      this.mediaProcessingTimes.reduce((a, b) => a + b, 0) /
      this.mediaProcessingTimes.length;
  }

  updateStreamCount(active, total) {
    this.metrics.streams = {
      active,
      total,
    };
  }

  getMetrics() {
    return {
      ...this.metrics,
      timestamp: Date.now(),
    };
  }

  async getTotalUsers() {
    try {
      return await User.count();
    } catch (error) {
      logger.error('Error getting total users:', error);
      return 0;
    }
  }

  async simulateStreamData() {
    this.metrics.streams = {
      active: Math.floor(Math.random() * 10),
      total: 100 + Math.floor(Math.random() * 50),
    };
  }

  async simulateMediaProcessing() {
    this.metrics.processing = {
      averageTime: 100 + Math.floor(Math.random() * 900),
      queue: Math.floor(Math.random() * 5),
    };
  }
}

module.exports = new MonitoringService();
