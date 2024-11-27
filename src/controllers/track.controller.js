const { Track } = require('../models');

const createTrack = async (req, res, _next) => {
  try {
    const { track: trackData } = req.body;
    const track = await Track.create(trackData);
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
    const { id } = req.params;
    const [updatedRowsCount] = await Track.update(req.body, {
      where: { id: id },
    });
    if (updatedRowsCount === 0) {
      return res.status(404).send({ message: 'Track not found' });
    }

    const updatedTrack = await Track.findByPk(id, {
      attributes: { exclude: ['deletedAt', 'updatedAt'] },
    });

    return res.status(200).send({
      message: 'Track updated successfully',
      track: updatedTrack,
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

    return res.status(204).send();
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
