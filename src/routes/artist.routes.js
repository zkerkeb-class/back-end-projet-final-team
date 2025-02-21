const router = require('express').Router();
const { artistService } = require('../services');
const {
  authenticate,
  isArtist,
  isAdmin,
} = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const { artistSchema } = require('./validations/music.validation');

/**
 * @swagger
 * tags:
 *   name: Artists
 *   description: Artist management and retrieval operations
 */

/**
 * @swagger
 * /artists:
 *   get:
 *     summary: Get all artists
 *     tags: [Artists]
 *     responses:
 *       200:
 *         description: List of artists retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Artist'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res, next) => {
  try {
    const artists = await artistService.findAll();
    res.json(artists);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /artists/top:
 *   get:
 *     summary: Get top artists by popularity
 *     tags: [Artists]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of artists to return
 *     responses:
 *       200:
 *         description: List of top artists retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Artist'
 */
router.get('/top', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const artists = await artistService.getTopArtists(limit);
    res.json(artists);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /artists/search:
 *   get:
 *     summary: Search artists by name
 *     tags: [Artists]
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
 *                 $ref: '#/components/schemas/Artist'
 */
router.get('/search', async (req, res, next) => {
  try {
    const artists = await artistService.searchArtists(req.query.q);
    res.json(artists);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /artists/genre/{genre}:
 *   get:
 *     summary: Get artists by genre
 *     tags: [Artists]
 *     parameters:
 *       - in: path
 *         name: genre
 *         schema:
 *           $ref: '#/components/schemas/Genre'
 *         required: true
 *         description: Genre to filter artists by
 *     responses:
 *       200:
 *         description: Artists filtered by genre retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Artist'
 */
router.get('/genre/:genre', async (req, res, next) => {
  try {
    const artists = await artistService.findByGenre(req.params.genre);
    res.json(artists);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /artists/{id}:
 *   get:
 *     summary: Get artist by ID
 *     tags: [Artists]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Artist ID
 *     responses:
 *       200:
 *         description: Artist profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Artist'
 *       404:
 *         description: Artist not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req, res, next) => {
  try {
    const artist = await artistService.getArtistProfile(req.params.id);
    res.json(artist);
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.use(authenticate);

/**
 * @swagger
 * /artists:
 *   post:
 *     summary: Create a new artist
 *     tags: [Artists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - genre
 *             properties:
 *               name:
 *                 type: string
 *                 description: Artist's name
 *               genre:
 *                 $ref: '#/components/schemas/Genre'
 *               bio:
 *                 type: string
 *                 description: Artist's biography
 *               country:
 *                 type: string
 *                 description: Artist's country
 *               image_url:
 *                 type: string
 *                 format: uri
 *               phonetic_title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Artist created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Artist'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/', isAdmin, validate(artistSchema), async (req, res, next) => {
  try {
    const artist = await artistService.create(req.body);
    res.status(201).json(artist);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /artists/{id}:
 *   put:
 *     summary: Update an artist
 *     tags: [Artists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Artist ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Artist'
 *     responses:
 *       200:
 *         description: Artist updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Artist'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only update own profile
 *       404:
 *         description: Artist not found
 */
router.put('/:id', isArtist, validate(artistSchema), async (req, res, next) => {
  try {
    if (
      req.user.artist_id !== parseInt(req.params.id) &&
      req.user.user_type !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'You can only update your own profile' });
    }

    const artist = await artistService.update(req.params.id, req.body);
    res.json(artist);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /artists/{id}:
 *   delete:
 *     summary: Delete an artist
 *     tags: [Artists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Artist ID
 *     responses:
 *       204:
 *         description: Artist deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Artist not found
 */
router.delete('/:id', isAdmin, async (req, res, next) => {
  try {
    await artistService.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
