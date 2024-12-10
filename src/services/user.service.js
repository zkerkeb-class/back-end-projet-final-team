const { User } = require('../models');
const logger = require('../utils/loggerUtil');
const RoleService = require('./role.service');

class UserService {
  async initAdmin() {
    try {
      const roleId = await RoleService.getRoleIdByName('admin');
      await User.findCreateFind({
        where: { email: 'admin@localhost.com' },
        defaults: {
          email: 'admin@localhost.com',
          password: 'azerty',
          username: 'admin',
          roleId,
        },
      });
    } catch (error) {
      logger.error('Error initializing admin user: ', error);
    }
  }

  async isAdmin(userId) {
    try {
      const user = await User.findByPk(userId);
      const role = await RoleService.getRoleById(user.roleId);
      return role.name === 'admin';
    } catch (error) {
      logger.error('Error checking if user is admin: ', error);
    }
  }
}

module.exports = new UserService();
