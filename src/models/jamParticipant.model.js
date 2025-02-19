const { DataTypes } = require('sequelize');
const { sequelize } = require('../services/db.service');

const JamParticipant = sequelize.define(
  'JamParticipant',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'JamRooms',
        key: 'id',
      },
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
    ready: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lastActiveAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'JamParticipants',
    timestamps: true,
  },
);

module.exports = JamParticipant;
