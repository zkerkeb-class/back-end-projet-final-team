const router = require('express').Router();
const { playlistService } = require('../services');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  createPlaylist,
  updatePlaylistData,
  updatePlaylistCover,
  deletePlaylist,
} = require('../controllers/playlist.controller');
const validate = require('../middlewares/validation.middleware');
const { playlistUpdateSchema } = require('./validations/music.validation');
const { uploadImage } = require('../config/multer');
const { validateImageUpload } = require('../middlewares/cdn.middleware');

/**
 * @swagger
 * tags:
 *   name: Playlists
 *   description: Playlist management and retrieval operations
 */

//#region
/**
 * @swagger
 * /playlists:
 *   get:
 *     summary: Get all public playlists
 *     tags: [Playlists]
 *     responses:
 *       200:
 *         description: Playlists retrieved successfully
 *       404:
 *         description: No public playlists found
 */
//#endregion
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

//#region
/**
 * @swagger
 * /playlists/search:
 *   get:
 *     summary: Search playlists
 *     tags: [Playlists]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Playlists retrieved successfully
 *       400:
 *         description: Invalid search query
 */
//#endregion
router.get('/search', async (req, res, next) => {
  try {
    const playlists = await playlistService.searchPlaylists(req.query.q);
    res.json(playlists);
  } catch (error) {
    next(error);
  }
});

//#region
/**
 * @swagger
 * /playlists/{id}:
 *   get:
 *     summary: Get a playlist by ID
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
 *         description: Playlist retrieved successfully
 *       404:
 *         description: Playlist not found
 */
//#endregion
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

//#region
/**
 * @swagger
 * /playlists/user:
 *   get:
 *     summary: Get user's playlists
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's playlists retrieved successfully
 */
//#endregion
router.get('/user', async (req, res, next) => {
  try {
    const playlists = await playlistService.getUserPlaylists(req.user.id);
    res.json(playlists);
  } catch (error) {
    next(error);
  }
});

router.post('/', createPlaylist);

//#region
/**
 * @swagger
 * /playlists/{id}:
 *   put:
 *     summary: Update playlist data (name and visibility)
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
 *       200:
 *         description: Playlist data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Playlist'
 */
//#endregion
router.put(
  '/:id',
  authenticate,
  validate(playlistUpdateSchema),
  updatePlaylistData,
);

//#region
/**
 * @swagger
 * /playlists/{id}/cover:
 *   put:
 *     summary: Update playlist cover image
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - cover_image
 *             properties:
 *               cover_image:
 *                 type: string
 *                 format: binary
 *                 description: The cover image file
 *     responses:
 *       200:
 *         description: Playlist cover updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Playlist'
 */
//#endregion
router.put(
  '/:id/cover',
  authenticate,
  uploadImage.single('cover_image'),
  validateImageUpload,
  updatePlaylistCover,
);

//#region
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
 */
//#endregion
router.delete('/:id', deletePlaylist);

//#region
/**
 * @swagger
 * /playlists/{id}/tracks:
 *   post:
 *     summary: Add a track to a playlist
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
 */
//#endregion
router.post('/:id/tracks', async (req, res, next) => {
  try {
    const playlist = await playlistService.findById(req.params.id);

    if (playlist.creator_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'You can only modify your own playlists' });
    }

    const updatedPlaylist = await playlistService.addTrack(
      req.params.id,
      req.body.track_id,
    );
    res.json(updatedPlaylist);
  } catch (error) {
    next(error);
  }
});

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
