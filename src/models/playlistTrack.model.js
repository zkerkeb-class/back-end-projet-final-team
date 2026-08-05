const { sequelize, DataTypes, Model } = require('../services/db.service');

class PlaylistTrack extends Model {}

PlaylistTrack.init(
  {
    playlist_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'playlists',
        key: 'id',
      },
    },
    track_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'tracks',
        key: 'id',
      },
    },
    added_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    track_order: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    modelName: 'PlaylistTrack',
    tableName: 'playlist_tracks',
    timestamps: false,
  },
);

module.exports = PlaylistTrack;
