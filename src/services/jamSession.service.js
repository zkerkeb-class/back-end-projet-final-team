const { logger } = require('../config/logger');
const JamRoom = require('../models/jamRoom.model');
const JamParticipant = require('../models/jamParticipant.model');

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

      // Notify others in the room
      socket.to(roomId).emit('participant:joined', {
        userId: participant.userId,
        role: participant.role,
        instrument: participant.instrument,
      });

      // Send current room state to the new participant
      const roomState = await this.getRoomState(roomId);
      socket.emit('room:state', roomState);

      // Handle events
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
      },
    });

    if (!created) {
      await participant.update({
        status: 'active',
        lastActiveAt: new Date(),
      });
    }

    return participant;
  }

  async getRoomState(roomId) {
    const participants = await JamParticipant.findAll({
      where: { roomId, status: 'active' },
      attributes: ['userId', 'role', 'instrument'],
    });

    return {
      participants: participants.map((p) => ({
        userId: p.userId,
        role: p.role,
        instrument: p.instrument,
      })),
    };
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
        { status: 'inactive', lastActiveAt: new Date() },
        { where: { userId, roomId } },
      );

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
