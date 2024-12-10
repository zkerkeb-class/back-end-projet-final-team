const { Track, Artist } = require('../models');

const createTrack = async (req, res, _next) => {
  try {
    const trackData = req.body;

    const artist = await Artist.findOne({
      userId: req.user.id,
    });

    const track = await Track.create({
      ...trackData,
      artistId: artist.id || null,
      durationSecondes: 0,
      audioFiles: {
        url: 'https://www.example.com/audio.mp3',
        format: 'mp3',
      },
    });
    return res.status(201).send({
      message: 'Track created successfully',
      track,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const getTracks = async (req, res, _next) => {
  try {
    const tracks = await Track.findAll(
      { attributes: { exclude: ['deletedAt', 'updatedAt'] } },
      { limit: 20 },
    );
    return res.status(200).send(tracks);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const getTrackById = async (req, res, _next) => {
  try {
    const { id } = req.params;
    const track = await Track.findByPk(id);
    if (!track) {
      return res.status(404).send({ message: 'Track not found' });
    }
    return res.status(200).send(track);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const updateTrack = async (req, res, _next) => {
  try {
    const track = req.resource;
    if (!track) {
      return res.status(404).send({ message: 'Track not found' });
    }
    track.update(req.body);

    return res.status(200).send({
      message: 'Track updated successfully',
      track: track,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const deleteTrack = async (req, res, _next) => {
  try {
    const { id } = req.params;
    const track = await Track.findByPk(id);

    if (!track) {
      return res.status(404).send({ message: 'Track not found' });
    }

    await track.destroy();

    return res.status(204).send({ message: 'Track deleted successfully' });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

module.exports = {
  createTrack,
  getTracks,
  getTrackById,
  updateTrack,
  deleteTrack,
};
