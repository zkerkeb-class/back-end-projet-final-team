const User = require('./user.model');
const Playlist = require('./playlist.model');
const PlaylistTrack = require('./playlistTrack.model');
const Track = require('./track.model');
const Artist = require('./artist.model');
const Album = require('./album.model');

// Define associations
User.hasMany(Playlist, {
  foreignKey: 'user_id',
  as: 'playlists',
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

Artist.hasMany(Track, {
  foreignKey: 'artist_id',
  as: 'tracks',
});

Artist.hasMany(Album, {
  foreignKey: 'artist_id',
  as: 'albums',
});

Album.belongsTo(Artist, {
  foreignKey: 'artist_id',
  as: 'artist',
});

Album.hasMany(Track, {
  foreignKey: 'album_id',
  as: 'tracks',
});

module.exports = {
  User,
  Playlist,
  PlaylistTrack,
  Track,
  Artist,
  Album,
};
