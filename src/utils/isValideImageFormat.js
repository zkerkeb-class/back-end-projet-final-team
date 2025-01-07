const isValidImageFormat = (value) => {
  if (value === null) return;

  if (!value.urls || typeof value.urls !== 'object') {
    throw new Error('Invalid profile picture format');
  }

  const requiredSizes = ['original', 'thumbnail', 'medium', 'large'];
  const requiredFormats = ['webp', 'jpeg', 'png'];

  // Verify all required sizes exist
  for (const size of requiredSizes) {
    if (!value.urls[size] || typeof value.urls[size] !== 'object') {
      throw new Error(`Missing or invalid size: ${size}`);
    }

    // Verify each size has all required formats
    for (const format of requiredFormats) {
      if (
        !value.urls[size][format] ||
        typeof value.urls[size][format] !== 'string'
      ) {
        throw new Error(`Missing or invalid format ${format} for size ${size}`);
      }
    }
  }
};

module.exports = isValidImageFormat;
