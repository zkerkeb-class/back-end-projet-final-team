const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

class CDNService {
  constructor() {
    this.baseStoragePath =
      process.env.STORAGE_PATH || path.join(__dirname, '../../storage');
    this.imageFormats = ['webp', 'jpeg', 'avif'];
    this.imageSizes = {
      thumbnail: { width: 150, height: 150 },
      small: { width: 300, height: 300 },
      medium: { width: 600, height: 600 },
      large: { width: 1200, height: 1200 },
      original: null,
    };
  }

  async initialize() {
    // Create storage directories if they don't exist
    await this.createStorageDirectories();
  }

  async createStorageDirectories() {
    const directories = ['profiles', 'albums', 'tracks', 'playlists'];

    for (const dir of directories) {
      const dirPath = path.join(this.baseStoragePath, dir);
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Process and store an image in multiple formats and sizes
   * @param {Buffer} imageBuffer - The original image buffer
   * @param {string} category - The category of the image (profiles, albums, tracks, playlists)
   * @param {Object} options - Processing options
   * @returns {Object} URLs for all generated image variants
   */
  async processAndStoreImage(imageBuffer, category, options = {}) {
    const {
      maintainAspectRatio = true,
      generateAllFormats = true,
      quality = 80,
      allowedSizes = Object.keys(this.imageSizes),
    } = options;

    const imageId = uuidv4();
    const categoryPath = path.join(this.baseStoragePath, category, imageId);
    await fs.mkdir(categoryPath, { recursive: true });

    const urls = {};
    const metadata = await sharp(imageBuffer).metadata();

    // Process each size
    for (const [sizeName, dimensions] of Object.entries(this.imageSizes)) {
      if (!allowedSizes.includes(sizeName)) continue;

      urls[sizeName] = {};
      const sizeDir = path.join(categoryPath, sizeName);
      await fs.mkdir(sizeDir, { recursive: true });

      // Skip resizing for original size
      const baseImage =
        sizeName === 'original'
          ? sharp(imageBuffer)
          : this.resizeImage(imageBuffer, dimensions, maintainAspectRatio);

      // Process each format
      for (const format of this.imageFormats) {
        if (!generateAllFormats && format !== 'webp') continue;

        const fileName = `image.${format}`;
        const filePath = path.join(sizeDir, fileName);
        const relativePath = path.join(category, imageId, sizeName, fileName);

        await this.saveImageInFormat(baseImage, format, filePath, quality);
        urls[sizeName][format] = this.generatePublicUrl(relativePath);
      }
    }

    return {
      id: imageId,
      urls,
      metadata: {
        originalWidth: metadata.width,
        originalHeight: metadata.height,
        format: metadata.format,
        size: metadata.size,
      },
    };
  }

  /**
   * Resize an image while maintaining aspect ratio if specified
   */
  resizeImage(imageBuffer, dimensions, maintainAspectRatio) {
    const resizeOptions = {
      width: dimensions.width,
      height: dimensions.height,
      fit: maintainAspectRatio ? 'inside' : 'fill',
      withoutEnlargement: true,
    };

    return sharp(imageBuffer).resize(resizeOptions);
  }

  /**
   * Save image in specified format with quality settings
   */
  async saveImageInFormat(sharpInstance, format, filePath, quality) {
    let processedImage = sharpInstance.clone();

    switch (format) {
      case 'webp':
        processedImage = processedImage.webp({ quality, effort: 6 });
        break;
      case 'jpeg':
        processedImage = processedImage.jpeg({ quality, mozjpeg: true });
        break;
      case 'avif':
        processedImage = processedImage.avif({ quality, effort: 6 });
        break;
    }

    await processedImage.toFile(filePath);
  }

  /**
   * Generate public URL for an image
   */
  generatePublicUrl(relativePath) {
    const cdnBaseUrl =
      process.env.CDN_BASE_URL || 'http://localhost:3000/storage';
    return `${cdnBaseUrl}/${relativePath}`;
  }

  /**
   * Delete an image and all its variants
   */
  async deleteImage(category, imageId) {
    const imagePath = path.join(this.baseStoragePath, category, imageId);
    await fs.rm(imagePath, { recursive: true, force: true });
  }

  /**
   * Get the best format based on client capabilities
   */
  getBestFormat(acceptHeader) {
    if (acceptHeader.includes('image/avif')) return 'avif';
    if (acceptHeader.includes('image/webp')) return 'webp';
    return 'jpeg';
  }

  /**
   * Get the appropriate size based on client viewport/requirements
   */
  getBestSize(viewportWidth) {
    if (viewportWidth <= 300) return 'thumbnail';
    if (viewportWidth <= 600) return 'small';
    if (viewportWidth <= 1200) return 'medium';
    return 'large';
  }

  /**
   * Process profile picture with specific settings
   */
  async processProfilePicture(imageBuffer) {
    return this.processAndStoreImage(imageBuffer, 'profiles', {
      maintainAspectRatio: false,
      generateAllFormats: true,
      quality: 85,
      allowedSizes: ['thumbnail', 'small', 'medium'],
    });
  }

  /**
   * Process album cover with specific settings
   */
  async processAlbumCover(imageBuffer) {
    return this.processAndStoreImage(imageBuffer, 'albums', {
      maintainAspectRatio: true,
      generateAllFormats: true,
      quality: 90,
      allowedSizes: ['small', 'medium', 'large', 'original'],
    });
  }

  /**
   * Process track artwork with specific settings
   */
  async processTrackArtwork(imageBuffer) {
    return this.processAndStoreImage(imageBuffer, 'tracks', {
      maintainAspectRatio: true,
      generateAllFormats: true,
      quality: 85,
      allowedSizes: ['thumbnail', 'small', 'medium'],
    });
  }

  /**
   * Process playlist cover with specific settings
   */
  async processPlaylistCover(imageBuffer) {
    return this.processAndStoreImage(imageBuffer, 'playlists', {
      maintainAspectRatio: true,
      generateAllFormats: true,
      quality: 85,
      allowedSizes: ['thumbnail', 'small', 'medium'],
    });
  }
}

// Create and initialize singleton instance
const cdnService = new CDNService();
cdnService.initialize().catch(console.error);

module.exports = cdnService;
