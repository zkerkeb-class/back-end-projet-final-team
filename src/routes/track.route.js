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

router.get('/tracks', isAuth, canRead, trackController.getTracks);
router.get('/tracks/:id', isAuth, canRead, trackController.getTrackById);
router.post('/tracks', isAuth, canCreate, trackController.createTrack);
router.put(
  '/tracks/:id',
  isAuth,
  canEdit,
  checkResourceOwnership,
  canModifyTrack,
  trackController.updateTrack,
);
router.delete(
  '/tracks/:id',
  isAuth,
  canDelete,
  checkResourceOwnership,
  trackController.deleteTrack,
);

module.exports = router;
