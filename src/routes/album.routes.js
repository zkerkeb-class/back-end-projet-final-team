const router = require('express').Router();
const { albumService } = require('../services');
const { authenticate, isArtist } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const {
  albumSchema,
  albumPlaylistSchema,
} = require('./validations/music.validation');
const {
  getAlbums,
  createAlbum,
  updateAlbum,
  updateAlbumCoverArt,
  deleteAlbum,
} = require('../controllers/album.controller');
const { uploadImage } = require('../config/multer');
const { validateImageUpload } = require('../middlewares/cdn.middleware');

/**
 * @swagger
 * tags:
 *   name: Albums
 *   description: Album management and retrieval operations
 */

//#region
/**
 * @swagger
 * /albums:
 *   get:
 *     summary: Get all albums
 *     tags: [Albums]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items to retrieve
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Albums retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Album'
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPreviousPage:
 *                       type: boolean
 *       500:
 *         description: Internal server error
 */
//#endregion
router.get('/', getAlbums);

//#region
/**
 * @swagger
 * /albums/genre/{genre}:
 *   get:
 *     summary: Get albums by genre
 *     tags: [Albums]
 *     parameters:
 *       - in: path
 *         name: genre
 *         schema:
 *           $ref: '#/components/schemas/Genre'
 *         required: true
 *         description: Genre to filter albums by
 *     responses:
 *       200:
 *         description: Albums filtered by genre retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Album'
 */
//#endregion
router.get('/genre/:genre', async (req, res, next) => {
  try {
    const albums = await albumService.findByGenre(req.params.genre);
    res.json(albums);
  } catch (error) {
    next(error);
  }
});

//#region
/**
 * @swagger
 * /albums/artist/{artistId}:
 *   get:
 *     summary: Get albums by artist ID
 *     tags: [Albums]
 *     parameters:
 *       - in: path
 *         name: artistId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Artist ID to filter albums by
 *     responses:
 *       200:
 *         description: Artist's albums retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Album'
 */
//#endregion
router.get('/artist/:artistId', async (req, res, next) => {
  try {
    const albums = await albumService.getArtistAlbums(req.params.artistId);
    res.json(albums);
  } catch (error) {
    next(error);
  }
});

//#region
/**
 * @swagger
 * /albums/{id}:
 *   get:
 *     summary: Get album by ID with details
 *     tags: [Albums]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Album ID
 *     responses:
 *       200:
 *         description: Album details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Album'
 *                 - type: object
 *                   properties:
 *                     Artist:
 *                       $ref: '#/components/schemas/Artist'
 *                     Tracks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Track'
 *       404:
 *         description: Album not found
 */
//#endregion
router.get('/:id', async (req, res, next) => {
  try {
    const album = await albumService.getAlbumWithDetails(req.params.id);
    res.json(album);
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.use(authenticate);

//#region
/**
 * @swagger
 * /albums:
 *   post:
 *     summary: Create a new album
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - release_date
 *               - genre
 *               - primary_artist_id
 *               - artist_ids
 *             properties:
 *               title:
 *                 type: string
 *               release_date:
 *                 type: string
 *                 format: date
 *               genre:
 *                 $ref: '#/components/schemas/Genre'
 *               primary_artist_id:
 *                 type: integer
 *               artist_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               image_url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Album created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Album'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only create albums for yourself
 */
//#endregion
router.post('/', isArtist, validate(albumSchema), createAlbum);

//#region
/**
 * @swagger
 * /albums/{id}:
 *   put:
 *     summary: Update an album
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Album ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Album'
 *     responses:
 *       200:
 *         description: Album updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Album'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only update own albums
 *       404:
 *         description: Album not found
 */
//#endregion
router.put('/:id', isArtist, validate(albumPlaylistSchema), updateAlbum);

//#region
/**
 * @swagger
 * /albums/{id}/cover:
 *   put:
 *     summary: Update an album's cover art
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Album ID
 *     responses:
 *       200:
 *         description: Album cover art updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only update own albums
 *       404:
 *         description: Album not found
 */
//#endregion
router.put(
  '/:id/cover',
  isArtist,
  uploadImage.single('image_url'),
  validateImageUpload,
  updateAlbumCoverArt,
);

//#region
/**
 * @swagger
 * /albums/{id}:
 *   delete:
 *     summary: Delete an album
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Album ID
 *     responses:
 *       204:
 *         description: Album deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only delete own albums
 *       404:
 *         description: Album not found
 */
//#endregion
router.delete('/:id', isArtist, deleteAlbum);

//#region
/**
 * @swagger
 * /albums/{id}/update-stats:
 *   post:
 *     summary: Update album statistics
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Album ID
 *     responses:
 *       200:
 *         description: Album statistics updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Album'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only update stats for own albums
 *       404:
 *         description: Album not found
 */
//#endregion
router.post('/:id/update-stats', isArtist, async (req, res, next) => {
  try {
    const album = await albumService.findById(req.params.id);

    if (
      album.primary_artist_id !== req.user.artist_id &&
      req.user.user_type !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'You can only update stats for your own albums' });
    }

    const updatedAlbum = await albumService.updateAlbumStats(req.params.id);
    res.json(updatedAlbum);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
