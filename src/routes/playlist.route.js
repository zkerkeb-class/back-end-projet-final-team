const express = require('express');
const playlistController = require('../controllers/playlist.controller');
const isAuth = require('../middlewares/isAuth');
const {
  canRead,
  canUpload,
  canEdit,
  canDelete,
} = require('../middlewares/checkPermission');
const { checkResourceOwnership } = require('../middlewares/ownership');

const router = express.Router();

router.get('/', isAuth, canRead, playlistController.getPlaylists);
router.get('/:id', isAuth, canRead, playlistController.getPlaylistById);
router.post('/playlists', isAuth, canUpload, playlistController.createPlaylist);
router.put(
  '/:id',
  isAuth,
  canEdit,
  checkResourceOwnership,
  playlistController.updatePlaylist,
);
router.delete(
  '/:id',
  isAuth,
  canDelete,
  checkResourceOwnership,
  playlistController.deletePlaylist,
);

module.exports = router;
