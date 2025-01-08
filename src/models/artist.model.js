const { GENRE } = require('./enums');
const { sequelize, DataTypes, Model } = require('../services/db.service');
const natural = require('natural');

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
    phonetic_name: {
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
        fields: ['phonetic_name'],
      },
    ],
  },
);

Artist.beforeSave(async (artist, _options) => {
  if (artist.title && (artist.isNewRecord || artist.changed('title'))) {
    const metaphone = new natural.Metaphone();
    artist.phonetic_name = metaphone.process(artist.name);
  }
});

module.exports = Artist;
