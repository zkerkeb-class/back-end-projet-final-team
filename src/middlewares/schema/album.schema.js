const joi = require('joi');

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

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateAlbum = validate(albumSchema);
const validateUpdateAlbum = validate(albumUpdateSchema);

module.exports = { validateAlbum, validateUpdateAlbum };
