const phoneticSearchQueries = {
  all: `
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
    t.duration_seconds AS duration,
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
  GROUP BY t.id, t.title, t.artist_id, t.album_id, t.phonetic_title, t.duration_seconds, art.name, alb.title, t.image_url

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
    NULL AS duration,
    COUNT(s.keyword) AS match_count,
    SUM(levenshtein(s.keyword, a.phonetic_title)) AS total_levenshtein_distance,
    'artist' AS entity_type
  FROM artists a
  JOIN search_query s
    ON a.phonetic_title ILIKE '%' || s.keyword || '%'
  GROUP BY a.id, a.name, a.phonetic_title, a.image_url

  UNION ALL

  SELECT
    al.id,
    al.title AS name,
    NULL AS artist_id,
    NULL AS album_id,
    NULL AS artist_name,
    NULL AS album_name,
    al.phonetic_title,
    al.image_url,
    NULL AS duration,
    COUNT(s.keyword) AS match_count,
    SUM(levenshtein(s.keyword, al.phonetic_title)) AS total_levenshtein_distance,
    'album' AS entity_type
  FROM albums al
  JOIN search_query s
    ON al.phonetic_title ILIKE '%' || s.keyword || '%'
  GROUP BY al.id, al.title, al.phonetic_title, al.image_url

  UNION ALL

  SELECT
    p.id,
    p.title AS name,
    NULL AS artist_id,
    NULL AS album_id,
    NULL AS artist_name,
    NULL AS album_name,
    p.phonetic_title,
    p.image_url,
    NULL AS duration,
    COUNT(s.keyword) AS match_count,
    SUM(levenshtein(s.keyword, p.phonetic_title)) AS total_levenshtein_distance,
    'playlist' AS entity_type
  FROM playlists p
  JOIN search_query s
    ON p.phonetic_title ILIKE '%' || s.keyword || '%'
  GROUP BY p.id, p.title, p.phonetic_title, p.image_url
)
SELECT
  id,
  name,
  artist_id,
  album_id,
  artist_name,
  album_name,
  phonetic_title,
  duration,
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
`,
  tracks: `
  WITH search_query AS (
      SELECT unnest(string_to_array(:phonetic_query, ' ')) AS keyword
    ),
    matched_tracks AS (
      SELECT
        t.id,
        t.title AS name,
        COALESCE(t.album_id::text, '') AS album_id,
        COALESCE(alb.title, '') AS album_name,
        COALESCE(t.artist_id::text, '') AS artist_id,
        COALESCE(art.name, '') AS artist_name,
        COALESCE(t.duration_seconds, 0) AS duration,
        t.lyrics,
        COALESCE(t.genre, '{}') AS genre,
        COALESCE(t.popularity_score, 0) AS "popularityScore",
        t.image_url,
        t.audio_file_path AS "audioFilePath",
        COUNT(s.keyword) AS match_count,
        SUM(levenshtein(s.keyword, t.phonetic_title)) AS total_levenshtein_distance
      FROM tracks t
      JOIN search_query s ON t.phonetic_title ILIKE '%' || s.keyword || '%'
      LEFT JOIN artists art ON t.artist_id = art.id
      LEFT JOIN albums alb ON t.album_id = alb.id
      WHERE t.artist_id IS NOT NULL
      GROUP BY 
        t.id, 
        t.title, 
        t.album_id, 
        alb.title, 
        t.artist_id, 
        art.name, 
        t.duration_seconds,
        t.lyrics,
        t.genre,
        t.popularity_score,
        t.image_url,
        t.audio_file_path
    )
    SELECT * FROM matched_tracks
    ORDER BY match_count DESC, total_levenshtein_distance ASC
    LIMIT :limit;
    `,
  albums: `
  WITH search_query AS (
      SELECT unnest(string_to_array(:phonetic_query, ' ')) AS keyword
    ),
    matched_albums AS (
      SELECT
        al.id,
        al.title AS name,
        al.release_date AS "releaseDate",
        al.genre,
        al.artist_id,
        art.name AS artist_name,
        al.total_tracks AS "totalTracks",
        al.total_duration_seconds AS "totalDurationSeconds",
        al.popularity_score AS "popularityScore",
        al.image_url,
        COUNT(s.keyword) AS match_count,
        SUM(levenshtein(s.keyword, al.phonetic_title)) AS total_levenshtein_distance
      FROM albums al
      JOIN search_query s ON al.phonetic_title ILIKE '%' || s.keyword || '%'
      LEFT JOIN artists art ON al.artist_id = art.id
      GROUP BY al.id, al.title, al.release_date, al.genre, al.artist_id, 
               art.name, al.total_tracks, al.total_duration_seconds, 
               al.popularity_score, al.image_url
    )
    SELECT * FROM matched_albums
    ORDER BY match_count DESC, total_levenshtein_distance ASC
    LIMIT :limit;
    `,
  artists: `
  WITH search_query AS (
      SELECT unnest(string_to_array(:phonetic_query, ' ')) AS keyword
    ),
    matched_artists AS (
      SELECT
        a.id,
        a.name,
        a.genre,
        a.popularity_score AS "popularityScore",
        a.image_url,
        COUNT(s.keyword) AS match_count,
        SUM(levenshtein(s.keyword, a.phonetic_title)) AS total_levenshtein_distance
      FROM artists a
      JOIN search_query s ON a.phonetic_title ILIKE '%' || s.keyword || '%'
      GROUP BY a.id, a.name, a.genre, a.popularity_score, a.image_url
    )
    SELECT * FROM matched_artists
    ORDER BY match_count DESC, total_levenshtein_distance ASC
    LIMIT :limit;
    `,
};

module.exports = phoneticSearchQueries;
