const cdnService = require('../services/cdn.service');
const fs = require('fs');

const defaultImages = {
  profile: fs.readFileSync('src/default/img/default-profile.png'),
  playslit: fs.readFileSync('src/default/img/default-playlist.jpg'),
  album: fs.readFileSync('src/default/img/default-album.jpg'),
  track: fs.readFileSync('src/default/img/default-track.jpg'),
};

const defaultUrls = {
  profile: {},
  playslit: {},
  album: {},
  track: {},
};

const initDefaultImages = async () => {
  defaultUrls.profile = await cdnService.processProfilePicture(
    defaultImages.profile,
  );
  defaultUrls.playslit = await cdnService.processPlaylistPicture(
    defaultImages.playslit,
  );
  defaultUrls.album = await cdnService.processAlbumCover(defaultImages.album);
  defaultUrls.track = await cdnService.processTrackCover(defaultImages.track);

  return defaultUrls;
};

module.exports = initDefaultImages;
