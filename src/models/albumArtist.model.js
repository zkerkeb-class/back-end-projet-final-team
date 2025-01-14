const { sequelize, DataTypes, Model } = require('../services/db.service');

class AlbumArtist extends Model {}

AlbumArtist.init(
  {
    album_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'albums',
        key: 'id',
      },
    },
    artist_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'artists',
        key: 'id',
      },
    },
    role: {
      type: DataTypes.STRING(100),
    },
  },
  {
    sequelize,
    modelName: 'AlbumArtist',
    tableName: 'album_artists',
    timestamps: false,
  },
);

module.exports = AlbumArtist;
