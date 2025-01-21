const si = require('systeminformation');
const fs = require('fs-extra');
const path = require('path');
const { logger } = require('../config/logger');

class MonitoringService {
  constructor() {
    this.metrics = {
      cpu: null,
      memory: null,
      responseTime: [],
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
      const cpuData = await si.currentLoad();
      this.metrics.cpu = {
        load: cpuData.currentLoad,
        cores: cpuData.cpus.map((core) => core.load),
      };

      const memData = await si.mem();
      this.metrics.memory = {
        total: memData.total,
        used: memData.used,
        free: memData.free,
        usedPercent: (memData.used / memData.total) * 100,
      };

      await this.updateLogMetrics();

      logger.debug('Metrics updated successfully');
    } catch (error) {
      logger.error('Error updating metrics:', error);
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

  getMetrics() {
    return {
      ...this.metrics,
      timestamp: Date.now(),
    };
  }
}

module.exports = new MonitoringService();
