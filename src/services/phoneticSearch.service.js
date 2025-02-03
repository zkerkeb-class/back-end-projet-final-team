const { sequelize } = require('./db.service');
const natural = require('natural');
const logger = require('../utils/loggerUtil');
const Sequelize = require('sequelize');
const searchQueries = require('../database/search/search.queries');
const phoneticSearchQueries = require('../database/search/phoneticSearch.queries');
const { QueryTypes } = require('sequelize');

class PhoneticSearch {
  constructor() {
    this.metaphone = new natural.Metaphone();
  }

  async search(query, limit, entity) {
    let sql;
    const phoneticQuery = query
      .split(' ')
      .map((word) => this.metaphone.process(word))
      .join(' ');

    switch (entity) {
      case 'all':
        sql = phoneticSearchQueries.all;
        break;
      case 'track':
        sql = phoneticSearchQueries.tracks;
        break;
      case 'album':
        sql = phoneticSearchQueries.albums;
        break;
      case 'artist':
        sql = phoneticSearchQueries.artists;
        break;
      case 'playlist':
        sql = phoneticSearchQueries.playlists;
        break;
      default:
        throw new Error(`Invalid entity type: ${entity}`);
    }

    try {
      const results = await sequelize.query(sql, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { phonetic_query: phoneticQuery, limit },
      });
      if (entity === 'all') {
        return results.reduce(
          (acc, curr) => {
            acc[curr.entity_type + 's'].push(curr);
            return acc;
          },
          { tracks: [], albums: [], artists: [], playlists: [] },
        );
      }
      return results;
    } catch (err) {
      logger.error('Erreur lors de la recherche des titres :', err);
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
