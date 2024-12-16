const router = require('express').Router();
const { artistService } = require('../services');
const {
  authenticate,
  isArtist,
  isAdmin,
} = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const { artistSchema } = require('./validations/music.validation');

// Public routes
router.get('/', async (req, res, next) => {
  try {
    const artists = await artistService.findAll();
    res.json(artists);
  } catch (error) {
    next(error);
  }
});

router.get('/top', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const artists = await artistService.getTopArtists(limit);
    res.json(artists);
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const artists = await artistService.searchArtists(req.query.q);
    res.json(artists);
  } catch (error) {
    next(error);
  }
});

router.get('/genre/:genre', async (req, res, next) => {
  try {
    const artists = await artistService.findByGenre(req.params.genre);
    res.json(artists);
  } catch (error) {
    next(error);
  }
});

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

router.post('/', isAdmin, validate(artistSchema), async (req, res, next) => {
  try {
    const artist = await artistService.create(req.body);
    res.status(201).json(artist);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', isArtist, validate(artistSchema), async (req, res, next) => {
  try {
    // Check if the artist is updating their own profile
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

router.delete('/:id', isAdmin, async (req, res, next) => {
  try {
    await artistService.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
