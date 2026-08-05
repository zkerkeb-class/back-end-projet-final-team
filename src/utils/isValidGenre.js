const { GENRE } = require('../models/enums');

const isValidGenre = (value) => {
  if (!value || value.length === 0) {
    throw new Error('Genre must have at least one value');
  }
  value.forEach((genre) => {
    if (!Object.values(GENRE).includes(genre)) {
      throw new Error('Invalid genre value');
    }
  });
};

module.exports = isValidGenre;
