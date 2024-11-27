const joi = require('joi');

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

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateArtist = validate(artistSchema);
const validateUpdateArtist = validate(artistUpdateSchema);

module.exports = { validateArtist, validateUpdateArtist };
