const { sequelize, DataTypes, Model } = require('../services/db.service');

class Permission extends Model {}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id',
      },
    },
    resource_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    permission_level: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Permission',
    tableName: 'permissions',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['role_id', 'resource_type', 'permission_level'],
      },
    ],
  },
);

module.exports = Permission;
