const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const { User, Role } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role }],
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userRoles = req.user.Roles.map((role) => role.name);
    const hasAllowedRole = allowedRoles.some((role) =>
      userRoles.includes(role),
    );

    if (!hasAllowedRole) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    next();
  };
};

const isArtist = (req, res, next) => {
  if (req.user.user_type !== 'artist') {
    return res.status(403).json({ message: 'Artist access required' });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
  isArtist,
  isAdmin,
};