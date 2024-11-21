const User = require('./user.model');
const Playlist = require('./playlist.model');
const PlaylistTrack = require('./playlist-track.model');

User.hasMany(Playlist, {
  foreignKey: 'user_id',
  as: 'playlists',
});

Playlist.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Playlist.belongsToMany(PlaylistTrack, {
  through: 'PlaylistTrack',
  foreignKey: 'track_id',
  otherKey: 'playlist_id',
  as: 'playlists',
});
