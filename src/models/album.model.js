const { DataTypes } = require('sequelize');
const { sequelize } = require('../services/db.service');
const musicGenres = require('../constants/musicGenres');

const Album = sequelize.define(
  'Album',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    artistId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'artists',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    releaseYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    genre: {
      type: DataTypes.ENUM(musicGenres),
      allowNull: true,
    },
    coverImages: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    totalTracks: {
      type: DataTypes.INTEGER,
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
    tableName: 'albums',
    timestamps: true,
    underscored: true,
  },
);

module.exports = Album;
