const router = require('express').Router();
const { trackService } = require('../services');
const { authenticate, isArtist } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const {
  trackSchema,
  trackUpdateSchema,
} = require('./validations/music.validation');
const {
  createTrack,
  deleteTrack,
  getTopTracks,
  updateTrack,
} = require('../controllers/track.controller');
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
 *     description: Retrieves a list of tracks sorted by popularity. Results are cached in Redis for improved performance.
 *     tags: [Tracks]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         required: false
 *         description: Maximum number of tracks to return (1-100)
 *     responses:
 *       200:
 *         description: List of top tracks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Track unique identifier
 *                   title:
 *                     type: string
 *                     description: Track title
 *                   duration_seconds:
 *                     type: integer
 *                     description: Duration of the track in seconds
 *                   genre:
 *                     type: string
 *                     description: Music genre
 *                   popularity_score:
 *                     type: number
 *                     format: float
 *                     description: Track popularity score (0-100)
 *                   total_plays:
 *                     type: integer
 *                     description: Total number of plays
 *                   release_date:
 *                     type: string
 *                     format: date
 *                     description: Track release date
 *                   audio_file:
 *                     type: object
 *                     properties:
 *                       mp3:
 *                         type: string
 *                         description: MP3 file URL
 *                       wav:
 *                         type: string
 *                         description: WAV file URL
 *                       m4a:
 *                         type: string
 *                         description: M4A file URL
 *                   cover:
 *                     type: object
 *                     properties:
 *                       thumbnail:
 *                         type: string
 *                         description: Thumbnail image URL
 *                       medium:
 *                         type: string
 *                         description: Medium size image URL
 *                   artist:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Artist unique identifier
 *                       name:
 *                         type: string
 *                         description: Artist name
 *                       image:
 *                         type: string
 *                         description: Artist profile picture URL (thumbnail)
 *                   album:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Album unique identifier
 *                       title:
 *                         type: string
 *                         description: Album title
 *                       cover:
 *                         type: string
 *                         description: Album cover URL (thumbnail)
 *             example:
 *               - id: 61
 *                 title: "Hurt So Good"
 *                 duration_seconds: 128
 *                 genre: "Pop"
 *                 popularity_score: 96.99
 *                 total_plays: 451575
 *                 release_date: "2024-06-18"
 *                 audio_file:
 *                   mp3: "https://d3cqeg6fl6kah.cloudfront.net/tracks/default/track.mp3"
 *                   wav: "https://d3cqeg6fl6kah.cloudfront.net/tracks/default/track.wav"
 *                   m4a: "https://d3cqeg6fl6kah.cloudfront.net/tracks/default/track.m4a"
 *                 cover:
 *                   thumbnail: "https://d3cqeg6fl6kah.cloudfront.net/track-covers/1736858542071-9ffd5decbfac18bfa3ecfb9e233bef96/thumbnail.webp"
 *                   medium: "https://d3cqeg6fl6kah.cloudfront.net/track-covers/1736858542071-9ffd5decbfac18bfa3ecfb9e233bef96/medium.webp"
 *                 artist:
 *                   id: 4
 *                   name: "Domingo Kassulke V"
 *                   image: "https://d3cqeg6fl6kah.cloudfront.net/profile-pictures/1736858536656-9d73f0463c8f48dd0dd7e958a75ac2a2/thumbnail.webp"
 *                 album:
 *                   id: 8
 *                   title: "Down Under"
 *                   cover: "https://d3cqeg6fl6kah.cloudfront.net/album-covers/1736858540343-c9c7a7012e4b994e49b189eb297307d2/thumbnail.webp"
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
router.get('/top', getTopTracks);

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
    { name: 'image_url', maxCount: 1 },
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
router.put('/:id', isArtist, validate(trackUpdateSchema), updateTrack);

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

module.exports = router;
