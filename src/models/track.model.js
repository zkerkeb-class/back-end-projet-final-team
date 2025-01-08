const { GENRE } = require('./enums');
const { sequelize, DataTypes, Model } = require('../services/db.service');
const isValidImageFormat = require('../utils/isValideImageFormat');
const isValidTrackFormat = require('../utils/isValidTrackFormat');
const natural = require('natural');

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
      type: DataTypes.ENUM(...Object.values(GENRE)),
    },
    audio_file_path: {
      type: DataTypes.JSON,
      defaultValue: null,
      validate: {
        isValidTrackFormat,
      },
    },
    cover: {
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

Track.beforeSave(async (track, _options) => {
  if (track.title && (track.isNewRecord || track.changed('title'))) {
    const metaphone = new natural.Metaphone();
    track.phonetic_title = metaphone.process(track.title);
  }
});

module.exports = Track;
