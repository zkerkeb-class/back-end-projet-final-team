const { Album } = require('../models');
const { albumService } = require('../services');

const createAlbum = async (req, res, next) => {
  try {
    if (
      req.user.artist_id !== req.body.primary_artist_id &&
      req.user.user_type !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'You can only create albums for yourself' });
    }

    const albumData = {
      ...req.body,
      cover_art_url: req.file?.buffer,
    };

    const album = await albumService.createAlbum(albumData);
    res.status(201).json(album);
  } catch (error) {
    next(error);
  }
};

const getAlbums = async (req, res, _next) => {
  try {
    const albums = await Album.findAll(
      { attributes: { exclude: ['deletedAt', 'updatedAt'] } },
      { limit: 20 },
    );
    return res.status(200).send(albums);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const getAlbumById = async (req, res, _next) => {
  try {
    const { id } = req.params;
    const album = await Album.findByPk(id);
    if (!album) {
      return res.status(404).send({ message: 'Album not found' });
    }
    return res.status(200).send(album);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const updateAlbum = async (req, res, next) => {
  try {
    const album = await albumService.findById(req.params.id);

    if (
      album.primary_artist_id !== req.user.artist_id &&
      req.user.user_type !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'You can only update your own albums' });
    }

    const updatedAlbum = await albumService.update(req.params.id, req.body);
    res.json(updatedAlbum);
  } catch (error) {
    next(error);
  }
};

const updateAlbumCoverArt = async (req, res, next) => {
  try {
    const album = await albumService.findById(req.params.id);

    if (album.primary_artist_id !== req.user.artist_id) {
      return res
        .status(403)
        .json({ message: 'You can only update your own albums' });
    }

    const updatedAlbum = await albumService.updateAlbumCover(
      album,
      req.file.buffer,
    );
    res.json(updatedAlbum);
  } catch (error) {
    next(error);
  }
};

const deleteAlbum = async (req, res, _next) => {
  try {
    const { id } = req.params;
    const album = await Album.findByPk(id);

    if (!album) {
      return res.status(404).send({ message: 'Album not found' });
    }

    await album.destroy();

    res.status(204).send();
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  createAlbum,
  getAlbums,
  getAlbumById,
  updateAlbum,
  updateAlbumCoverArt,
  deleteAlbum,
};
