const { sequelize } = require('./db.service');
const natural = require('natural');
const logger = require('../utils/loggerUtil');
const Sequelize = require('sequelize');

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

    if (entity === 'all') {
      sql = `
WITH search_query AS (
  SELECT 
    unnest(string_to_array(:phonetic_query, ' ')) AS keyword
),
matched_entity AS (
  SELECT
    t.id,
    t.title AS name,
    t.artist_id,
    t.album_id,
    art.name AS artist_name,
    alb.title AS album_name,
    t.phonetic_title,
    t.image_url,
    COUNT(s.keyword) AS match_count,
    SUM(levenshtein(s.keyword, t.phonetic_title)) AS total_levenshtein_distance,
    'track' AS entity_type
  FROM tracks t
  JOIN search_query s
      ON t.phonetic_title ILIKE '%' || s.keyword || '%'
  LEFT JOIN artists art
      ON t.artist_id = art.id
  LEFT JOIN albums alb
      ON t.album_id = alb.id
  GROUP BY t.id, t.title, t.artist_id, t.album_id, t.phonetic_title, art.name, alb.title

  UNION ALL

  SELECT
    a.id,
    a.name,
    NULL AS artist_id,
    NULL AS album_id,
    NULL AS artist_name,
    NULL AS album_name,
    a.phonetic_title,
    a.image_url,
    COUNT(s.keyword) AS match_count,
    SUM(levenshtein(s.keyword, a.phonetic_title)) AS total_levenshtein_distance,
    'artist' AS entity_type
  FROM artists a
  JOIN search_query s
    ON a.phonetic_title ILIKE '%' || s.keyword || '%'
  GROUP BY a.id, a.name, a.phonetic_title

  UNION ALL

  SELECT
    al.id,
    al.title AS name,
    NULL AS artist_id,
    NULL AS album_id,
    NULL AS artist_name,
    NULL AS album_name,
    al.phonetic_title,
    al.cover_art_url as image_url,
    COUNT(s.keyword) AS match_count,
    SUM(levenshtein(s.keyword, al.phonetic_title)) AS total_levenshtein_distance,
    'album' AS entity_type
  FROM albums al
  JOIN search_query s
    ON al.phonetic_title ILIKE '%' || s.keyword || '%'
  GROUP BY al.id, al.title, al.phonetic_title

  UNION ALL

  SELECT
    p.id,
    p.title,
    NULL AS artist_id,
    NULL AS album_id,
    NULL AS artist_name,
    NULL AS album_name,
    p.phonetic_title,
    p.cover_images as image_url,
    COUNT(s.keyword) AS match_count,
    SUM(levenshtein(s.keyword, p.phonetic_title)) AS total_levenshtein_distance,
    'playlist' AS entity_type
  FROM playlists p
  JOIN search_query s
    ON p.phonetic_title ILIKE '%' || s.keyword || '%'
  GROUP BY p.id, p.title, p.phonetic_title
)
SELECT
  id,
  name,
  artist_id,
  album_id,
  artist_name,
  album_name,
  phonetic_title,
  match_count,
  total_levenshtein_distance,
  entity_type,
  image_url
FROM
  matched_entity
ORDER BY
  match_count DESC,
  total_levenshtein_distance ASC
LIMIT :limit;
      `;
    } else {
      const nameOrTitle = entity === 'artists' ? 'name' : 'title';
      sql = `
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
}

module.exports = new PhoneticSearch();
