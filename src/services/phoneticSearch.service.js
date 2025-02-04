const { sequelize } = require('./db.service');
const natural = require('natural');
const logger = require('../utils/loggerUtil');
const Sequelize = require('sequelize');
const searchQueries = require('../database/search/search.queries');
const phoneticSearchQueries = require('../database/search/phoneticSearch.queries');
const { QueryTypes } = require('sequelize');
const {
  trackSearchQuery,
  artistSearchQuery,
  albumSearchQuery,
  playlistSearchQuery,
} = require('../database/search/phoneticSearch.queries');

class PhoneticSearch {
  constructor() {
    this.metaphone = new natural.Metaphone();
    this.queryMap = {
      tracks: trackSearchQuery,
      artists: artistSearchQuery,
      albums: albumSearchQuery,
      playlists: playlistSearchQuery,
    };
  }

  async search(query, limit, entity) {
    const phoneticQuery = query
      .split(' ')
      .map((word) => this.metaphone.process(word))
      .join(' ');

    const queryOptions = {
      type: Sequelize.QueryTypes.SELECT,
      replacements: { phonetic_query: phoneticQuery, limit },
    };

    try {
      if (entity === 'all') {
        const [tracks, artists, albums, playlists] = await Promise.all([
          sequelize.query(trackSearchQuery, queryOptions),
          sequelize.query(artistSearchQuery, queryOptions),
          sequelize.query(albumSearchQuery, queryOptions),
          sequelize.query(playlistSearchQuery, queryOptions),
        ]);

        return {
          tracks,
          artists,
          albums,
          playlists,
        };
      }

      // Map des requêtes par type d'entité
      const queryMap = {
        tracks: trackSearchQuery,
        artists: artistSearchQuery,
        albums: albumSearchQuery,
        playlists: playlistSearchQuery,
      };

      const sql = queryMap[entity];
      if (!sql) {
        throw new Error(`Type d'entité non supporté: ${entity}`);
      }

      return await this.sequelize.query(sql, queryOptions);
    } catch (err) {
      logger.error('Erreur lors de la recherche :', err);
      throw err;
    }
  }

  async searchEntity(query, limit = 10, entity) {
    try {
      const results = {
        tracks: [],
        albums: [],
        artists: [],
        playlists: [],
      };
      const phonetic_query = this.metaphone.process(query);
      const sql = searchQueries[entity];

      if (!sql) {
        throw new Error(`Invalid entity type: ${entity}`);
      }

      let data = await sequelize.query(sql, {
        replacements: { phonetic_query },
        type: QueryTypes.SELECT,
      });

      data = this.sortAndLimitResults(data, limit);
      results[entity] = data;

      return results;
    } catch (error) {
      logger.error(`Error in phonetic search for ${entity}:`, error);
      throw error;
    }
  }

  sortAndLimitResults(results, limit) {
    return results
      .sort((a, b) => {
        if (b.match_count !== a.match_count) {
          return b.match_count - a.match_count;
        }
        return a.total_levenshtein_distance - b.total_levenshtein_distance;
      })
      .slice(0, limit);
  }
}

module.exports = new PhoneticSearch();
