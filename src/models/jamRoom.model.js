const { DataTypes } = require('sequelize');
const { sequelize } = require('../services/db.service');

const JamRoom = sequelize.define(
  'JamRoom',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'closed'),
      defaultValue: 'active',
    },
    maxParticipants: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      validate: {
        min: 2,
        max: 50,
      },
      field: 'max_participants',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'created_by',
    },
  },
  {
    timestamps: true,
    tableName: 'jam_rooms',
    underscored: true,
  },
);

module.exports = JamRoom;
