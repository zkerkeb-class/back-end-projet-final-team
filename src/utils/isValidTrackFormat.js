const isValidTrackFormat = (value) => {
  if (value === null) return;

  const requiredFormats = ['mp3', 'm4a', 'wav'];

  if (!value.urls || typeof value.urls !== 'object') {
    throw new Error('Invalid profile tack format');
  }
  // Verify each size has all required formats
  for (const format of requiredFormats) {
    if (typeof value.urls[format] !== 'string') {
      throw new Error(`Missing or invalid format ${format}`);
    }
  }
};

module.exports = isValidTrackFormat;
