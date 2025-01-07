const { trackService } = require('../services');
const cdnService = require('../services/cdn.service');
const audioService = require('../services/audio.service');
const path = require('path');
const logger = require('../utils/loggerUtil');

const createTrack = async (req, res, next) => {
  try {
    // Validate required files
    if (!req.files?.audio) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    const audioFile = req.files.audio[0];
    const coverFile = req.files.cover?.[0];

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

    let coverResult = null;
    if (coverFile) {
      coverResult = await cdnService.processTrackCover(coverFile.buffer);
    }

    const trackData = {
      ...req.body,
      artist_id: req.user.artist_id,
      cover: coverResult,
      audio_file_path: audioResult,
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
    if (track.audio_base_key) {
      await audioService.deleteAudio(track.audio_base_key);
    }
    if (track.cover_image?.baseKey) {
      await cdnService.deleteProfilePictures(track.cover_image.baseKey);
    }

    await trackService.delete(track.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTrack,
  deleteTrack,
};
