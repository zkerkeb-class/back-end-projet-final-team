const { sequelize, DataTypes, Model } = require('../services/db.service');

class Role extends Model {}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    permissions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: 'roles',
    timeStamps: false,
  },
);

module.exports = Role;
