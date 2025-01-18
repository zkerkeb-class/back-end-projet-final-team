const { trackService } = require('../services');
const cdnService = require('../services/cdn.service');
const audioService = require('../services/audio.service');
const path = require('path');
const logger = require('../utils/loggerUtil');
const redisCache = require('../services/redisCache.service');

const createTrack = async (req, res, next) => {
  try {
    // Validate required files
    if (!req.files?.audio) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    const audioFile = req.files.audio[0];
    const coverFile = req.files.image_url?.[0];

    // Process audio file
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
      artist_id: req.user.artist_id,
      image_url: coverResult,
      audio_file_path: audioResult,
      duration_seconds: duration,
    };

    const track = await trackService.create(trackData);

    res.status(201).json(track);
  } catch (error) {
    // Clean up files if track creation fails
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

const deleteTrack = async (req, res, next) => {
  try {
    const track = await trackService.findById(req.params.id);

    if (
      track.artist_id !== req.user.artist_id &&
      req.user.user_type !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own tracks' });
    }

    // Delete audio files and cover image
    if (
      track.audio_file_path.baseKey &&
      !track.audio_file_path.baseKey.includes('default')
    ) {
      await audioService.deleteAudio(track.audio_file_path.baseKey);
    }
    if (
      track.image_url.baseKey &&
      !track.image_url.baseKey.includes('default')
    ) {
      await cdnService.deleteProfilePictures(track.image_url.baseKey);
    }

    await trackService.delete(track.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

const getTopTracks = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const cacheKey = `topTracks:${limit}`;
    const cachedTracks = await redisCache.get(cacheKey);

    if (cachedTracks) {
      return res.json(cachedTracks);
    }

    const response = await trackService.getTopTracks(limit);
    await redisCache.set(cacheKey, response);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const updateTrack = async (req, res, next) => {
  try {
    const track = await trackService.findById(req.params.id);

    if (!req.user.artist_id) {
      return res
        .status(403)
        .message('You do not have permission to update this track');
    }

    if (
      track.artist_id !== req.user.artist_id &&
      req.user.user_type !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'You can only update your own tracks' });
    }

    const updatedTrack = await trackService.update(req.params.id, req.body);
    res.json(updatedTrack);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTrack,
  deleteTrack,
  getTopTracks,
  updateTrack,
};
