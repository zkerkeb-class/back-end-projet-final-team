const { USER_TYPE } = require('./enums');
const { sequelize, DataTypes, Model } = require('../services/db.service');
const isValidImageFormat = require('../utils/isValideImageFormat');

class User extends Model {
  getProfilePictureUrl(size = 'medium', format = 'webp') {
    const profilePicture = this.getDataValue('profile_picture');
    if (!profilePicture?.urls?.[size]?.[format]) {
      return null;
    }
    return profilePicture.urls[size][format];
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user_type: {
      type: DataTypes.ENUM(...Object.values(USER_TYPE)),
      allowNull: false,
      defaultValue: USER_TYPE.STANDARD,
    },
    first_name: {
      type: DataTypes.STRING(100),
    },
    last_name: {
      type: DataTypes.STRING(100),
    },
    profile_picture: {
      type: DataTypes.JSONB,
      defaultValue: null,
      validate: {
        isValidImageFormat,
      },
    },
    profile_picture_url: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getProfilePictureUrl();
      },
    },
    artist_id: {
      type: DataTypes.INTEGER,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_login: {
      type: DataTypes.DATE,
    },
    refresh_token: {
      type: DataTypes.TEXT,
    },
    refresh_token_expires_at: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

module.exports = User;
