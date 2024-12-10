const trackController = require('../controllers/track.controller');
const { canModifyTrack } = require('../middlewares/ownership');
const isAuth = require('../middlewares/isAuth');
const {
  canEdit,
  canDelete,
  canUpload,
  canRead,
} = require('../middlewares/checkPermission');
const {
  validateTrack,
  validateUpdateTrack,
} = require('../middlewares/schema/track.schema');
const express = require('express');

const router = express.Router();

router.get('/', isAuth, canRead, trackController.getTracks);
router.get('/:id', isAuth, canRead, trackController.getTrackById);
router.post('/', isAuth, canUpload, validateTrack, trackController.createTrack);
router.put(
  '/:id',
  isAuth,
  canEdit,
  canModifyTrack,
  validateUpdateTrack,
  trackController.updateTrack,
);
router.delete(
  '/:id',
  isAuth,
  canDelete,
  canModifyTrack,
  trackController.deleteTrack,
);

module.exports = router;
