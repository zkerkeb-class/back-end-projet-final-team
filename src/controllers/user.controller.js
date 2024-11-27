const { User } = require('../models');

const getUsers = async (_req, res, _next) => {
  try {
    const users = await User.findAll({
      limit: 25,
      exclude: ['password'],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res, _next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { exclude: ['password'] });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res, _next) => {
  try {
    const { id } = req.params;
    const { user: userData } = req.body;
    const user = await User.findByPk(id, { exclude: ['password'] });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update(userData);

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res, _next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
