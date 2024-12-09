const joi = require('joi');
const { Op } = require('sequelize');
const { User } = require('../models');

const imagesSchema = joi.object().optional();

const userSchema = joi.object({
  username: joi.string().min(3).max(255).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  images: imagesSchema,
  role: joi.string().valid('user', 'artist').default('user'),
});

const userUpdateSchema = joi.object({
  user: joi
    .object({
      username: joi.string().min(3).max(255).optional(),
      email: joi.string().email().optional(),
      password: joi.string().min(6).optional(),
      images: imagesSchema,
    })
    .required(),
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const userAlreadyExists = async (req, res, next) => {
  const { email, username } = req.body;

  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ email }, { username }],
    },
  });

  if (existingUser) {
    const errorField = existingUser.email === email ? 'email' : 'username';
    return res
      .status(400)
      .json({ error: `User with this ${errorField} already exists` });
  }

  next();
};

const validateUser = validate(userSchema);
const validateUpdateUser = validate(userUpdateSchema);
const validateLogin = validate(loginSchema);

module.exports = {
  validateUser,
  validateUpdateUser,
  validateLogin,
  userAlreadyExists,
};
