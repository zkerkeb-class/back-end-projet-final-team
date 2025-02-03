const BaseService = require('./base.service');
const { Playlist, Track, Artist, Album, PlaylistTrack } = require('../models');
const cdnService = require('./cdn.service');

class PlaylistService extends BaseService {
  constructor() {
    super(Playlist);
  }

  async createPlaylist(userId) {
    try {
      const numPlaylists = await Playlist.count({
        where: { creator_id: userId },
      });
      return await this.create({
        creator_id: userId,
        title: `My playlist n°${numPlaylists + 1}`,
        is_public: true,
      });
    } catch (error) {
      throw new Error(`Error creating playlist: ${error.message}`);
    }
  }

  async updatePlaylistData(playlistId, playlistData) {
    if (!playlistId) {
      throw new Error('Playlist ID is required');
    }
    try {
      return await this.update(playlistId, {
        title: playlistData.title,
        is_public: playlistData.is_public,
      });
    } catch (error) {
      throw new Error(`Error updating playlist data: ${error.message}`);
    }
  }

  async updatePlaylistCover(playlistId, imageBuffer) {
    if (!playlistId) {
      throw new Error('Playlist ID is required');
    }
    try {
      const playlist = await this.findById(playlistId);

      // Delete old cover image if exists
      if (playlist.image_url?.baseKey) {
        await cdnService.deleteProfilePictures(playlist.image_url.baseKey);
      }

      const coverImage = await cdnService.processPlaylistPicture(imageBuffer);

      return await this.update(playlistId, {
        image_url: coverImage,
      });
    } catch (error) {
      throw new Error(`Error updating playlist cover: ${error.message}`);
    }
  }

  async deletePlaylist(playlistId, baseKey) {
    try {
      if (baseKey) {
        await cdnService.deleteProfilePictures(baseKey);
      }
      return await this.delete(playlistId);
    } catch (error) {
      throw new Error(`Error deleting playlist: ${error.message}`);
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
      const playlists = await Playlist.findAll({
        where: { creator_id: userId },
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

      return playlists.map((playlist) => {
        const plainPlaylist = playlist.get({ plain: true });
        plainPlaylist.tracks = plainPlaylist.Tracks;
        delete plainPlaylist.Tracks;
        return plainPlaylist;
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
