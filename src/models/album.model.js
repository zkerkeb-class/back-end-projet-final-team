const { sequelize, DataTypes, Model } = require('../services/db.service');
const isValidGenre = require('../utils/isValidGenre');
const isValidImageFormat = require('../utils/isValideImageFormat');
const { applyPhoneticTitleHook } = require('../utils/hooks');

class Album extends Model {}

Album.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    release_date: {
      type: DataTypes.DATEONLY,
    },
    genre: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      validate: { isValidGenre },
    },
    primary_artist_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'artists',
        key: 'id',
      },
    },
    total_tracks: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    image_url: {
      type: DataTypes.JSONB,
      defaultValue: null,
      validate: {
        isValidImageFormat,
      },
    },
    total_duration_seconds: {
      type: DataTypes.INTEGER,
    },
    popularity_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    phonetic_title: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: 'Album',
    tableName: 'albums',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['release_date'],
      },
    ],
  },
);

applyPhoneticTitleHook(Album);

module.exports = Album;
