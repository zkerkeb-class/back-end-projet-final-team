const { User } = require('../models');

const userExist = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (user) {
    return res.status(409).json({ message: 'Email already used' });
  }
  next();
};

module.exports = userExist;
