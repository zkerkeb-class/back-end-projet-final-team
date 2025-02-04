const router = require('express').Router();
const {
  // createAlbum,
  createArtist,
  // editAlbum,
  // editArtist,
  createTrackToArtist,
} = require('../controllers/admin.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const { artistSchema, albumSchema } = require('./validations/music.validation');

router.use(authenticate);

router.post('/artists', isAdmin, validate(artistSchema), createArtist);
// router.post('/albums', isAdmin, validate(albumSchema), createAlbum);
router.post('/tracks/:id', isAdmin, createTrackToArtist);
// router.put('/artists/:id', isAdmin, editArtist);
// router.put('/albums/:id', isAdmin, editAlbum);

module.exports = router;
