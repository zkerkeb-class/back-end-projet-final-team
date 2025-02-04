const trackSearchQuery = `
  WITH search_query AS (
    SELECT unnest(string_to_array(:phonetic_query, ' ')) AS keyword
  )
  SELECT
    t.id,
    t.title AS name,
    t.artist_id,
    t.album_id,
    art.name AS artist_name,
    alb.title AS album_name,
    t.phonetic_title,
    t.image_url,
    (t.audio_file_path::text)::json as audioFilePath,
    COUNT(s.keyword) AS match_count,
    SUM(levenshtein(s.keyword, t.phonetic_title)) AS total_levenshtein_distance,
    'track' AS entity_type
  FROM tracks t
  JOIN search_query s ON t.phonetic_title ILIKE '%' || s.keyword || '%'
  LEFT JOIN artists art ON t.artist_id = art.id
  LEFT JOIN albums alb ON t.album_id = alb.id
  GROUP BY 
    t.id, 
    t.title, 
    t.artist_id, 
    t.album_id, 
    t.phonetic_title, 
    art.name, 
    alb.title, 
    t.audio_file_path::text,  -- Conversion en text pour le GROUP BY
    t.image_url
  ORDER BY match_count DESC, total_levenshtein_distance ASC
  LIMIT :limit
`;

const artistSearchQuery = `
  WITH search_query AS (
    SELECT unnest(string_to_array(:phonetic_query, ' ')) AS keyword
  )
  SELECT
    a.id,
    a.name,
    NULL AS artist_id,
    NULL AS album_id,
    NULL AS artist_name,
    NULL AS album_name,
    a.phonetic_title,
    a.image_url,
    NULL AS audioFilePath,
    COUNT(s.keyword) AS match_count,
    SUM(levenshtein(s.keyword, a.phonetic_title)) AS total_levenshtein_distance,
    'artist' AS entity_type
  FROM artists a
  JOIN search_query s ON a.phonetic_title ILIKE '%' || s.keyword || '%'
  GROUP BY a.id, a.name, a.phonetic_title, a.image_url
  ORDER BY match_count DESC, total_levenshtein_distance ASC
  LIMIT :limit
`;

const albumSearchQuery = `
  WITH search_query AS (
    SELECT unnest(string_to_array(:phonetic_query, ' ')) AS keyword
  )
  SELECT
    al.id,
    al.title AS name,
    NULL AS artist_id,
    NULL AS album_id,
    NULL AS artist_name,
    NULL AS album_name,
    al.phonetic_title,
    al.image_url,
    NULL AS audioFilePath,
    COUNT(s.keyword) AS match_count,
    SUM(levenshtein(s.keyword, al.phonetic_title)) AS total_levenshtein_distance,
    'album' AS entity_type
  FROM albums al
  JOIN search_query s ON al.phonetic_title ILIKE '%' || s.keyword || '%'
  GROUP BY al.id, al.title, al.phonetic_title, al.image_url
  ORDER BY match_count DESC, total_levenshtein_distance ASC
  LIMIT :limit
`;

const playlistSearchQuery = `
  WITH search_query AS (
    SELECT unnest(string_to_array(:phonetic_query, ' ')) AS keyword
  )
  SELECT
    p.id,
    p.title AS name,
    NULL AS artist_id,
    NULL AS album_id,
    NULL AS artist_name,
    NULL AS album_name,
    p.phonetic_title,
    p.image_url,
    NULL AS audioFilePath,
    COUNT(s.keyword) AS match_count,
    SUM(levenshtein(s.keyword, p.phonetic_title)) AS total_levenshtein_distance,
    'playlist' AS entity_type
  FROM playlists p
  JOIN search_query s ON p.phonetic_title ILIKE '%' || s.keyword || '%'
  GROUP BY p.id, p.title, p.phonetic_title, p.image_url
  ORDER BY match_count DESC, total_levenshtein_distance ASC
  LIMIT :limit
`;

module.exports = {
  trackSearchQuery,
  artistSearchQuery,
  albumSearchQuery,
  playlistSearchQuery,
};
