const { GENRE } = require('./enums');
const { sequelize, DataTypes, Model } = require('../services/db.service');
const { applyPhoneticTitleHook } = require('../utils/hooks');

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
      type: DataTypes.ENUM(...Object.values(GENRE)),
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
