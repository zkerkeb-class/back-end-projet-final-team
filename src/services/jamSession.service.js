const { logger } = require('../config/logger');
const JamRoom = require('../models/jamRoom.model');
const JamParticipant = require('../models/jamParticipant.model');
const User = require('../models/user.model');

class JamSessionService {
  constructor() {
    this.io = null;
    this.jamNamespace = null;
    this.rooms = new Map();
  }

  initialize(io) {
    this.io = io;
    this.jamNamespace = io.of('/jam');

    this.jamNamespace.on('connection', this.handleConnection.bind(this));
  }

  async handleConnection(socket) {
    const { userId, roomId } = socket.handshake.auth;

    if (!userId || !roomId) {
      socket.disconnect();
      return;
    }

    try {
      const room = await JamRoom.findByPk(roomId);
      if (!room || room.status === 'closed') {
        socket.emit('error', { message: 'Room not found or closed' });
        socket.disconnect();
        return;
      }

      const participant = await this.joinRoom(userId, roomId);
      socket.participant = participant;
      socket.join(roomId);

      // Envoyer la mise à jour à tous les participants de la salle
      const updatedRoom = await this.getRoomState(roomId);
      this.jamNamespace.to(roomId).emit('participants:update', updatedRoom);

      // Send current room state to the new participant
      socket.emit('room:state', updatedRoom);

      // Handle events
      socket.on('participant:update', (data) =>
        this.handleParticipantUpdate(socket, data),
      );
      socket.on('participant:ready', (data) =>
        this.handleParticipantReady(socket, data),
      );
      socket.on('jam:reaction', (data) => this.handleJamReaction(socket, data));
      socket.on('jam:event', (data) => this.handleJamEvent(socket, data));
      socket.on('disconnect', () => this.handleDisconnect(socket));
    } catch (error) {
      logger.error('Error in jam session connection:', error);
      socket.disconnect();
    }
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

    if (participant.userId !== userId || participant.roomId !== roomId) {
      return;
    }

    try {
      await participant.update({
        instrument,
        lastActiveAt: new Date(),
      });

      const updatedRoom = await this.getRoomState(roomId);
      this.jamNamespace.to(roomId).emit('participants:update', updatedRoom);
    } catch (error) {
      logger.error('Error updating participant:', error);
      socket.emit('error', { message: 'Failed to update participant' });
    }
  }

  async handleParticipantReady(socket, data) {
    const { userId, roomId, ready } = data;
    const participant = socket.participant;

    if (participant.userId !== userId || participant.roomId !== roomId) {
      return;
    }

    try {
      await participant.update({
        ready,
        lastActiveAt: new Date(),
      });

      const updatedRoom = await this.getRoomState(roomId);
      this.jamNamespace.to(roomId).emit('participants:update', updatedRoom);
    } catch (error) {
      logger.error('Error updating participant ready state:', error);
      socket.emit('error', { message: 'Failed to update ready state' });
    }
  }

  async handleJamReaction(socket, data) {
    const { type } = data;
    const participant = socket.participant;

    try {
      const user = await User.findByPk(participant.userId);
      this.jamNamespace.to(participant.roomId).emit('jam:reaction', {
        type,
        username: user.username,
      });
    } catch (error) {
      logger.error('Error handling reaction:', error);
      socket.emit('error', { message: 'Failed to send reaction' });
    }
  }

  handleJamEvent(socket, data) {
    const { roomId } = socket.participant;
    // Broadcast the event to all other participants in the room
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

      // Envoyer la mise à jour à tous les participants restants
      const updatedRoom = await this.getRoomState(roomId);
      this.jamNamespace.to(roomId).emit('participants:update', updatedRoom);

      // Notify others in the room
      socket.to(roomId).emit('participant:left', { userId });
    } catch (error) {
      logger.error('Error handling disconnect:', error);
    }
  }

  shutdown() {
    if (this.jamNamespace) {
      const connectedSockets = this.jamNamespace.sockets;

      // Disconnect all sockets
      connectedSockets.forEach((socket) => {
        socket.disconnect(true);
      });
    }
  }
}

module.exports = new JamSessionService();
