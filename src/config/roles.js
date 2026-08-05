const PERMISSIONS = {
  MUSIC: {
    READ: 'read:music',
    UPLOAD: 'upload:music',
    DELETE: 'delete:music',
    EDIT: 'edit:music',
  },
  ALBUM: {
    CREATE: 'create:album',
    EDIT: 'edit:album',
    DELETE: 'delete:album',
  },
  PLAYLIST: {
    CREATE: 'create:playlist',
    EDIT: 'edit:playlist',
    DELETE: 'delete:playlist',
  },
  USER: {
    MANAGE: 'manage:users',
    VIEW: 'view:users',
  },
};

const ROLES = {
  USER: {
    name: 'user',
    permissions: [
      PERMISSIONS.MUSIC.READ,
      PERMISSIONS.PLAYLIST.CREATE,
      PERMISSIONS.PLAYLIST.EDIT,
      PERMISSIONS.PLAYLIST.DELETE,
    ],
  },
  ARTIST: {
    name: 'artist',
    permissions: [
      PERMISSIONS.MUSIC.READ,
      PERMISSIONS.PLAYLIST.CREATE,
      PERMISSIONS.PLAYLIST.EDIT,
      PERMISSIONS.MUSIC.UPLOAD,
      PERMISSIONS.MUSIC.EDIT,
      PERMISSIONS.MUSIC.DELETE,
      PERMISSIONS.ALBUM.CREATE,
      PERMISSIONS.ALBUM.EDIT,
      PERMISSIONS.ALBUM.DELETE,
    ],
  },
  ADMIN: {
    name: 'admin',
    permissions: [
      ...Object.values(PERMISSIONS.MUSIC),
      ...Object.values(PERMISSIONS.PLAYLIST),
      ...Object.values(PERMISSIONS.USER),
      ...Object.values(PERMISSIONS.ALBUM),
    ],
  },
};

module.exports = {
  PERMISSIONS,
  ROLES,
};
