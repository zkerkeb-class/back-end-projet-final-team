const { sequelize, DataTypes, Model } = require('../services/db.service');

class TrackGenre extends Model {}

TrackGenre.init(
  {
    trackId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tracks',
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
    modelName: 'TrackGenre',
    tableName: 'track_genres',
    timestamps: false,
    underscored: true,
  },
);

module.exports = TrackGenre;
