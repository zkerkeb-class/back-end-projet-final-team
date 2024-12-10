const Express = require('express');
const ArtistController = require('../controllers/artist.controller');
const {
  validateArtist,
  validateUpdateArtist,
} = require('../middlewares/schema/artist.schema');
const validateIdParam = require('../middlewares/validateIdParam');
const isAuth = require('../middlewares/isAuth');

const router = Express.Router();

router.post('/', isAuth, validateArtist, ArtistController.createArtist);
router.get('/', ArtistController.getArtists);
router.get('/:id', validateIdParam, ArtistController.getArtistById);
router.put(
  '/:id',
  isAuth,
  validateIdParam,
  validateUpdateArtist,
  ArtistController.updateArtist,
);
router.delete('/:id', isAuth, ArtistController.deleteArtist);

module.exports = router;
