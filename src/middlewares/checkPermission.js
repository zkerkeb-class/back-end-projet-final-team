const { ROLES } = require('../config/roles');
const logger = require('../utils/loggerUtil');

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userRole = req.user.role_id;

      if (!userRole) {
        return res.status(403).json({ message: 'Role not found' });
      }

      if (!userRole.permissions.includes(requiredPermission)) {
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
  canRead: checkPermission(ROLES.USER.permissions.READ),
  canUpload: checkPermission(ROLES.ARTIST.permissions.UPLOAD),
  canDelete: checkPermission(ROLES.ARTIST.permissions.DELETE),
  canEdit: checkPermission(ROLES.ARTIST.permissions.EDIT),
};
