const { sequelize, DataTypes, Model } = require('../services/db.service');

class ListeningSession extends Model {}

ListeningSession.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    session_code: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    current_track_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tracks',
        key: 'id',
      },
    },
    current_position_seconds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_playing: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'ListeningSession',
    tableName: 'listening_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  },
);

module.exports = ListeningSession;
