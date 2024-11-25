const { sequelize, DataTypes, Model } = require('../services/db.service');

class AlbumGenre extends Model {}

AlbumGenre.init(
  {
    playlistId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'playlists',
        key: 'id',
      },
    },
    genreId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'genres',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'AlbumGenre',
    tableName: 'playlist_genres',
    timestamps: false,
    underscored: true,
  },
);

module.exports = AlbumGenre;
