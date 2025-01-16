const { sequelize, DataTypes, Model } = require('../services/db.service');
const { applyPhoneticTitleHook } = require('../utils/hooks');
const isValidGenre = require('../utils/isValidGenre');
const isValidImageFormat = require('../utils/isValideImageFormat');

class Artist extends Model {}

Artist.init(
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
    bio: {
      type: DataTypes.TEXT,
    },
    genre: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      validate: { isValidGenre },
    },
    country: {
      type: DataTypes.STRING(100),
    },
    total_listeners: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    phonetic_title: {
      type: DataTypes.TEXT,
    },
    image_url: {
      type: DataTypes.JSONB,
      defaultValue: null,
      validate: {
        isValidImageFormat,
      },
    },
  },
  {
    sequelize,
    modelName: 'Artist',
    tableName: 'artists',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['name'],
      },
      {
        fields: ['phonetic_title'],
      },
    ],
  },
);

applyPhoneticTitleHook(Artist);

module.exports = Artist;
