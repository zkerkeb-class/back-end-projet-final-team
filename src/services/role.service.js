const { Role, User } = require('../models');
const { ROLES } = require('../config/roles');
const { logger } = require('../services/app.service');

class RoleService {
  async createDefaultRoles() {
    try {
      // eslint-disable-next-line no-unused-vars
      for (const [_, roleConfig] of Object.entries(ROLES)) {
        logger.info(
          `Creating role ${roleConfig.name} with permissions: ${roleConfig.permissions}`,
        );
        await Role.findOrCreate({
          where: { name: roleConfig.name },
          defaults: {
            name: roleConfig.name,
            permissions: roleConfig.permissions,
          },
        });
      }
    } catch (error) {
      logger.error('Error creating default roles:', error);
    }
  }

  async assignRoleToUser(userId, roleName) {
    const role = await Role.findOne({
      where: {
        name: roleName,
      },
    });

    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }
  }

  async getUserPermissions(userId) {
    const user = await User.findByPk(userId, {
      include: {
        model: Role,
        as: 'role',
      },
    });

    return user.role.permissions;
  }
}

module.exports = new RoleService();
