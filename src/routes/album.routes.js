const router = require('express').Router();
const { albumService } = require('../services');
const { authenticate, isArtist } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const { albumSchema } = require('./validations/music.validation');

// Public routes
router.get('/', async (req, res, next) => {
  try {
    const albums = await albumService.findAll({
      include: ['Artist', 'Tracks'],
    });
    res.json(albums);
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const albums = await albumService.searchAlbums(req.query.q);
    res.json(albums);
  } catch (error) {
    next(error);
  }
});

router.get('/genre/:genre', async (req, res, next) => {
  try {
    const albums = await albumService.findByGenre(req.params.genre);
    res.json(albums);
  } catch (error) {
    next(error);
  }
});

router.get('/artist/:artistId', async (req, res, next) => {
  try {
    const albums = await albumService.getArtistAlbums(req.params.artistId);
    res.json(albums);
  } catch (error) {
    next(error);
  }
});

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

router.post('/', isArtist, validate(albumSchema), async (req, res, next) => {
  try {
    // Ensure the artist can only create albums for themselves
    if (
      req.user.artist_id !== req.body.primary_artist_id &&
      req.user.user_type !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'You can only create albums for yourself' });
    }

    const album = await albumService.createAlbum(req.body, req.body.artist_ids);
    res.status(201).json(album);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', isArtist, validate(albumSchema), async (req, res, next) => {
  try {
    const album = await albumService.findById(req.params.id);

    // Ensure the artist can only update their own albums
    if (
      album.primary_artist_id !== req.user.artist_id &&
      req.user.user_type !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'You can only update your own albums' });
    }

    const updatedAlbum = await albumService.update(req.params.id, req.body);
    res.json(updatedAlbum);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', isArtist, async (req, res, next) => {
  try {
    const album = await albumService.findById(req.params.id);

    // Ensure the artist can only delete their own albums
    if (
      album.primary_artist_id !== req.user.artist_id &&
      req.user.user_type !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own albums' });
    }

    await albumService.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// Update album statistics
router.post('/:id/update-stats', isArtist, async (req, res, next) => {
  try {
    const album = await albumService.findById(req.params.id);

    // Ensure the artist can only update their own album stats
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
