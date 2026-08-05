const { sequelize, DataTypes, Model } = require('../services/db.service');

class AdminActionLog extends Model {}

AdminActionLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    action_type: {
      type: DataTypes.STRING(50),
    },
    resource_type: {
      type: DataTypes.STRING(50),
    },
    resource_id: {
      type: DataTypes.INTEGER,
    },
    details: {
      type: DataTypes.JSONB,
    },
  },
  {
    sequelize,
    modelName: 'AdminActionLog',
    tableName: 'admin_action_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  },
);

module.exports = AdminActionLog;
