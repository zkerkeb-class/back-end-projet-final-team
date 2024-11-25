const { sequelize, DataTypes, Model } = require('../services/db.service');

class ArtistGenre extends Model {}

ArtistGenre.init(
  {
    artistId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'artists',
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
    modelName: 'ArtistGenre',
    tableName: 'artist_genres',
    timestamps: false,
    underscored: true,
  },
);

module.exports = ArtistGenre;
