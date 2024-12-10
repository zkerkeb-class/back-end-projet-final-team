const { ROLES } = require('../config/roles');
const logger = require('../utils/loggerUtil');
const { Role } = require('../models');

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userRoleId = req.user.role;

      if (!userRoleId) {
        return res.status(403).json({ message: 'Role not found' });
      }

      const myRole = await Role.findByPk(userRoleId);
      const rolePermissions = myRole.permissions;

      if (!rolePermissions.includes(requiredPermission)) {
        return res.status(403).json({
          message: 'Insufficient permissions',
          requiredPermission,
        });
      }
      next();
    } catch (error) {
      logger.error('Permission check error: ', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

module.exports = {
  canRead: checkPermission(ROLES.USER.permissions[0]),
  canUpload: checkPermission(ROLES.ARTIST.permissions[3]),
  canDelete: checkPermission(ROLES.ARTIST.permissions[5]),
  canEdit: checkPermission(ROLES.ARTIST.permissions[4]),
};
