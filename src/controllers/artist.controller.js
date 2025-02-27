const { Artist } = require('../models');

const createArtist = async (req, res, _next) => {
  try {
    const { artist: artistData } = req.body;
    const artist = await Artist.create(artistData);
    return res.status(201).send({
      message: 'Artist created successfully',
      artist,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const getArtists = async (req, res, _next) => {
  try {
    const artists = await Artist.findAll(
      { attributes: { exclude: ['deletedAt', 'updatedAt'] } },
      { limit: 20 },
    );
    return res.status(200).send(artists);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const getArtistById = async (req, res, _next) => {
  try {
    const { id } = req.params;
    const artist = await Artist.findByPk(id);
    if (!artist) {
      return res.status(404).send({ message: 'Artist not found' });
    }
    return res.status(200).send(artist);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const updateArtist = async (req, res, _next) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await Artist.update(req.body, {
      where: { id: id },
    });
    if (updatedRowsCount === 0) {
      return res.status(404).send({ message: 'Artist not found' });
    }

    const updatedArtist = await Artist.findByPk(id, {
      attributes: { exclude: ['deletedAt', 'updatedAt'] },
    });

    return res.status(200).send({
      message: 'Artist updated successfully',
      artist: updatedArtist,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const deleteArtist = async (req, res, _next) => {
  try {
    const { id } = req.params;
    const deleted = await Artist.destroy({
      where: { id: id },
    });
    if (!deleted) {
      return res.status(404).send({ message: 'Artist not found' });
    }
    return res.status(200).send({ message: 'Artist deleted successfully' });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

module.exports = {
  createArtist,
  getArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
};
