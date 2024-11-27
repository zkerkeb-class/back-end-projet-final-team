const joi = require('joi');
const imagesSchema = joi.object().optional();

const userSchema = joi.object({
  username: joi.string().min(3).max(255).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  images: imagesSchema,
});

const userUpdateSchema = joi.object({
  username: joi.string().min(3).max(255).optional(),
  email: joi.string().email().optional(),
  password: joi.string().min(6).optional(),
  images: imagesSchema,
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

const validateUser = validate(userSchema);
const validateUpdateUser = validate(userUpdateSchema);
const validateLogin = validate(loginSchema);

module.exports = { validateUser, validateUpdateUser, validateLogin };
