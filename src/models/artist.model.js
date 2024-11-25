const { sequelize, DataTypes, Model } = require('../services/db.service');

class Artist extends Model {}

Artist.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    biography: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    images: {
      type: DataTypes.JSONB,
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
    modelName: 'Artist',
    tableName: 'artists',
    timestamps: true,
    underscored: true,
  },
);

module.exports = Artist;
