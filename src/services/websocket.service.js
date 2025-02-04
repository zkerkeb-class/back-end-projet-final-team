const socketIo = require('socket.io');
const monitoringService = require('./monitoring.service');
const { logger } = require('../config/logger');
const jwt = require('jsonwebtoken');
const config = require('../config');

class WebSocketService {
  constructor() {
    this.io = null;
    this.adminNamespace = null;
    this.connectedAdmins = new Set();
  }

  initialize(server) {
    if (!server) {
      logger.error('Server instance is required for WebSocket initialization');
      return false;
    }

    try {
      // Configuration de base de Socket.IO avec CORS explicite
      this.io = socketIo(server, {
        cors: {
          origin: ['http://localhost:3000'],
          methods: ['GET', 'POST'],
          credentials: true,
          allowedHeaders: ['Content-Type', 'Authorization'],
        },
        path: '/socket.io',
        transports: ['websocket'],
        pingTimeout: 10000,
        pingInterval: 5000,
        connectTimeout: 10000,
      });

      logger.info('Socket.IO server created with CORS configuration');

      // Configuration globale pour tous les namespaces
      this.io.use((socket, next) => {
        logger.info('New socket connection attempt');
        next();
      });

      // Création du namespace admin
      this.adminNamespace = this.io.of('/admin');
      logger.info('Admin namespace created successfully');

      // Configuration du middleware d'authentification
      this.setupAdminNamespace();

      // Démarrage du service de monitoring
      monitoringService.start();
      logger.info('Monitoring service started');

      // Log des namespaces actifs
      const namespaces = Array.from(this.io._nsps.keys());
      logger.info('Active namespaces:', namespaces);

      return true;
    } catch (error) {
      logger.error('Failed to initialize WebSocket service:', error);
      return false;
    }
  }

  setupAdminNamespace() {
    if (!this.adminNamespace) {
      throw new Error('Admin namespace not initialized');
    }

    // Middleware d'authentification pour le namespace admin
    this.adminNamespace.use(async (socket, next) => {
      try {
        logger.info('Auth attempt on admin namespace');
        const token = socket.handshake.auth.token;
        
        // En mode développement, on accepte le token de test
        if (process.env.NODE_ENV !== 'production') {
          if (token === 'test-token') {
            socket.user = { id: 'test-admin', isAdmin: true };
            logger.info('Test admin authenticated in development mode');
            return next();
          }
        }

        if (!token) {
          logger.warn('No token provided for WebSocket connection');
          return next(new Error('Authentication token is required'));
        }

        const decoded = await this.verifyToken(token);
        if (!decoded || !decoded.isAdmin) {
          logger.warn('Non-admin user tried to connect');
          return next(new Error('Unauthorized - Admin access required'));
        }

        socket.user = decoded;
        logger.info(`Admin authenticated: ${decoded.id}`);
        next();
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    // Gestion des connexions au namespace admin
    this.adminNamespace.on('connection', (socket) => {
      this.connectedAdmins.add(socket.id);
      logger.info(`Admin connected to monitoring: ${socket.id}`);

      // Envoi initial des métriques
      try {
        const initialMetrics = monitoringService.getMetrics();
        logger.debug('Initial metrics:', initialMetrics);
        socket.emit('metrics', initialMetrics);
        logger.debug('Initial metrics sent to admin');

        // Intervalle d'envoi des métriques
        const metricsInterval = setInterval(async () => {
          if (this.connectedAdmins.has(socket.id)) {
            try {
              // Force une mise à jour des métriques
              await monitoringService.updateMetrics();
              const metrics = monitoringService.getMetrics();
              logger.debug('Updated metrics:', metrics);
              socket.emit('metrics', metrics);
              logger.debug('Metrics sent to admin');
            } catch (error) {
              logger.error('Error sending metrics:', error);
            }
          }
        }, 5000);

        // Gestion de la déconnexion
        socket.on('disconnect', (reason) => {
          this.connectedAdmins.delete(socket.id);
          clearInterval(metricsInterval);
          logger.info(`Admin disconnected from monitoring: ${socket.id}, reason: ${reason}`);
        });

        // Gestion des erreurs
        socket.on('error', (error) => {
          logger.error(`WebSocket error for admin ${socket.id}:`, error);
        });
      } catch (error) {
        logger.error('Error in connection handler:', error);
      }
    });
  }

  async verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'development-secret');
    } catch (error) {
      logger.error('Token verification failed:', error);
      return null;
    }
  }

  shutdown() {
    if (this.io) {
      this.io.close();
      this.connectedAdmins.clear();
      logger.info('WebSocket connections closed');
    }
    monitoringService.stop();
    logger.info('WebSocket service shut down successfully');
  }
}

module.exports = new WebSocketService();
