const express = require('express');
const albumController = require('../controllers/album.controller');
const isAuth = require('../middlewares/isAuth');
const {
  canRead,
  canEdit,
  canDelete,
  canUpload,
} = require('../middlewares/checkPermission');
const { canModifyAlbum } = require('../middlewares/ownership');

const router = express.Router();

router.get('/', isAuth, canRead, albumController.getAlbums);
router.get('/:id', isAuth, canRead, albumController.getAlbumById);
router.post('/', isAuth, canUpload, albumController.createAlbum);
router.put(
  '/:id',
  isAuth,
  canEdit,
  canModifyAlbum,
  albumController.updateAlbum,
);
router.delete('/:id', isAuth, canDelete, albumController.deleteAlbum);

module.exports = router;
