const { User } = require('../models');
const { generateToken } = require('../services/jwt.service');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
  try {
    const user = await User.create(req.body);

    const token = generateToken({
      id: user.id,
      role: user.role,
    });
    res.status(201).send({
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        images: user.images,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid password' });
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    res.status(200).send({
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        images: user.images,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
