const BaseService = require('./base.service');
const { Album, Artist, Track, AlbumArtist } = require('../models');
const { Op } = require('sequelize');

class AlbumService extends BaseService {
  constructor() {
    super(Album);
  }

  async createAlbum(albumData, artistIds) {
    try {
      const album = await this.create(albumData);

      if (artistIds && artistIds.length > 0) {
        await Promise.all(
          artistIds.map((artistId) =>
            AlbumArtist.create({
              album_id: album.id,
              artist_id: artistId,
              role:
                artistId === albumData.primary_artist_id
                  ? 'primary'
                  : 'featured',
            }),
          ),
        );
      }

      return this.getAlbumWithDetails(album.id);
    } catch (error) {
      throw new Error(`Error creating album: ${error.message}`);
    }
  }

  async getAlbumWithDetails(albumId) {
    try {
      return await this.findOne({
        where: { id: albumId },
        include: [
          {
            model: Artist,
            through: {
              attributes: ['role'],
            },
          },
          {
            model: Track,
            order: [['track_number', 'ASC']],
          },
        ],
      });
    } catch (error) {
      throw new Error(`Error fetching album details: ${error.message}`);
    }
  }

  async findByGenre(genre) {
    try {
      return await this.findAll({
        where: { genre },
        include: [{ model: Artist }, { model: Track }],
        order: [['release_date', 'DESC']],
      });
    } catch (error) {
      throw new Error(`Error fetching albums by genre: ${error.message}`);
    }
  }

  async searchAlbums(query) {
    try {
      return await this.findAll({
        where: {
          title: { [Op.iLike]: `%${query}%` },
        },
        include: [{ model: Artist }, { model: Track }],
      });
    } catch (error) {
      throw new Error(`Error searching albums: ${error.message}`);
    }
  }

  async getArtistAlbums(artistId) {
    try {
      return await this.findAll({
        include: [
          {
            model: Artist,
            where: { id: artistId },
            through: {
              attributes: ['role'],
            },
          },
          {
            model: Track,
            order: [['track_number', 'ASC']],
          },
        ],
        order: [['release_date', 'DESC']],
      });
    } catch (error) {
      throw new Error(`Error fetching artist albums: ${error.message}`);
    }
  }

  async updateAlbumStats(albumId) {
    try {
      const album = await this.getAlbumWithDetails(albumId);
      const tracks = album.Tracks || [];

      const totalDuration = tracks.reduce(
        (sum, track) => sum + (track.duration_seconds || 0),
        0,
      );
      const averagePopularity =
        tracks.reduce((sum, track) => sum + (track.popularity_score || 0), 0) /
        (tracks.length || 1);

      return await this.update(albumId, {
        total_tracks: tracks.length,
        total_duration_seconds: totalDuration,
        popularity_score: averagePopularity,
      });
    } catch (error) {
      throw new Error(`Error updating album stats: ${error.message}`);
    }
  }
}

module.exports = new AlbumService();
