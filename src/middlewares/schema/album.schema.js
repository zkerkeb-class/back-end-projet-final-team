const joi = require('joi');
const validate = require('./validate');

const commonString = joi.string().max(255).optional();

const albumSchema = joi.object({
  title: joi.string().min(3).max(255).required(),
  releaseDate: joi.date().optional(),
  genre: commonString,
  artistId: joi.number().required(),
});

const albumUpdateSchema = joi.object({
  title: joi.string().min(3).max(255).optional(),
  releaseDate: joi.date().optional(),
  genre: commonString,
  artistId: joi.number().optional(),
});

const validateAlbum = validate(albumSchema);
const validateUpdateAlbum = validate(albumUpdateSchema);

module.exports = { validateAlbum, validateUpdateAlbum };
