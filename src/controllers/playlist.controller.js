const { playlistService } = require('../services');

const createPlaylist = async (req, res, next) => {
  try {
    const playlist = await playlistService.createPlaylist(req.user.id);
    res.status(201).json(playlist);
  } catch (error) {
    next(error);
  }
};

const updatePlaylistData = async (req, res, next) => {
  try {
    const playlist = await playlistService.findById(req.params.id);

    if (playlist.creator_id !== req.user.id) {
      return res.status(403).json({
        message: 'You can only update your own playlists',
      });
    }

    const updatedPlaylist = await playlistService.updatePlaylistData(
      req.params.id,
      req.body,
    );
    res.json(updatedPlaylist);
  } catch (error) {
    next(error);
  }
};

const updatePlaylistCover = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No cover image provided' });
    }

    const playlist = await playlistService.findById(req.params.id);

    if (playlist.creator_id !== req.user.id) {
      return res.status(403).json({
        message: 'You can only update your own playlists',
      });
    }

    const updatedPlaylist = await playlistService.updatePlaylistCover(
      req.params.id,
      req.file.buffer,
    );
    res.json(updatedPlaylist);
  } catch (error) {
    next(error);
  }
};

const deletePlaylist = async (req, res, next) => {
  try {
    const playlist = await playlistService.findById(req.params.id);

    if (playlist.creator_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own playlists' });
    }

    await playlistService.deletePlaylist(
      req.params.id,
      playlist.cover_images?.baseKey,
    );
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPlaylist,
  updatePlaylistData,
  updatePlaylistCover,
  deletePlaylist,
};
