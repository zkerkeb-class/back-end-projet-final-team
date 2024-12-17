const { sequelize, DataTypes, Model } = require('../services/db.service');
const isValidImageFormat = require('../utils/isValideImageFormat');

class Playlist extends Model {}

Playlist.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    creator_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    total_tracks: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_duration_seconds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    cover_images: {
      type: DataTypes.JSONB,
      defaultValue: null,
      validate: {
        isValidImageFormat,
      },
    },
  },
  {
    sequelize,
    modelName: 'Playlist',
    tableName: 'playlists',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

module.exports = Playlist;
