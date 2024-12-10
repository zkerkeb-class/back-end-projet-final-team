const joi = require('joi');
const validate = require('./validate');

const currentYear = new Date().getFullYear();

const trackSchema = joi.object({
  title: joi.string().min(3).max(255).required(),
  artist: joi.string().min(3).max(255).optional(),
  album: joi.string().min(3).max(255).optional(),
  year: joi.number().min(1900).max(currentYear).optional(),
  genres: joi.array().items(joi.string().min(3).max(255)).optional(),
  coverImages: joi.object().optional(),
});

const trackUpdateSchema = joi.object({
  title: joi.string().min(3).max(255).optional(),
  artist: joi.string().min(3).max(255).optional(),
  album: joi.string().min(3).max(255).optional(),
  year: joi.number().min(1900).max(currentYear).optional(),
  genres: joi.array().items(joi.string().min(3).max(255)).optional(),
  coverImages: joi.object().optional(),
});

const validateTrack = validate(trackSchema);
const validateUpdateTrack = validate(trackUpdateSchema);

module.exports = { validateTrack, validateUpdateTrack };
