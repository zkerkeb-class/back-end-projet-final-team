const fs = require('fs');
const s3Service = require('../services/s3.service');

const initDefaultTrack = async () => {
  const defaultTrack = {
    mp3: fs.readFileSync('src/default/audio/track.mp3'),
    wav: fs.readFileSync('src/default/audio/track.wav'),
    m4a: fs.readFileSync('src/default/audio/track.m4a'),
  };

  const filePaths = {
    baseKey: 'tracks/default',
    urls: {},
  };

  for (const format in defaultTrack) {
    if (!defaultTrack[format]) {
      throw new Error(`Failed to read default track in ${format} format`);
    }
    const key = `${filePaths.baseKey}/track.${format}`;
    filePaths.urls[format] = await s3Service.uploadBuffer(
      defaultTrack[format],
      key,
      'audio/mpeg',
    );
  }

  return filePaths;
};

module.exports = initDefaultTrack;
