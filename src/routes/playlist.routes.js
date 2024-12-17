const router = require('express').Router();
const { playlistService } = require('../services');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  createPlaylist,
  updatePlaylist,
} = require('../controllers/playlist.controller');
const validate = require('../middlewares/validation.middleware');
const { playlistSchema } = require('./validations/music.validation');
const parseFormData = require('../middlewares/parseFormData.middleware');
const upload = require('../config/multer');
const { validateImageUpload } = require('../middlewares/cdn.middleware');

/**
 * @swagger
 * tags:
 *   name: Playlists
 *   description: Playlist management and retrieval operations
 */

/**
 * @swagger
 * /playlists:
 *   get:
 *     summary: Get all public playlists
 *     tags: [Playlists]
 *     responses:
 *       200:
 *         description: List of public playlists retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Playlist'
 *                   - type: object
 *                     properties:
 *                       Tracks:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Track'
 */
router.get('/', async (req, res, next) => {
  try {
    const playlists = await playlistService.findAll({
      where: { is_public: true },
      include: ['Tracks'],
    });
    res.json(playlists);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /playlists/search:
 *   get:
 *     summary: Search public playlists by name
 *     tags: [Playlists]
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
 *                 $ref: '#/components/schemas/Playlist'
 */
router.get('/search', async (req, res, next) => {
  try {
    const playlists = await playlistService.searchPlaylists(req.query.q);
    res.json(playlists);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /playlists/{id}:
 *   get:
 *     summary: Get playlist by ID with tracks
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Playlist ID
 *     responses:
 *       200:
 *         description: Playlist details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Playlist'
 *                 - type: object
 *                   properties:
 *                     Tracks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Track'
 *       404:
 *         description: Playlist not found or not accessible
 */
router.get('/:id', async (req, res, next) => {
  try {
    const playlist = await playlistService.getPlaylistWithTracks(req.params.id);
    if (!playlist.is_public) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    res.json(playlist);
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.use(authenticate);

/**
 * @swagger
 * /playlists/user:
 *   get:
 *     summary: Get current user's playlists
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's playlists retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Playlist'
 *       401:
 *         description: Unauthorized
 */
router.get('/user', async (req, res, next) => {
  try {
    const playlists = await playlistService.findAll({
      where: { creator_id: req.user.id },
      include: ['Tracks'],
    });
    res.json(playlists);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /playlists:
 *   post:
 *     summary: Create a new playlist
 *     tags: [Playlists]
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
 *               - is_public
 *             properties:
 *               name:
 *                 type: string
 *                 description: Playlist name
 *               is_public:
 *                 type: boolean
 *                 description: Whether the playlist is public
 *     responses:
 *       201:
 *         description: Playlist created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Playlist'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', createPlaylist);

/**
 * @swagger
 * /playlists/{id}:
 *   put:
 *     summary: Update a playlist
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Playlist ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Playlist'
 *     responses:
 *       200:
 *         description: Playlist updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Playlist'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only update own playlists
 *       404:
 *         description: Playlist not found
 */
router.put(
  '/:id',
  upload.single('cover_image'),
  parseFormData,
  validate(playlistSchema),
  validateImageUpload,
  updatePlaylist,
);

/**
 * @swagger
 * /playlists/{id}:
 *   delete:
 *     summary: Delete a playlist
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Playlist ID
 *     responses:
 *       204:
 *         description: Playlist deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only delete own playlists
 *       404:
 *         description: Playlist not found
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const playlist = await playlistService.findById(req.params.id);

    if (playlist.creator_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own playlists' });
    }

    await playlistService.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /playlists/{id}/tracks:
 *   post:
 *     summary: Add tracks to a playlist
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Playlist ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - track_ids
 *             properties:
 *               track_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of track IDs to add
 *     responses:
 *       200:
 *         description: Tracks added to playlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Playlist'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only modify own playlists
 *       404:
 *         description: Playlist not found
 */
router.post('/:id/tracks', async (req, res, next) => {
  try {
    const playlist = await playlistService.findById(req.params.id);

    if (playlist.creator_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'You can only modify your own playlists' });
    }

    const updatedPlaylist = await playlistService.addTracks(
      req.params.id,
      req.body.track_ids,
    );
    res.json(updatedPlaylist);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /playlists/{id}/tracks/{trackId}:
 *   delete:
 *     summary: Remove a track from a playlist
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Playlist ID
 *       - in: path
 *         name: trackId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Track ID to remove
 *     responses:
 *       204:
 *         description: Track removed from playlist successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only modify own playlists
 *       404:
 *         description: Playlist or track not found
 */
router.delete('/:id/tracks/:trackId', async (req, res, next) => {
  try {
    const playlist = await playlistService.findById(req.params.id);

    if (playlist.creator_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'You can only modify your own playlists' });
    }

    await playlistService.removeTrack(req.params.id, req.params.trackId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
