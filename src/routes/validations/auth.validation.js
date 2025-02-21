const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Must be a valid email',
    'any.required': 'Email is required',
  }),

  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),

  username: Joi.string().min(3).required().messages({
    'string.min': 'Username must be at least 3 characters long',
    'any.required': 'Username is required',
  }),

  user_type: Joi.string().valid('standard', 'artist').required().messages({
    'any.only': 'Invalid user type',
    'any.required': 'User type is required',
  }),

  first_name: Joi.string().allow('', null),
  last_name: Joi.string().allow('', null),
  image_url: Joi.string().uri().allow('', null),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Must be a valid email',
    'any.required': 'Email is required',
  }),

  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
};
