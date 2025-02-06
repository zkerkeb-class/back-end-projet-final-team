const { DataTypes } = require('sequelize');
const { sequelize } = require('../services/db.service');

const JamParticipant = sequelize.define(
  'JamParticipant',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'user_id',
    },
    roomId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'jam_rooms',
        key: 'id',
      },
      field: 'room_id',
    },
    role: {
      type: DataTypes.ENUM('host', 'participant'),
      defaultValue: 'participant',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    instrument: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastActiveAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'last_active_at',
    },
  },
  {
    timestamps: true,
    tableName: 'jam_participants',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'room_id'],
      },
    ],
  },
);

module.exports = JamParticipant;
