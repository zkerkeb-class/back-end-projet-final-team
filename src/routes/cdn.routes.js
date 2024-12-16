const router = require('express').Router();
const multer = require('multer');
const { authenticate } = require('../middlewares/auth.middleware');
const { validateImageUpload } = require('../middlewares/cdn.middleware');
const cdnService = require('../services/cdn.service');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * @swagger
 * tags:
 *   name: CDN
 *   description: Image upload and management
 */

/**
 * @swagger
 * /cdn/upload/profile:
 *   post:
 *     summary: Upload profile picture
 *     tags: [CDN]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 urls:
 *                   type: object
 *                   properties:
 *                     thumbnail:
 *                       type: object
 *                     small:
 *                       type: object
 *                     medium:
 *                       type: object
 */
router.post(
  '/upload/profile',
  authenticate,
  upload.single('image'),
  validateImageUpload,
  async (req, res, next) => {
    try {
      const result = await cdnService.processProfilePicture(req.file.buffer);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /cdn/upload/album:
 *   post:
 *     summary: Upload album cover
 *     tags: [CDN]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 urls:
 *                   type: object
 *                   properties:
 *                     small:
 *                       type: object
 *                     medium:
 *                       type: object
 *                     large:
 *                       type: object
 *                     original:
 *                       type: object
 */
router.post(
  '/upload/album',
  authenticate,
  upload.single('image'),
  validateImageUpload,
  async (req, res, next) => {
    try {
      const result = await cdnService.processAlbumCover(req.file.buffer);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /cdn/upload/track:
 *   post:
 *     summary: Upload track artwork
 *     tags: [CDN]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 urls:
 *                   type: object
 *                   properties:
 *                     thumbnail:
 *                       type: object
 *                     small:
 *                       type: object
 *                     medium:
 *                       type: object
 */
router.post(
  '/upload/track',
  authenticate,
  upload.single('image'),
  validateImageUpload,
  async (req, res, next) => {
    try {
      const result = await cdnService.processTrackArtwork(req.file.buffer);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /cdn/upload/playlist:
 *   post:
 *     summary: Upload playlist cover
 *     tags: [CDN]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 urls:
 *                   type: object
 *                   properties:
 *                     thumbnail:
 *                       type: object
 *                     small:
 *                       type: object
 *                     medium:
 *                       type: object
 */
router.post(
  '/upload/playlist',
  authenticate,
  upload.single('image'),
  validateImageUpload,
  async (req, res, next) => {
    try {
      const result = await cdnService.processPlaylistCover(req.file.buffer);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /cdn/images/{category}/{id}:
 *   delete:
 *     summary: Delete an image and all its variants
 *     tags: [CDN]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         schema:
 *           type: string
 *           enum: [profiles, albums, tracks, playlists]
 *         required: true
 *         description: Image category
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Image ID
 *     responses:
 *       204:
 *         description: Image deleted successfully
 *       404:
 *         description: Image not found
 */
router.delete('/images/:category/:id', authenticate, async (req, res, next) => {
  try {
    await cdnService.deleteImage(req.params.category, req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
