const BaseService = require('./base.service');
const artistService = require('./artist.service');
const { Track, Artist, Album } = require('../models');
const { Op } = require('sequelize');

class TrackService extends BaseService {
  constructor() {
    super(Track);
  }

  async findByGenre(genre, options = {}) {
    try {
      return await this.findAll({
        where: { genre },
        include: [{ model: Artist }, { model: Album }],
        ...options,
      });
    } catch (error) {
      throw new Error(`Error fetching tracks by genre: ${error.message}`);
    }
  }

  async getTopTracks(limit = 10) {
    try {
      return await this.findAll({
        order: [['popularity_score', 'DESC']],
        limit,
        include: [{ model: Artist }, { model: Album }],
      });
    } catch (error) {
      throw new Error(`Error fetching top tracks: ${error.message}`);
    }
  }

  async searchTracks(query) {
    try {
      return await this.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: `%${query}%` } },
            { phonetic_title: { [Op.iLike]: `%${query}%` } },
          ],
        },
        include: [{ model: Artist }, { model: Album }],
      });
    } catch (error) {
      throw new Error(`Error searching tracks: ${error.message}`);
    }
  }

  async incrementPlayCount(trackId) {
    try {
      const track = await this.findById(trackId);
      const updatedTrack = await this.update(trackId, {
        total_plays: track.total_plays + 1,
        popularity_score: this.calculatePopularityScore(track),
      });

      // Update artist listener count
      if (track.artist_id) {
        await artistService.updateListenerCount(track.artist_id);
      }

      return updatedTrack;
    } catch (error) {
      throw new Error(`Error incrementing play count: ${error.message}`);
    }
  }

  async getTrackWithDetails(trackId) {
    try {
      return await this.findOne({
        where: { id: trackId },
        include: [
          {
            model: Artist,
            attributes: ['id', 'name', 'image_url'],
          },
          {
            model: Album,
            attributes: ['id', 'title', 'cover_art_url'],
          },
        ],
      });
    } catch (error) {
      throw new Error(`Error fetching track details: ${error.message}`);
    }
  }

  calculatePopularityScore(track) {
    // Simple popularity calculation based on total plays
    // You can make this more sophisticated by considering factors like:
    // - Recency of plays
    // - User ratings
    // - Playlist inclusions
    return Math.min(100, (track.total_plays / 1000) * 100);
  }
}

module.exports = new TrackService();
