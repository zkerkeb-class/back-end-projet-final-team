const { playlist } = require('../models');
const { playlistService } = require('../services');

const createPlaylist = async (req, res, next) => {
  try {
    const playlists = await playlistService.findAll({
      where: { creator_id: req.user.id },
    });
    const playlist = await playlistService.create({
      creator_id: req.user.id,
      is_public: true,
      name: `My playlist n°${playlists.length + 1}`,
    });
    res.status(201).json(playlist);
  } catch (error) {
    next(error);
  }
};

const getPlaylists = async (req, res, _next) => {
  try {
    const playlists = await playlist.findAll({
      attributes: { exclude: ['deletedAt', 'updatedAt'] },
      limit: 20,
    });
    return res.status(200).send(playlists);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const getPlaylistById = async (req, res, _next) => {
  try {
    const { id } = req.params;
    const playlist = await playlist.findByPk(id);
    if (!playlist) {
      return res.status(404).send({ message: 'Playlist not found' });
    }
    return res.status(200).send(playlist);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const updatePlaylist = async (req, res, next) => {
  try {
    const playlist = await playlistService.findById(req.params.id);

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
};

const deletePlaylist = async (req, res, _next) => {
  try {
    const { id } = req.params;
    const playlist = await playlist.findByPk(id);

    if (!playlist) {
      return res.status(404).send({ message: 'Playlist not found' });
    }

    await playlist.destroy();

    return res.status(204).send();
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

module.exports = {
  createPlaylist,
  getPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
};
