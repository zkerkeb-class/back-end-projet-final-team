const { logger } = require('../config/logger');
const JamRoom = require('../models/jamRoom.model');
const JamParticipant = require('../models/jamParticipant.model');
const { User } = require('../models');

const createRoom = async (req, res) => {
  try {
    const { name, description, maxParticipants } = req.body;
    const userId = req.user.id;

    const room = await JamRoom.create({
      name,
      description,
      maxParticipants,
      createdBy: userId,
    });

    // Create the first participant (host)
    await JamParticipant.create({
      userId,
      roomId: room.id,
      role: 'host',
      status: 'active',
    });

    return res.status(201).json(room);
  } catch (error) {
    logger.error('Error creating jam room:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await JamRoom.findAll({
      where: { status: 'active' },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username'],
        },
        {
          model: JamParticipant,
          as: 'participants',
          attributes: ['userId', 'role', 'instrument'],
          where: { status: 'active' },
          required: false,
        },
      ],
    });

    return res.json(rooms);
  } catch (error) {
    logger.error('Error fetching jam rooms:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await JamRoom.findOne({
      where: { id: roomId },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username'],
        },
        {
          model: JamParticipant,
          as: 'participants',
          attributes: ['userId', 'role', 'instrument'],
          where: { status: 'active' },
          required: false,
          include: [
            {
              model: User,
              attributes: ['id', 'username'],
            },
          ],
        },
      ],
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    return res.json(room);
  } catch (error) {
    logger.error('Error fetching jam room:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const closeRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await JamRoom.findOne({
      where: { id: roomId, createdBy: userId },
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    await room.update({ status: 'closed' });
    await JamParticipant.update({ status: 'inactive' }, { where: { roomId } });

    return res.json({ message: 'Room closed successfully' });
  } catch (error) {
    logger.error('Error closing jam room:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateParticipant = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    const { instrument } = req.body;

    const participant = await JamParticipant.findOne({
      where: { roomId, userId },
    });

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    await participant.update({ instrument });
    return res.json(participant);
  } catch (error) {
    logger.error('Error updating participant:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoom,
  closeRoom,
  updateParticipant,
};
