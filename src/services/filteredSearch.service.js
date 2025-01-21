const { Op } = require('sequelize');
const { Artist, Album, Track, Playlist, User } = require('../models');
const logger = require('../utils/loggerUtil');

class FilteredSearchService {
  /**
   * Build base where clause for text search including phonetic search
   */
  // TODO: Fix the search. find out if is it name or title
  buildBaseWhereClause(query, entity) {
    if (!query) return {};

    if (entity === 'artists') {
      return {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { phonetic_title: { [Op.iLike]: `%${query}%` } },
        ],
      };
    }

    return {
      [Op.or]: [
        { title: { [Op.iLike]: `%${query}%` } },
        { phonetic_title: { [Op.iLike]: `%${query}%` } },
      ],
    };
  }

  /**
   * Apply date range filters
   */
  applyDateFilters(whereClause, fromDate, toDate, dateField = 'release_date') {
    if (fromDate || toDate) {
      whereClause[dateField] = {};
      if (fromDate) whereClause[dateField][Op.gte] = fromDate;
      if (toDate) whereClause[dateField][Op.lte] = toDate;
    }
  }

  /**
   * Search tracks with filters
   */
  async searchTracks(query, filters = {}, limit, offset) {
    const whereClause = this.buildBaseWhereClause(query);

    if (filters.trackFilters) {
      const {
        genres,
        minDuration,
        maxDuration,
        fromReleaseDate,
        toReleaseDate,
        minPopularityScore,
      } = filters.trackFilters;

      if (genres?.length) {
        whereClause.genre = { [Op.overlap]: genres }; // Using overlap for array comparison
      }

      if (minDuration || maxDuration) {
        whereClause.duration_seconds = {};
        if (minDuration) whereClause.duration_seconds[Op.gte] = minDuration;
        if (maxDuration) whereClause.duration_seconds[Op.lte] = maxDuration;
      }

      this.applyDateFilters(whereClause, fromReleaseDate, toReleaseDate);

      if (minPopularityScore) {
        whereClause.popularity_score = { [Op.gte]: minPopularityScore };
      }
    }

    const { rows: tracks, count } = await Track.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['popularity_score', 'DESC']],
      include: [
        {
          model: Album,
          attributes: ['title'],
        },
        {
          model: Artist,
          attributes: ['name'],
        },
      ],
      distinct: true,
    });

    return {
      edges: tracks.map((track) => ({
        node: {
          id: track.id,
          name: track.title,
          album_id: track.album_id,
          artist_id: track.artist_id,
          album_name: track.Album?.title,
          artist_name: track.Artist?.name,
          duration: track.duration_seconds,
          trackNumber: track.track_number,
          lyrics: track.lyrics,
          genre: track.genre,
          audioFilePath: track.audio_file_path,
          popularityScore: track.popularity_score,
          image_url: track.image_url,
        },
        type: 'TITLE',
      })),
      count,
    };
  }

  /**
   * Search albums with filters
   */
  async searchAlbums(query, filters = {}, limit, offset) {
    const whereClause = this.buildBaseWhereClause(query);

    if (filters.albumFilters) {
      const {
        genres,
        minTracks,
        maxTracks,
        fromReleaseDate,
        toReleaseDate,
        minPopularityScore,
      } = filters.albumFilters;

      if (genres?.length) {
        whereClause.genre = { [Op.overlap]: genres };
      }

      if (minTracks || maxTracks) {
        whereClause.total_tracks = {};
        if (minTracks) whereClause.total_tracks[Op.gte] = minTracks;
        if (maxTracks) whereClause.total_tracks[Op.lte] = maxTracks;
      }

      this.applyDateFilters(whereClause, fromReleaseDate, toReleaseDate);

      if (minPopularityScore) {
        whereClause.popularity_score = { [Op.gte]: minPopularityScore };
      }
    }

    const { rows: albums, count } = await Album.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['popularity_score', 'DESC']],
      include: [
        {
          model: Artist,
          through: 'AlbumArtist',
          attributes: ['name'],
        },
      ],
      distinct: true,
    });

    return {
      edges: albums.map((album) => ({
        node: {
          id: album.id,
          name: album.title,
          releaseDate: album.release_date,
          genre: album.genre,
          primaryArtist: album.Artists[0]?.name,
          totalTracks: album.total_tracks,
          totalDuration_seconds: album.total_duration_seconds,
          popularityScore: album.popularity_score,
          image_url: album.image_url,
        },
        type: 'ALBUM',
      })),
      count,
    };
  }

  /**
   * Search artists with filters
   */
  async searchArtists(query, filters = {}, limit, offset) {
    const whereClause = this.buildBaseWhereClause(query, 'artists');

    if (filters.artistFilters) {
      const { genres, minPopularityScore } = filters.artistFilters;

      if (genres?.length) {
        whereClause.genre = { [Op.overlap]: genres };
      }

      if (minPopularityScore) {
        whereClause.popularity_score = { [Op.gte]: minPopularityScore };
      }
    }

    const { rows: artists, count } = await Artist.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['popularity_score', 'DESC']],
      distinct: true,
    });

    return {
      edges: artists.map((artist) => ({
        node: {
          id: artist.id,
          name: artist.name,
          genre: artist.genre,
          popularityScore: artist.popularity_score,
          image_url: artist.image_url,
        },
        type: 'ARTIST',
      })),
      count,
    };
  }

  /**
   * Search playlists with filters
   */
  async searchPlaylists(query, filters = {}, limit, offset) {
    const whereClause = this.buildBaseWhereClause(query);

    if (filters.playlistFilters) {
      const {
        minTracks,
        maxTracks,
        minDuration,
        maxDuration,
        minPopularityScore,
      } = filters.playlistFilters;

      if (minTracks || maxTracks) {
        whereClause.total_tracks = {};
        if (minTracks) whereClause.total_tracks[Op.gte] = minTracks;
        if (maxTracks) whereClause.total_tracks[Op.lte] = maxTracks;
      }

      if (minDuration || maxDuration) {
        whereClause.total_duration_seconds = {};
        if (minDuration)
          whereClause.total_duration_seconds[Op.gte] = minDuration;
        if (maxDuration)
          whereClause.total_duration_seconds[Op.lte] = maxDuration;
      }

      if (minPopularityScore) {
        whereClause.popularity_score = { [Op.gte]: minPopularityScore };
      }
    }

    const { rows: playlists, count } = await Playlist.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      include: [
        {
          model: User,
          attributes: ['username'],
          as: 'User',
        },
      ],
      distinct: true,
    });

    return {
      edges: playlists.map((playlist) => ({
        node: {
          id: playlist.id,
          name: playlist.title,
          creator: playlist.User?.username,
          totalTracks: playlist.total_tracks,
          totalDurationSeconds: playlist.total_duration_seconds,
          popularityScore: playlist.popularity_score,
          image_url: playlist.image_url,
        },
        type: 'PLAYLIST',
      })),
      count,
    };
  }

  /**
   * Main search function with pagination support
   */
  async filterSearch(input) {
    try {
      const { query, entityType, limit = 20, offset = 0 } = input;
      let results = { edges: [], count: 0 };

      if (entityType) {
        switch (entityType) {
          case 'TITLE':
            results = await this.searchTracks(query, input, limit, offset);
            break;
          case 'ALBUM':
            results = await this.searchAlbums(query, input, limit, offset);
            break;
          case 'ARTIST':
            results = await this.searchArtists(query, input, limit, offset);
            break;
          case 'PLAYLIST':
            results = await this.searchPlaylists(query, input, limit, offset);
            break;
        }
      } else {
        // Search all entity types
        const [tracks, albums, artists, playlists] = await Promise.all([
          this.searchTracks(query, input, limit, offset),
          this.searchAlbums(query, input, limit, offset),
          this.searchArtists(query, input, limit, offset),
          this.searchPlaylists(query, input, limit, offset),
        ]);

        results.edges = [
          ...tracks.edges,
          ...albums.edges,
          ...artists.edges,
          ...playlists.edges,
        ];
        results.count =
          tracks.count + albums.count + artists.count + playlists.count;
      }

      return {
        edges: results.edges,
        pageInfo: {
          hasNextPage: results.count > offset + limit,
          endCursor: Buffer.from(`${offset + limit}`).toString('base64'),
        },
        totalCount: results.count,
      };
    } catch (error) {
      logger.error('Search error:', error);
      throw new Error('An error occurred while performing the search');
    }
  }
}

module.exports = FilteredSearchService;
