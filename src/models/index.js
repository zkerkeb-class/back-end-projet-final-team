const User = require('./user.model');
const Playlist = require('./playlist.model');
const PlaylistTrack = require('./playlistTrack.model');
const Track = require('./track.model');
const Artist = require('./artist.model');
const Album = require('./album.model');
const Genre = require('./genre.model');
const ArtistGenre = require('./artistGenre.model');
const TrackGenre = require('./trackGenre.model');
const AlbumGenre = require('./albumGenre.model');
const Role = require('./role.model');

// Define associations
User.hasMany(Playlist, {
  foreignKey: 'user_id',
  as: 'playlists',
});

User.belongsTo(Artist, {
  foreignKey: 'user_id',
  as: 'artist',
});

User.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role',
});

Playlist.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Playlist.belongsToMany(Track, {
  through: PlaylistTrack,
  foreignKey: 'playlist_id',
  otherKey: 'track_id',
  as: 'tracks',
});

Track.belongsToMany(Playlist, {
  through: PlaylistTrack,
  foreignKey: 'track_id',
  otherKey: 'playlist_id',
  as: 'playlists',
});

Track.belongsTo(Artist, {
  foreignKey: 'artist_id',
  as: 'artist',
});

Track.belongsTo(Album, {
  foreignKey: 'album_id',
  as: 'album',
});

Track.belongsToMany(Genre, {
  through: TrackGenre,
  foreignKey: 'track_id',
  otherKey: 'genre_id',
  as: 'genres',
});

Artist.hasMany(Track, {
  foreignKey: 'artist_id',
  as: 'tracks',
});

Artist.hasMany(Album, {
  foreignKey: 'artist_id',
  as: 'albums',
});

Artist.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'SET NULL',
});

Artist.belongsToMany(Genre, {
  through: ArtistGenre,
  foreignKey: 'artist_id',
  otherKey: 'genre_id',
  as: 'genres',
});

Album.belongsTo(Artist, {
  foreignKey: 'artist_id',
  as: 'artist',
});

Album.hasMany(Track, {
  foreignKey: 'album_id',
  as: 'tracks',
});

Album.belongsToMany(Genre, {
  through: AlbumGenre,
  foreignKey: 'album_id',
  otherKey: 'genre_id',
  as: 'genres',
});

Genre.belongsToMany(Artist, {
  through: ArtistGenre,
  foreignKey: 'genre_id',
  otherKey: 'artist_id',
  as: 'artists',
});

Genre.belongsToMany(Track, {
  through: TrackGenre,
  foreignKey: 'genre_id',
  otherKey: 'track_id',
  as: 'tracks',
});

Genre.belongsToMany(Album, {
  through: AlbumGenre,
  foreignKey: 'genre_id',
  otherKey: 'album_id',
  as: 'albums',
});

Role.hasMany(User, {
  foreignKey: 'role_id',
  as: 'users',
});

module.exports = {
  User,
  Playlist,
  PlaylistTrack,
  Track,
  Artist,
  Album,
  Genre,
  ArtistGenre,
  Role,
};
