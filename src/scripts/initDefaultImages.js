const cdnService = require('../services/cdn.service');

const defaultImages = {
  profile: require('fs').readFileSync('src/img/default-profile.png'),
  playslit: require('fs').readFileSync('src/img/default-playlist.jpg'),
  album: require('fs').readFileSync('src/img/default-album.jpg'),
};

const defaultUrls = {
  profile: {},
  playslit: {},
  album: {},
};

const initDefaultImages = async () => {
  defaultUrls.profile = await cdnService.processProfilePicture(
    defaultImages.profile,
  );
  defaultUrls.playslit = await cdnService.processPlaylistPicture(
    defaultImages.playslit,
  );
  defaultUrls.album = await cdnService.processAlbumCover(defaultImages.album);

  return defaultUrls;
};

module.exports = initDefaultImages;
