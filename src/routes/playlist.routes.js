const router = require('express').Router();
const { playlistService } = require('../services');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const { playlistSchema } = require('./validations/music.validation');

// All playlist routes require authentication
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const playlists = await playlistService.getUserPlaylists(req.user.id);
    res.json(playlists);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const playlist = await playlistService.getPlaylistWithTracks(req.params.id);

    // Check if user has access to this playlist
    if (!playlist.is_public && playlist.creator_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'Access denied to private playlist' });
    }

    res.json(playlist);
  } catch (error) {
    next(error);
  }
});

router.post('/', validate(playlistSchema), async (req, res, next) => {
  try {
    const playlist = await playlistService.createPlaylist(
      req.user.id,
      req.body,
    );
    res.status(201).json(playlist);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validate(playlistSchema), async (req, res, next) => {
  try {
    const playlist = await playlistService.findById(req.params.id);

    // Check if user owns this playlist
    if (playlist.creator_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'You can only update your own playlists' });
    }

    const updatedPlaylist = await playlistService.update(
      req.params.id,
      req.body,
    );
    res.json(updatedPlaylist);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const playlist = await playlistService.findById(req.params.id);

    // Check if user owns this playlist
    if (playlist.creator_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own playlists' });
    }

    await playlistService.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// Track management in playlist
router.post('/:id/tracks/:trackId', async (req, res, next) => {
  try {
    const playlist = await playlistService.findById(req.params.id);

    // Check if user owns this playlist
    if (playlist.creator_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'You can only modify your own playlists' });
    }

    const updatedPlaylist = await playlistService.addTrack(
      req.params.id,
      req.params.trackId,
    );
    res.json(updatedPlaylist);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/tracks/:trackId', async (req, res, next) => {
  try {
    const playlist = await playlistService.findById(req.params.id);

    // Check if user owns this playlist
    if (playlist.creator_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'You can only modify your own playlists' });
    }

    const updatedPlaylist = await playlistService.removeTrack(
      req.params.id,
      req.params.trackId,
    );
    res.json(updatedPlaylist);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
