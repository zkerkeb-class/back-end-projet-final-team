const router = require('express').Router();
const { trackService } = require('../services');
const { authenticate, isArtist } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const { trackSchema } = require('./validations/music.validation');
const { createTrack, deleteTrack } = require('../controllers/track.controller');
const { uploadAudio, handleMulterError } = require('../config/multer');
const { validateImageUpload } = require('../middlewares/cdn.middleware');
const parseFormData = require('../middlewares/parseFormData.middleware');

/**
 * @swagger
 * tags:
 *   name: Tracks
 *   description: Track management and retrieval operations
 */

/**
 * @swagger
 * /tracks:
 *   get:
 *     summary: Get all tracks
 *     tags: [Tracks]
 *     responses:
 *       200:
 *         description: List of tracks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Track'
 */
router.get('/', async (req, res, next) => {
  try {
    const tracks = await trackService.findAll({
      include: ['Artist', 'Album'],
    });
    res.json(tracks);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /tracks/top:
 *   get:
 *     summary: Get top tracks by popularity
 *     tags: [Tracks]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of tracks to return
 *     responses:
 *       200:
 *         description: List of top tracks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Track'
 */
router.get('/top', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const tracks = await trackService.getTopTracks(limit);
    res.json(tracks);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /tracks/search:
 *   get:
 *     summary: Search tracks by title
 *     tags: [Tracks]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query string
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Track'
 */
router.get('/search', async (req, res, next) => {
  try {
    const tracks = await trackService.searchTracks(req.query.q);
    res.json(tracks);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /tracks/genre/{genre}:
 *   get:
 *     summary: Get tracks by genre
 *     tags: [Tracks]
 *     parameters:
 *       - in: path
 *         name: genre
 *         schema:
 *           $ref: '#/components/schemas/Genre'
 *         required: true
 *         description: Genre to filter tracks by
 *     responses:
 *       200:
 *         description: Tracks filtered by genre retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Track'
 */
router.get('/genre/:genre', async (req, res, next) => {
  try {
    const tracks = await trackService.findByGenre(req.params.genre);
    res.json(tracks);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /tracks/{id}:
 *   get:
 *     summary: Get track by ID with details
 *     tags: [Tracks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Track ID
 *     responses:
 *       200:
 *         description: Track details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Track'
 *       404:
 *         description: Track not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const track = await trackService.getTrackWithDetails(req.params.id);
    res.json(track);
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.use(authenticate);

/**
 * @swagger
 * /tracks:
 *   post:
 *     summary: Create a new track with audio and cover image
 *     tags: [Tracks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - audio
 *               - data
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Audio file (mp3, wav, or m4a)
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: Cover image file
 *               data:
 *                 type: string
 *                 description: JSON string containing track metadata
 *     responses:
 *       201:
 *         description: Track created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Track'
 */
router.post(
  '/',
  isArtist,
  uploadAudio.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  handleMulterError,
  validateImageUpload,
  parseFormData,
  validate(trackSchema),
  createTrack,
);

/**
 * @swagger
 * /tracks/{id}:
 *   put:
 *     summary: Update a track
 *     tags: [Tracks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Track ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Track'
 *     responses:
 *       200:
 *         description: Track updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Track'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only update own tracks
 *       404:
 *         description: Track not found
 */
router.put('/:id', isArtist, validate(trackSchema), async (req, res, next) => {
  try {
    const track = await trackService.findById(req.params.id);

    if (
      track.artist_id !== req.user.artist_id &&
      req.user.user_type !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'You can only update your own tracks' });
    }

    const updatedTrack = await trackService.update(req.params.id, req.body);
    res.json(updatedTrack);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /tracks/{id}:
 *   delete:
 *     summary: Delete a track and its associated files
 *     tags: [Tracks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Track ID
 *     responses:
 *       204:
 *         description: Track deleted successfully
 */
router.delete('/:id', isArtist, deleteTrack);

/**
 * @swagger
 * /tracks/{id}/play:
 *   post:
 *     summary: Increment track play count
 *     tags: [Tracks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Track ID
 *     responses:
 *       200:
 *         description: Track play count incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Track'
 *       404:
 *         description: Track not found
 */
router.post('/:id/play', async (req, res, next) => {
  try {
    const track = await trackService.incrementPlayCount(req.params.id);
    res.json(track);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
