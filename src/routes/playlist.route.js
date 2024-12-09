const express = require('express');
const playlistController = require('../controllers/playlist.controller');
const isAuth = require('../middlewares/isAuth');
const {
  canRead,
  canCreate,
  canEdit,
  canDelete,
} = require('../middlewares/permissions');
const {
  checkResourceOwnership,
  canModifyPlaylist,
} = require('../middlewares/ownership');

const router = express.Router();

router.get('/', isAuth, canRead, playlistController.getPlaylists);
router.get('/:id', isAuth, canRead, playlistController.getPlaylistById);
router.post('/playlists', isAuth, canCreate, playlistController.createPlaylist);
router.put(
  '/:id',
  isAuth,
  canEdit,
  checkResourceOwnership,
  canModifyPlaylist,
  playlistController.updatePlaylist,
);
router.delete(
  '/:id',
  isAuth,
  canDelete,
  checkResourceOwnership,
  playlistController.deletePlaylist,
);
