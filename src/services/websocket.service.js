const socketIo = require('socket.io');
const monitoringService = require('./monitoring.service');
const { logger } = require('../config/logger');

class WebSocketService {
  constructor() {
    this.io = null;
    this.adminNamespace = null;
  }

  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin:
          process.env.NODE_ENV === 'production'
            ? process.env.ALLOWED_ORIGINS.split(',')
            : ['http://localhost:3000'],
        credentials: true,
      },
    });

    this.adminNamespace = this.io.of('/admin');

    this.adminNamespace.use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (this.isAdmin(token)) {
        next();
      } else {
        next(new Error('Unauthorized - Admin access required'));
      }
    });

    this.adminNamespace.on('connection', (socket) => {
      logger.info(`Admin connected to monitoring: ${socket.id}`);

      socket.emit('metrics', monitoringService.getMetrics());

      const metricsInterval = setInterval(() => {
        socket.emit('metrics', monitoringService.getMetrics());
      }, 5000);

      socket.on('disconnect', () => {
        clearInterval(metricsInterval);
        logger.info(`Admin disconnected from monitoring: ${socket.id}`);
      });
    });

    monitoringService.start();
  }

  isAdmin(token) {
    try {
      if (!token) {
        return false;
      }
      return true;
    } catch (error) {
      logger.error('Error verifying admin token:', error);
      return false;
    }
  }

  shutdown() {
    if (this.io) {
      this.io.close();
    }
    monitoringService.stop();
  }
}

module.exports = new WebSocketService();
