const joi = require('joi');
const validate = require('./validate');

const commonString = joi.string().max(255).optional();

const artistSchema = joi.object({
  name: joi.string().min(3).max(255).required(),
  biography: joi.string().max(1000).optional(),
  country: commonString,
  images: joi.object().optional(),
});

const artistUpdateSchema = joi.object({
  name: joi.string().min(3).max(255).optional(),
  biography: joi.string().max(1000).optional(),
  country: commonString,
  images: joi.object().optional(),
});

const validateArtist = validate(artistSchema);
const validateUpdateArtist = validate(artistUpdateSchema);

module.exports = { validateArtist, validateUpdateArtist };
