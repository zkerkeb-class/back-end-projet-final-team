const router = require('express').Router();
const authRoutes = require('./auth.routes');
const artistRoutes = require('./artist.routes');
const albumRoutes = require('./album.routes');
const trackRoutes = require('./track.routes');
const playlistRoutes = require('./playlist.routes');
const logger = require('../utils/loggerUtil');
const adminRoutes = require('./admin.routes');

// Mount routes
router.use(`/auth`, authRoutes);
router.use(`/artists`, artistRoutes);
router.use(`/albums`, albumRoutes);
router.use(`/tracks`, trackRoutes);
router.use(`/playlists`, playlistRoutes);
router.use(`/admin`, adminRoutes);

// Health check endpoint
router.get(`/health`, (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
router.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Error handler
router.use((err, req, res, _next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

module.exports = router;
