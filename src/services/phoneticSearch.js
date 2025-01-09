const { sequelize } = require('./db.service');
const natural = require('natural');
const logger = require('../utils/loggerUtil');
const Sequelize = require('sequelize');

class PhoneticSearch {
  constructor() {
    this.metaphone = new natural.Metaphone();
  }

  async searchTracks(query, limit, entity) {
    const nameOrTitle = entity === 'artists' ? 'name' : 'title';
    const sql = `
    WITH search_query AS (
    SELECT 
      unnest(string_to_array(:phonetic_query, ' ')) AS keyword
  ),
    matched_entity AS (
      SELECT
        t.id,
        t.${nameOrTitle} AS title,
        t.phonetic_title,
        COUNT(s.keyword) AS match_count,
        SUM(levenshtein(s.keyword, t.phonetic_title)) AS total_levenshtein_distance
      FROM
        ${entity} t
      JOIN search_query s
        ON t.phonetic_title ILIKE '%' || s.keyword || '%'
      GROUP BY t.id, t.${nameOrTitle}, t.phonetic_title
    )
    SELECT
      id,
      title,
      phonetic_title,
      match_count,
      total_levenshtein_distance
    FROM
      matched_entity
    ORDER BY
      match_count DESC,
      total_levenshtein_distance ASC
    LIMIT :limit;
  `;

    const phoneticQuery = query
      .split(' ')
      .map((word) => this.metaphone.process(word))
      .join(' ');

    try {
      const results = await sequelize.query(sql, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { phonetic_query: phoneticQuery, limit },
      });
      return results;
    } catch (err) {
      logger.error('Erreur lors de la recherche des titres :', err);
      throw err;
    }
  }
}

module.exports = new PhoneticSearch();
