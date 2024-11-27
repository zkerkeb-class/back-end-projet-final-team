const joi = require('joi');

const idSchema = joi.string().uuid().required();

const validateIdParam = (req, res, next) => {
  const { id } = req.params;

  const { error } = idSchema.validate(id);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = validateIdParam;
