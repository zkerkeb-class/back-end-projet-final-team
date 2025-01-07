const crypto = require('crypto');

const createUniqueId = (folderName) => {
  const hash = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${folderName}/${timestamp}-${hash}`;
};

module.exports = createUniqueId;
