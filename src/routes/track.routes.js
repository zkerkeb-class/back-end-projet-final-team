const router = require('express').Router();
const { trackService } = require('../services');
const { authenticate, isArtist } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const { trackSchema } = require('./validations/music.validation');

// Public routes
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

router.get('/top', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const tracks = await trackService.getTopTracks(limit);
    res.json(tracks);
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const tracks = await trackService.searchTracks(req.query.q);
    res.json(tracks);
  } catch (error) {
    next(error);
  }
});

router.get('/genre/:genre', async (req, res, next) => {
  try {
    const tracks = await trackService.findByGenre(req.params.genre);
    res.json(tracks);
  } catch (error) {
    next(error);
  }
});

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

router.post('/', isArtist, validate(trackSchema), async (req, res, next) => {
  try {
    // Ensure the artist can only create tracks for themselves
    if (
      req.user.artist_id !== req.body.artist_id &&
      req.user.user_type !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'You can only create tracks for yourself' });
    }

    const track = await trackService.create(req.body);
    res.status(201).json(track);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', isArtist, validate(trackSchema), async (req, res, next) => {
  try {
    const track = await trackService.findById(req.params.id);

    // Ensure the artist can only update their own tracks
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

router.delete('/:id', isArtist, async (req, res, next) => {
  try {
    const track = await trackService.findById(req.params.id);

    // Ensure the artist can only delete their own tracks
    if (
      track.artist_id !== req.user.artist_id &&
      req.user.user_type !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own tracks' });
    }

    await trackService.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// Track play count
router.post('/:id/play', async (req, res, next) => {
  try {
    const track = await trackService.incrementPlayCount(req.params.id);
    res.json(track);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
