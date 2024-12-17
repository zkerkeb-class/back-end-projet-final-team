const sharp = require('sharp');
const crypto = require('crypto');
const s3Service = require('./s3.service');

class CdnService {
  constructor() {
    this.allowedFormats = ['webp', 'jpeg', 'png'];
    this.sizes = {
      thumbnail: { width: 150, height: 150 },
      medium: { width: 300, height: 300 },
      large: { width: 600, height: 600 },
    };
  }

  async processProfilePicture(buffer) {
    const hash = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const baseKey = `profile-pictures/${timestamp}-${hash}`;

    const urls = {
      original: {},
      thumbnail: {},
      medium: {},
      large: {},
    };

    // Process original in different formats
    for (const format of this.allowedFormats) {
      const processedBuffer = await sharp(buffer).toFormat(format).toBuffer();

      const key = `${baseKey}/original.${format}`;
      const url = await s3Service.uploadBuffer(
        processedBuffer,
        key,
        `image/${format}`,
      );
      urls.original[format] = url;
    }

    // Process different sizes
    for (const [size, dimensions] of Object.entries(this.sizes)) {
      for (const format of this.allowedFormats) {
        const processedBuffer = await sharp(buffer)
          .resize(dimensions.width, dimensions.height, {
            fit: 'cover',
            position: 'center',
          })
          .toFormat(format)
          .toBuffer();

        const key = `${baseKey}/${size}.${format}`;
        const url = await s3Service.uploadBuffer(
          processedBuffer,
          key,
          `image/${format}`,
        );
        urls[size][format] = url;
      }
    }

    return {
      urls,
      baseKey,
    };
  }

  async deleteProfilePicture(baseKey) {
    const keys = [];

    // Generate all possible keys
    keys.push(`${baseKey}/original.webp`);
    keys.push(`${baseKey}/original.jpeg`);
    keys.push(`${baseKey}/original.png`);

    for (const size of Object.keys(this.sizes)) {
      for (const format of this.allowedFormats) {
        keys.push(`${baseKey}/${size}.${format}`);
      }
    }

    await s3Service.deleteObjects(keys);
  }
}

module.exports = new CdnService();