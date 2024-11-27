const { playlist } = require('../models');

const createPlaylist = async (req, res, _next) => {
  try {
    const { playlist: playlistData } = req.body;
    const newPlaylist = await playlist.create(playlistData);
    return res.status(201).send({
      message: 'Playlist created successfully',
      playlist: newPlaylist,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
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

const updatePlaylist = async (req, res, _next) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await playlist.update(req.body, {
      where: { id: id },
    });
    if (updatedRowsCount === 0) {
      return res.status(404).send({ message: 'Playlist not found' });
    }

    const updatedPlaylist = await playlist.findByPk(id, {
      attributes: { exclude: ['deletedAt', 'updatedAt'] },
    });

    return res.status(200).send({
      message: 'Playlist updated successfully',
      playlist: updatedPlaylist,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
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
