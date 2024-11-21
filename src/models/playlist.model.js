const { DataTypes } = require('sequelize');
const { sequelize } = require('../services/db.service');

const Playlist = sequelize.define(
  'Playlist',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    tableName: 'playlists',
    timestamps: true,
    underscored: true,
  },
);

Playlist.associate = (models) => {
  Playlist.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
  Playlist.belongsToMany(models.Track, {
    through: 'PlaylistTrack',
    foreignKey: 'playlist_id',
    as: 'tracks',
  });
};

module.exports = Playlist;
