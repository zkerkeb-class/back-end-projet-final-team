const { sequelize, DataTypes, Model } = require('../services/db.service');

class Track extends Model {}

Track.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    artistId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'artists',
        key: 'id',
      },
    },
    albumId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'albums',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    durationSecondes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    audioFiles: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    coverImages: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    waveFormData: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lyrics: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    playCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    averageRating: {
      type: DataTypes.FLOAT(),
      defaultValue: 0,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Track',
    tableName: 'tracks',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['title', 'artist_id', 'album_id'],
      },
    ],
  },
);

module.exports = Track;
