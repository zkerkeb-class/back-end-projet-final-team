const { sequelize, DataTypes, Model } = require('../services/db.service');

class PlaylistTrack extends Model {}

PlaylistTrack.init(
  {
    playlist_id: {
      type: DataTypes.UUID,
      references: {
        model: 'playlists',
        key: 'id',
      },
      primaryKey: true,
    },
    track_id: {
      type: DataTypes.UUID,
      references: {
        model: 'tracks',
        key: 'id',
      },
      primaryKey: true,
    },
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
    sequelize,
    modelName: 'PlaylistTrack',
    tableName: 'playlist_tracks',
    timestamps: false,
    underscored: true,
  },
);

module.exports = PlaylistTrack;
