const { DataTypes } = require('sequelize');
const { sequelize } = require('../services/db.service');
const musicGenres = require('../constants/musicGenres');

const Artist = sequelize.define(
  'Artist',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    biography: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    images: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    genre: {
      type: DataTypes.ENUM(musicGenres),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'artists',
    timestamps: true,
    underscored: true,
  },
);

module.exports = Artist;
