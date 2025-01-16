const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const BaseService = require('./base.service');
const { User, UserRole, Role, Artist } = require('../models');
const { Op } = require('sequelize');
const cdnService = require('./cdn.service');

class UserService extends BaseService {
  constructor() {
    super(User);
  }

  async register(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await this.create({
        ...userData,
        password_hash: hashedPassword,
      });

      if (userData.user_type === 'artist') {
        const artist = await Artist.create({
          name: userData.username,
          genre: userData.genre || [],
        });
        await user.update({ artist_id: artist.id });
      }

      await UserRole.create({
        user_id: user.id,
        role_id: userData.user_type === 'standard' ? 1 : 2,
      });

      return this.sanitizeUser(user);
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async updateProfilePicture(userId, imageBuffer) {
    try {
      const user = await this.findById(userId);

      // Delete old profile picture if exists
      if (user.image_url?.baseKey) {
        await cdnService.deleteProfilePicture(user.image_url.baseKey);
      }

      const profilePicture =
        await cdnService.processProfilePicture(imageBuffer);

      await user.update({ image_url: profilePicture });
      return this.sanitizeUser(user);
    } catch (error) {
      throw new Error(`Failed to update profile picture: ${error.message}`);
    }
  }

  async login(email, password) {
    try {
      const user = await this.findOne({
        where: { email },
        include: [{ model: Role }],
      });

      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash,
      );
      if (!isValidPassword) throw new Error('Invalid credentials');

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      await this.update(user.id, {
        refresh_token: refreshToken,
        refresh_token_expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ), // 7 days
        last_login: new Date(),
      });

      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async refreshToken(refreshToken) {
    try {
      const user = await this.findOne({
        where: {
          refresh_token: refreshToken,
          refresh_token_expires_at: {
            [Op.gt]: new Date(),
          },
        },
      });

      const accessToken = this.generateAccessToken(user);
      return { accessToken };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  async logout(userId) {
    try {
      await this.update(userId, {
        refresh_token: null,
        refresh_token_expires_at: null,
      });
      return { message: 'Logged out successfully' };
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        user_type: user.user_type,
        roles: user.Roles?.map((role) => role.name),
      },
      config.jwtSecret,
      { expiresIn: '1h' },
    );
  }

  generateRefreshToken(user) {
    return jwt.sign({ id: user.id }, config.jwtRefreshSecret, {
      expiresIn: '7d',
    });
  }

  getMe(userId) {
    return this.findById(userId, {
      include: [
        {
          model: Role,
        },
        {
          model: Artist,
        },
      ],
      attributes: {
        exclude: ['password_hash', 'refresh_token', 'refresh_token_expires_at'],
      },
    });
  }

  sanitizeUser(user) {
    const sanitized = user.toJSON();
    delete sanitized.password_hash;
    delete sanitized.refresh_token;
    return sanitized;
  }
}

module.exports = new UserService();
