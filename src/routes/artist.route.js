const Express = require('express');
const ArtistController = require('../controllers/artist.controller');
const {
  validateArtist,
  validateUpdateArtist,
} = require('../middlewares/artist.schema');
const validateIdParam = require('../middlewares/validateIdParam');

const router = Express.Router();

router.post('/', validateArtist, ArtistController.createArtist);
router.get('/', ArtistController.getArtists);
router.get('/:id', validateIdParam, ArtistController.getArtistById);
router.put(
  '/:id',
  validateIdParam,
  validateUpdateArtist,
  ArtistController.updateArtist,
);
router.delete('/:id', ArtistController.deleteArtist);

module.exports = router;
