const BaseService = require('./base.service');
const { Playlist, Track, Artist, Album, PlaylistTrack } = require('../models');
const { Op } = require('sequelize');
const cdnService = require('./cdn.service');

class PlaylistService extends BaseService {
  constructor() {
    super(Playlist);
  }

  async createPlaylist(userId, playlistData) {
    try {
      return await this.create({
        ...playlistData,
        creator_id: userId,
      });
    } catch (error) {
      throw new Error(`Error creating playlist: ${error.message}`);
    }
  }

  async updatePlaylist(playlistId, playlistData) {
    try {
      let coverImage = null;
      if (playlistData.cover_image) {
        coverImage = await cdnService.processPlaylistPicture(
          playlistData.cover_image,
        );
      }

      return await this.update(playlistId, {
        ...playlistData,
        cover_images: coverImage,
      });
    } catch (error) {
      throw new Error(`Error updating playlist: ${error.message}`);
    }
  }

  async addTrack(playlistId, trackId) {
    try {
      const playlist = await this.findById(playlistId);
      const track = await Track.findByPk(trackId);

      await PlaylistTrack.create({
        playlist_id: playlistId,
        track_id: trackId,
        track_order: playlist.total_tracks + 1,
      });

      await this.update(playlistId, {
        total_tracks: playlist.total_tracks + 1,
        total_duration_seconds:
          playlist.total_duration_seconds + (track.duration_seconds || 0),
      });

      return this.getPlaylistWithTracks(playlistId);
    } catch (error) {
      throw new Error(`Error adding track to playlist: ${error.message}`);
    }
  }

  async removeTrack(playlistId, trackId) {
    try {
      const playlist = await this.findById(playlistId);
      const track = await Track.findByPk(trackId);

      await PlaylistTrack.destroy({
        where: {
          playlist_id: playlistId,
          track_id: trackId,
        },
      });

      // Reorder remaining tracks
      await this.reorderTracks(playlistId);

      await this.update(playlistId, {
        total_tracks: Math.max(0, playlist.total_tracks - 1),
        total_duration_seconds: Math.max(
          0,
          playlist.total_duration_seconds - (track.duration_seconds || 0),
        ),
      });

      return this.getPlaylistWithTracks(playlistId);
    } catch (error) {
      throw new Error(`Error removing track from playlist: ${error.message}`);
    }
  }

  async getPlaylistWithTracks(playlistId) {
    try {
      return await this.findOne({
        where: { id: playlistId },
        include: [
          {
            model: Track,
            include: [{ model: Artist }, { model: Album }],
            through: {
              attributes: ['track_order', 'added_at'],
            },
          },
        ],
        order: [[Track, PlaylistTrack, 'track_order', 'ASC']],
      });
    } catch (error) {
      throw new Error(`Error fetching playlist with tracks: ${error.message}`);
    }
  }

  async getUserPlaylists(userId) {
    try {
      return await this.findAll({
        where: {
          [Op.or]: [{ creator_id: userId }, { is_public: true }],
        },
        include: [
          {
            model: Track,
            include: [{ model: Artist }, { model: Album }],
            through: {
              attributes: ['track_order', 'added_at'],
            },
          },
        ],
        order: [['updated_at', 'DESC']],
      });
    } catch (error) {
      throw new Error(`Error fetching user playlists: ${error.message}`);
    }
  }

  async reorderTracks(playlistId) {
    try {
      const playlistTracks = await PlaylistTrack.findAll({
        where: { playlist_id: playlistId },
        order: [['track_order', 'ASC']],
      });

      await Promise.all(
        playlistTracks.map((pt, index) =>
          PlaylistTrack.update(
            { track_order: index + 1 },
            { where: { playlist_id: pt.playlist_id, track_id: pt.track_id } },
          ),
        ),
      );
    } catch (error) {
      throw new Error(`Error reordering tracks: ${error.message}`);
    }
  }
}

module.exports = new PlaylistService();
