const { Album } = require('../models');

const createAlbum = async (req, res, _next) => {
  try {
    const { album: albumData } = req.body;
    const album = await Album.create(albumData);
    return res.status(201).send({
      message: 'Album created successfully',
      album,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
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

const updateAlbum = async (req, res, _next) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await Album.update(req.body, {
      where: { id: id },
    });
    if (updatedRowsCount === 0) {
      return res.status(404).send({ message: 'Album not found' });
    }

    const updatedAlbum = await Album.findByPk(id, {
      attributes: { exclude: ['deletedAt', 'updatedAt'] },
    });

    return res.status(200).send({
      message: 'Album updated successfully',
      album: updatedAlbum,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
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
  deleteAlbum,
};
