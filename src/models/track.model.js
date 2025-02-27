const { sequelize, DataTypes, Model } = require('../services/db.service');
const isValidImageFormat = require('../utils/isValideImageFormat');
const isValidTrackFormat = require('../utils/isValidTrackFormat');
const isValidGenre = require('../utils/isValidGenre');
const { applyPhoneticTitleHook } = require('../utils/hooks');

class Track extends Model {}

Track.init(
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
    album_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'albums',
        key: 'id',
      },
    },
    artist_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'artists',
        key: 'id',
      },
    },
    duration_seconds: {
      type: DataTypes.FLOAT,
    },
    track_number: {
      type: DataTypes.INTEGER,
    },
    lyrics: {
      type: DataTypes.TEXT,
    },
    genre: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      validate: { isValidGenre },
    },
    audio_file_path: {
      type: DataTypes.JSON,
      defaultValue: null,
      validate: {
        isValidTrackFormat,
      },
    },
    image_url: {
      type: DataTypes.JSONB,
      defaultValue: null,
      validate: {
        isValidImageFormat,
      },
    },
    popularity_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    total_plays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    release_date: {
      type: DataTypes.DATEONLY,
    },
    phonetic_title: {
      type: DataTypes.TEXT,
    },
    musical_features: {
      type: DataTypes.JSONB,
    },
  },
  {
    sequelize,
    modelName: 'Track',
    tableName: 'tracks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['title'],
      },
      {
        fields: ['popularity_score'],
      },
      {
        fields: ['phonetic_title'],
      },
    ],
  },
);

applyPhoneticTitleHook(Track);

module.exports = Track;
