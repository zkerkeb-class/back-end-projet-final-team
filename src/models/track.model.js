const { GENRE } = require('./enums');
const { sequelize, DataTypes, Model } = require('../services/db.service');

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
      type: DataTypes.INTEGER,
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
      type: DataTypes.TEXT,
    },
    file_formats: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
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

module.exports = Track;
