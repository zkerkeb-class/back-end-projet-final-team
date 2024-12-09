const trackController = require('../controllers/track.controller');
const {
  checkResourceOwnership,
  canModifyTrack,
} = require('../middlewares/ownership');
const isAuth = require('../middlewares/isAuth');
const {
  canEdit,
  canDelete,
  canCreate,
  canRead,
} = require('../middlewares/permissions');
const express = require('express');

const router = express.Router();

router.get('/', isAuth, canRead, trackController.getTracks);
router.get('/:id', isAuth, canRead, trackController.getTrackById);
router.post('/', isAuth, canCreate, trackController.createTrack);
router.put(
  '/:id',
  isAuth,
  canEdit,
  checkResourceOwnership,
  canModifyTrack,
  trackController.updateTrack,
);
router.delete(
  '/:id',
  isAuth,
  canDelete,
  checkResourceOwnership,
  trackController.deleteTrack,
);

module.exports = router;
