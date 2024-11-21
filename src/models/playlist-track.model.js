const { DataTypes } = require('sequelize');
const { sequelize } = require('../services/db.service');

const PlaylistTrack = sequelize.define(
  'PlaylistTrack',
  {
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    addedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'added_at',
    },
  },
  {
    tableName: 'playlist_tracks',
    timestamps: false,
    underscored: true,
  },
);

module.exports = PlaylistTrack;
