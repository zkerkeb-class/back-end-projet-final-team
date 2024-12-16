const BaseService = require('./base.service');
const { Artist, Album, Track, User } = require('../models');
const { Op } = require('sequelize');

class ArtistService extends BaseService {
  constructor() {
    super(Artist);
  }

  async findByGenre(genre) {
    try {
      return await this.findAll({
        where: { genre },
        include: [{ model: Album }],
      });
    } catch (error) {
      throw new Error(`Error fetching artists by genre: ${error.message}`);
    }
  }

  async getTopArtists(limit = 10) {
    try {
      return await this.findAll({
        order: [['total_listeners', 'DESC']],
        limit,
        include: [{ model: Album }],
      });
    } catch (error) {
      throw new Error(`Error fetching top artists: ${error.message}`);
    }
  }

  async searchArtists(query) {
    try {
      return await this.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${query}%` } },
            { phonetic_name: { [Op.iLike]: `%${query}%` } },
          ],
        },
        include: [{ model: Album }],
      });
    } catch (error) {
      throw new Error(`Error searching artists: ${error.message}`);
    }
  }

  async getArtistProfile(artistId) {
    try {
      return await this.findOne({
        where: { id: artistId },
        include: [
          {
            model: Album,
            include: [{ model: Track }],
          },
          {
            model: User,
            attributes: ['id', 'username', 'email', 'profile_picture_url'],
          },
        ],
      });
    } catch (error) {
      throw new Error(`Error fetching artist profile: ${error.message}`);
    }
  }

  async updateListenerCount(artistId, increment = true) {
    try {
      const artist = await this.findById(artistId);
      return await this.update(artistId, {
        total_listeners: increment
          ? artist.total_listeners + 1
          : Math.max(0, artist.total_listeners - 1),
      });
    } catch (error) {
      throw new Error(`Error updating listener count: ${error.message}`);
    }
  }
}

module.exports = new ArtistService();
