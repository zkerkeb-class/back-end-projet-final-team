const searchQueries = {
  tracks: `
    WITH search_query AS (
      SELECT unnest(string_to_array(:phonetic_query, ' ')) AS keyword
    ),
    matched_tracks AS (
      SELECT
        t.id,
        t.title as name,
        t.album_id,
        al.title as album_name,
        t.phonetic_title,
        t.duration_seconds as duration,
        t.genre,
        t.audio_file_path as audioFilePath,
        t.popularity_score as popularityScore,
        t.image_url,
        t.release_date,
        a.name as artist_name,
        al.title as album_title,
        COUNT(s.keyword) AS match_count,
        SUM(levenshtein(s.keyword, t.phonetic_title)) AS total_levenshtein_distance
      FROM tracks t
      JOIN search_query s ON t.phonetic_title ILIKE '%' || s.keyword || '%'
      LEFT JOIN artists a ON t.artist_id = a.id
      LEFT JOIN albums al ON t.album_id = al.id
      GROUP BY t.id, t.title, t.phonetic_title, t.duration_seconds, t.popularity_score, 
               t.release_date, a.name, al.title
    )
    SELECT * FROM matched_tracks
  `,

  albums: `
    WITH search_query AS (
      SELECT unnest(string_to_array(:phonetic_query, ' ')) AS keyword
    ),
    matched_albums AS (
      SELECT
        al.id,
        al.title as name,
        al.genre,
        al.primary_artist_id as artist_id,
        a.name as artist_name,
        al.phonetic_title,
        al.release_date,
        al.total_tracks,
        al.popularity_score as popularityScore,
        a.name as artist_name,
        COUNT(s.keyword) AS match_count,
        SUM(levenshtein(s.keyword, al.phonetic_title)) AS total_levenshtein_distance
      FROM albums al
      JOIN search_query s ON al.phonetic_title ILIKE '%' || s.keyword || '%'
      LEFT JOIN artists a ON al.primary_artist_id = a.id
      GROUP BY al.id, al.title, al.phonetic_title, al.release_date, 
               al.total_tracks, a.name
    )
    SELECT * FROM matched_albums
  `,

  artists: `
    WITH search_query AS (
      SELECT unnest(string_to_array(:phonetic_query, ' ')) AS keyword
    ),
    matched_artists AS (
      SELECT
        a.id,
        a.name,
        a.phonetic_title,
        a.genre,
        a.popularity_score,
        COUNT(s.keyword) AS match_count,
        SUM(levenshtein(s.keyword, a.phonetic_title)) AS total_levenshtein_distance
      FROM artists a
      JOIN search_query s ON a.phonetic_title ILIKE '%' || s.keyword || '%'
      GROUP BY a.id, a.name, a.phonetic_title, a.genre, a.popularity_score
    )
    SELECT * FROM matched_artists
  `,

  playlists: `
    WITH search_query AS (
      SELECT unnest(string_to_array(:phonetic_query, ' ')) AS keyword
    ),
    matched_playlists AS (
      SELECT
        p.id,
        p.title as name,
        p.phonetic_title,
        p.total_tracks as totalTracks,
        p.total_duration_seconds as TotalDurationSeconds,
        p.popularity_score as popularityScore,
        p.image_url,
        u.username as creator_name,
        COUNT(s.keyword) AS match_count,
        SUM(levenshtein(s.keyword, p.phonetic_title)) AS total_levenshtein_distance
      FROM playlists p
      JOIN search_query s ON p.phonetic_title ILIKE '%' || s.keyword || '%'
      LEFT JOIN users u ON p.creator_id = u.id
      GROUP BY p.id, p.title, p.phonetic_title, p.total_tracks, 
               p.total_duration_seconds, p.popularity_score, u.username
    )
    SELECT * FROM matched_playlists
  `,
};

module.exports = searchQueries;
