const { User } = require('../models');
const bcrypt = require('bcrypt');
const { USER_TYPE } = require('../models/enums');
const logger = require('../utils/loggerUtil');
const trackService = require('../services/track.service');
const path = require('path');
const audioService = require('../services/audio.service');
const cdnService = require('../services/cdn.service');

const createArtist = async (req, res, next) => {
  try {
    const artistData = req.body.artist;
    const artist = await User.create({
      username: artistData.username,
      email: artistData.email,
      password_hash: await bcrypt.hash(artistData.password, 10),
      user_type: USER_TYPE.ARTIST,
      first_name: artistData.first_name,
      last_name: artistData.last_name,
      is_verified: true,
      is_active: true,
    });
    res.status(201).json(artist);
  } catch (error) {
    logger.error('Error when admin create a new Artist : ', error);
    next(error);
  }
};
// const editArtist = async (req, res, next) => { };

// const createAlbum = async (req, res, next) => { };
// const editAlbum = async (req, res, next) => { };

const createTrackToArtist = async (req, res, next) => {
  try {
    if (!req.files?.audio) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    const audioFile = req.files.audio[0];
    const coverFile = req.files.image_url?.[0];

    const audioFormat = path
      .extname(audioFile.originalname)
      .slice(1)
      .toLowerCase();
    if (!['mp3', 'wav', 'm4a'].includes(audioFormat)) {
      return res.status(400).json({
        message: 'Invalid audio format. Supported formats: mp3, wav, m4a',
      });
    }

    const audioResult = await audioService.processAudio(
      audioFile.buffer,
      audioFormat,
    );

    const duration = audioResult.duration;
    delete audioResult.duration;

    let coverResult = null;
    if (coverFile) {
      coverResult = await cdnService.processTrackCover(coverFile.buffer);
    }

    const trackData = {
      ...req.body,
      image_url: coverResult,
      audio_file_path: audioResult,
      duration_seconds: duration,
    };

    const track = await trackService.create(trackData);

    res.status(201).json(track);
  } catch (error) {
    if (error.audioBaseKey) {
      await audioService.deleteAudio(error.audioBaseKey).catch(logger.error);
    }
    if (error.coverBaseKey) {
      await cdnService
        .deleteProfilePictures(error.coverBaseKey)
        .catch(logger.error);
    }
    next(error);
  }
};
// const editTrack = async (req, res, next) => {};

module.exports = {
  createArtist,
  // editArtist,
  // createAlbum,
  // editAlbum,
  createTrackToArtist,
  // editTrack,
};
