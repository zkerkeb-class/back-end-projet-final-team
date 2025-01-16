const { Album } = require('../models');
const { albumService } = require('../services');
const cacheService = require('../services/redisCache.service');

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
    const { limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    const cacheKey = `albums:${limit}:${offset}`;

    // Check cache
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.status(200).send(cachedData);
    }

    const { count, rows } = await Album.findAndCountAll({
      attributes: {
        exclude: ['deletedAt', 'updatedAt'],
      },
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    const response = {
      data: rows,
      metadata: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: count,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };

    // Set cache
    await cacheService.set(cacheKey, response);

    return res.status(200).send(response);
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

const deleteAlbum = async (req, res, next) => {
  try {
    const album = await albumService.findById(req.params.id);

    if (
      album.primary_artist_id !== req.user.artist_id &&
      req.user.user_type !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own albums' });
    }

    await albumService.deleteAlbum(req.params.id, album.cover_art_url?.baseKey);
    res.status(204).end();
  } catch (error) {
    next(error);
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
