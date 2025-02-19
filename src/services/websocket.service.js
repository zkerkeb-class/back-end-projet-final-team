const socketIo = require('socket.io');
const monitoringService = require('./monitoring.service');
const jamSessionService = require('./jamSession.service');
const { logger } = require('../config/logger');

class WebSocketService {
  constructor() {
    this.io = null;
    this.adminNamespace = null;
    this.jamNamespace = null;
  }

  initialize(server) {
    this.setupServer(server);
    this.setupNamespaces();
    monitoringService.start();
  }

  setupServer(server) {
    this.io = socketIo(server, {
      cors: {
        origin: ['http://localhost:3000', 'http://localhost:8080'],
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ['Authorization', 'Content-Type'],
      },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      allowEIO3: true,
    });
  }

  setupNamespaces() {
    this.setupJamNamespace();
    this.setupAdminNamespace();
  }

  setupJamNamespace() {
    this.jamNamespace = this.io.of('/jam');

    // Middleware d'authentification simplifié pour le namespace /jam
    this.jamNamespace.use((socket, next) => {
      const { userId, roomId } = socket.handshake.auth;

      if (!userId || !roomId) {
        return next(new Error('userId and roomId are required'));
      }
      next();
    });

    // Initialiser le service JamSession avec le namespace
    jamSessionService.initialize(this.jamNamespace);
  }

  setupAdminNamespace() {
    this.adminNamespace = this.io.of('/admin');

    this.adminNamespace.use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (this.isAdmin(token)) {
        next();
      } else {
        next(new Error('Unauthorized - Admin access required'));
      }
    });

    this.adminNamespace.on('connection', this.handleAdminConnection.bind(this));
  }

  handleAdminConnection(socket) {
    logger.info(`Admin connected to monitoring: ${socket.id}`);

    socket.emit('metrics', monitoringService.getMetrics());

    const metricsInterval = setInterval(() => {
      socket.emit('metrics', monitoringService.getMetrics());
    }, 5000);

    socket.on('disconnect', () => {
      clearInterval(metricsInterval);
      logger.info(`Admin disconnected from monitoring: ${socket.id}`);
    });
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
      jamSessionService.shutdown();
      monitoringService.stop();
      this.io.close();
    }
  }
}

module.exports = new WebSocketService();
