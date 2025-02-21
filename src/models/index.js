const User = require('./user.model');
const Role = require('./role.model');
const Permission = require('./permission.model');
const Artist = require('./artist.model');
const Album = require('./album.model');
const Track = require('./track.model');
const Playlist = require('./playlist.model');
const UserRole = require('./userRole.model');
const AlbumArtist = require('./albumArtist.model');
const PlaylistTrack = require('./playlistTrack.model');
const ListeningSession = require('./listeningSession.model');
const AdminActionLog = require('./adminActionLog.model');
const JamRoom = require('./jamRoom.model');
const JamParticipant = require('./jamParticipant.model');

// User Associations
User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id' });

User.belongsTo(Artist, { foreignKey: 'artist_id' });
Artist.hasOne(User, { foreignKey: 'artist_id' });

User.hasMany(Playlist, { foreignKey: 'creator_id' });
Playlist.belongsTo(User, { foreignKey: 'creator_id' });

User.hasMany(AdminActionLog, { foreignKey: 'user_id' });
AdminActionLog.belongsTo(User, { foreignKey: 'user_id' });

// Role Associations
Role.hasMany(Permission, { foreignKey: 'role_id' });
Permission.belongsTo(Role, { foreignKey: 'role_id' });

// Artist Associations
Artist.belongsToMany(Album, { through: AlbumArtist, foreignKey: 'artist_id' });
Album.belongsToMany(Artist, { through: AlbumArtist, foreignKey: 'album_id' });

Artist.hasMany(Track, { foreignKey: 'artist_id' });
Track.belongsTo(Artist, { foreignKey: 'artist_id' });

Album.hasMany(Track, { foreignKey: 'album_id' });
Track.belongsTo(Album, { foreignKey: 'album_id' });

// Playlist Associations
Playlist.belongsToMany(Track, {
  through: PlaylistTrack,
  foreignKey: 'playlist_id',
});
Track.belongsToMany(Playlist, {
  through: PlaylistTrack,
  foreignKey: 'track_id',
});

// Listening Session Associations
ListeningSession.belongsTo(Track, { foreignKey: 'current_track_id' });
Track.hasMany(ListeningSession, { foreignKey: 'current_track_id' });

// Jam Session Relations
JamRoom.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

JamRoom.hasMany(JamParticipant, {
  foreignKey: 'roomId',
  as: 'participants',
});

JamParticipant.belongsTo(JamRoom, {
  foreignKey: 'roomId',
});

JamParticipant.belongsTo(User, {
  foreignKey: 'userId',
});

module.exports = {
  User,
  Role,
  Permission,
  Artist,
  Album,
  Track,
  Playlist,
  UserRole,
  AlbumArtist,
  PlaylistTrack,
  ListeningSession,
  AdminActionLog,
  JamRoom,
  JamParticipant,
};
