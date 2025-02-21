const { logger } = require('../config/logger');
const JamRoom = require('../models/jamRoom.model');
const JamParticipant = require('../models/jamParticipant.model');
const User = require('../models/user.model');

class JamSessionService {
  constructor() {
    this.namespace = null;
    this.rooms = new Map();
    this.playbackStates = new Map(); // Pour stocker l'état de lecture de chaque salle
  }

  initialize(namespace) {
    this.namespace = namespace;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    if (!this.namespace) {
      throw new Error(
        'Namespace must be initialized before setting up handlers',
      );
    }

    this.namespace.on('connection', this.handleConnection.bind(this));
  }

  async handleConnection(socket) {
    const { userId, roomId } = socket.handshake.auth;
    logger.info(`User ${userId} attempting to join room ${roomId}`);

    try {
      const room = await this.validateRoomAccess(roomId);
      const participant = await this.joinRoom(userId, roomId);

      this.setupSocketSession(socket, participant, room);
      await this.notifyRoomParticipants(roomId);

      // Envoyer l'état de lecture actuel au nouveau participant
      const playbackState = this.playbackStates.get(roomId);
      if (playbackState) {
        socket.emit('playback:control', playbackState);
      }
    } catch (error) {
      this.handleConnectionError(socket, error);
    }
  }

  async validateRoomAccess(roomId) {
    const room = await JamRoom.findByPk(roomId);
    if (!room || room.status === 'closed') {
      throw new Error('Room not found or closed');
    }
    return room;
  }

  async joinRoom(userId, roomId) {
    const [participant, created] = await JamParticipant.findOrCreate({
      where: { userId, roomId },
      defaults: {
        status: 'active',
        lastActiveAt: new Date(),
        ready: false,
      },
    });

    if (!created) {
      await participant.update({
        status: 'active',
        lastActiveAt: new Date(),
        ready: false,
      });
    }

    return participant;
  }

  setupSocketSession(socket, participant, room) {
    socket.participant = participant;
    socket.join(room.id);

    // Setup event listeners
    socket.on('participant:update', (data) =>
      this.handleParticipantUpdate(socket, data),
    );
    socket.on('participant:ready', (data) =>
      this.handleParticipantReady(socket, data),
    );
    socket.on('jam:reaction', (data) => this.handleJamReaction(socket, data));
    socket.on('playback:control', (data) => this.handlePlaybackControl(socket, data));
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  async handlePlaybackControl(socket, data) {
    const { action, time, trackId } = data;
    const { roomId } = socket.participant;

    logger.info(`Received playback control: ${action} for room ${roomId}`);

    try {
      // Vérifier directement si le participant est l'hôte
      const participant = await JamParticipant.findOne({
        where: {
          roomId,
          userId: socket.participant.userId,
          role: 'host',
          status: 'active'
        }
      });

      if (!participant) {
        logger.warn(`Non-host user ${socket.participant.userId} attempted to control playback`);
        socket.emit('error', { message: 'Only the host can control playback' });
        return;
      }

      // Mettre à jour l'état de lecture
      const playbackState = { action, time, trackId };
      this.playbackStates.set(roomId, playbackState);

      logger.info(`Broadcasting playback control to room ${roomId}:`, playbackState);

      // Diffuser le contrôle à tous les participants de la salle
      this.namespace.to(roomId).emit('playback:control', playbackState);

      logger.info(`Playback control: ${action} in room ${roomId} successful`);
    } catch (error) {
      logger.error('Error handling playback control:', error);
      socket.emit('error', { message: 'Failed to control playback' });
    }
  }

  async notifyRoomParticipants(roomId) {
    const roomState = await this.getRoomState(roomId);
    this.namespace.to(roomId).emit('participants:update', roomState);
    return roomState;
  }

  handleConnectionError(socket, error) {
    logger.error('Error in jam session connection:', error);
    socket.emit('error', { message: error.message || 'Connection failed' });
    socket.disconnect();
  }

  async getRoomState(roomId) {
    const participants = await JamParticipant.findAll({
      where: { roomId, status: 'active' },
      attributes: ['userId', 'role', 'instrument', 'ready'],
      include: [
        {
          model: User,
          attributes: ['username'],
        },
      ],
    });

    return {
      participants: participants.map((p) => ({
        userId: p.userId,
        role: p.role,
        instrument: p.instrument,
        ready: p.ready,
        User: {
          username: p.User.username,
        },
      })),
    };
  }

  async handleParticipantUpdate(socket, data) {
    const { userId, roomId, instrument } = data;
    const participant = socket.participant;

    if (!this.validateParticipantAction(participant, userId, roomId)) return;

    try {
      await participant.update({
        instrument,
        lastActiveAt: new Date(),
      });

      await this.notifyRoomParticipants(roomId);
    } catch (error) {
      this.handleEventError(socket, 'Failed to update participant', error);
    }
  }

  async handleParticipantReady(socket, data) {
    const { userId, roomId, ready } = data;
    const participant = socket.participant;

    if (!this.validateParticipantAction(participant, userId, roomId)) return;

    try {
      await participant.update({
        ready,
        lastActiveAt: new Date(),
      });

      await this.notifyRoomParticipants(roomId);
    } catch (error) {
      this.handleEventError(socket, 'Failed to update ready state', error);
    }
  }

  async handleJamReaction(socket, data) {
    const { type } = data;
    const participant = socket.participant;

    try {
      const user = await User.findByPk(participant.userId);
      this.namespace.to(participant.roomId).emit('jam:reaction', {
        type,
        username: user.username,
      });
    } catch (error) {
      this.handleEventError(socket, 'Failed to send reaction', error);
    }
  }

  handleJamEvent(socket, data) {
    const { roomId } = socket.participant;
    socket.to(roomId).emit('jam:event', {
      userId: socket.participant.userId,
      ...data,
    });
  }

  async handleDisconnect(socket) {
    if (!socket.participant) return;

    const { userId, roomId } = socket.participant;

    try {
      await JamParticipant.update(
        { status: 'inactive', lastActiveAt: new Date(), ready: false },
        { where: { userId, roomId } },
      );

      // Si c'était l'hôte, supprimer l'état de lecture
      const room = await JamRoom.findByPk(roomId);
      if (room && room.createdBy === userId) {
        this.playbackStates.delete(roomId);
      }

      await this.notifyRoomParticipants(roomId);
      this.namespace.to(roomId).emit('participant:left', { userId });
    } catch (error) {
      logger.error('Error handling disconnect:', error);
    }
  }

  validateParticipantAction(participant, userId, roomId) {
    return participant.userId === userId && participant.roomId === roomId;
  }

  handleEventError(socket, message, error) {
    logger.error(`${message}:`, error);
    socket.emit('error', { message });
  }

  shutdown() {
    if (this.namespace) {
      const connectedSockets = this.namespace.sockets;
      connectedSockets.forEach((socket) => {
        socket.disconnect(true);
      });
      this.playbackStates.clear();
    }
  }
}

module.exports = new JamSessionService();
