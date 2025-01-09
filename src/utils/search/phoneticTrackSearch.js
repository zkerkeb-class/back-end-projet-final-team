const { sequelize } = require('../../services/db.service');
const natural = require('natural');
const logger = require('./../loggerUtil');
const Sequelize = require('sequelize');

const metaphone = new natural.Metaphone();

async function searchTracks(query) {
  const sql = `
  WITH search_query AS (
  SELECT 
    unnest(string_to_array(:phonetic_query, ' ')) AS keyword
),
  matched_tracks AS (
    SELECT
      t.id,
      t.title,
      t.phonetic_title,
      COUNT(s.keyword) AS match_count,
      SUM(levenshtein(s.keyword, t.phonetic_title)) AS total_levenshtein_distance
    FROM
      tracks t
    JOIN search_query s
      ON t.phonetic_title ILIKE '%' || s.keyword || '%'
    GROUP BY t.id, t.title, t.phonetic_title
  )
  SELECT
    id,
    title,
    phonetic_title,
    match_count,
    total_levenshtein_distance
  FROM
    matched_tracks
  ORDER BY
    match_count DESC,
    total_levenshtein_distance ASC
  LIMIT 5;
`;

  const phoneticQuery = query
    .split(' ')
    .map((word) => metaphone.process(word))
    .join(' ');

  try {
    const results = await sequelize.query(sql, {
      type: Sequelize.QueryTypes.SELECT,
      replacements: { phonetic_query: phoneticQuery },
    });
    return results;
  } catch (err) {
    logger.error('Erreur lors de la recherche des titres :', err);
    throw err;
  }
}

module.exports = searchTracks;
