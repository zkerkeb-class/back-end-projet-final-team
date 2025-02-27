const sharp = require('sharp');
const s3Service = require('./s3.service');
const createUniqueId = require('../utils/createUniqueId');
class CdnService {
  constructor() {
    this.allowedFormats = ['webp', 'jpeg', 'png'];
    this.sizes = {
      thumbnail: { width: 150, height: 150 },
      medium: { width: 300, height: 300 },
      large: { width: 600, height: 600 },
    };
  }

  async processImage(buffer, baseKeyPrefix, defaultId = null) {
    let baseKey = null;
    if (defaultId) {
      baseKey = `${baseKeyPrefix}/${defaultId}`;
    } else baseKey = createUniqueId(baseKeyPrefix);
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

  async processProfilePicture(buffer, baseKey = null) {
    return this.processImage(buffer, 'profile-pictures', baseKey);
  }

  async processPlaylistPicture(buffer, baseKey = null) {
    return this.processImage(buffer, 'playlist-pictures', baseKey);
  }

  async processAlbumCover(buffer, baseKey = null) {
    return this.processImage(buffer, 'album-covers', baseKey);
  }

  async processTrackCover(buffer, baseKey = null) {
    return this.processImage(buffer, 'track-covers', baseKey);
  }

  async deleteProfilePictures(baseKey) {
    if (!baseKey) return;
    await s3Service.deleteFolder(baseKey);
  }
}

module.exports = new CdnService();
