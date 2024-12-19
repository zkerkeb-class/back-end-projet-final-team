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
const upload = require('../config/multer');
const { validateImageUpload } = require('../middlewares/cdn.middleware');

/**
 * @swagger
 * tags:
 *   name: Playlists
 *   description: Playlist management and retrieval operations
 */

// Public routes
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

router.get('/search', async (req, res, next) => {
  try {
    const playlists = await playlistService.searchPlaylists(req.query.q);
    res.json(playlists);
  } catch (error) {
    next(error);
  }
});

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
  upload.single('cover_image'),
  validateImageUpload,
  updatePlaylistCover,
);

router.delete('/:id', deletePlaylist);

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
