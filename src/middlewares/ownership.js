const { Album, Track, Artist } = require('../models');
const logger = require('../utils/loggerUtil');

const checkResourceOwnership = (Model) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id || req.body.id;

      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const resource = await Model.findByPk(resourceId, {
        include: [
          {
            model: Artist,
            as: 'artist',
            attributes: ['id'],
          },
        ],
      });

      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      let isOwner = false;

      switch (Model.name) {
        case 'Album': {
          isOwner =
            req.user.id === 'artist' && resource.artist_id === req.user.id;
          break;
        }
        case 'Track': {
          isOwner =
            req.user.id === 'artist' && resource.artist_id === req.user.id;
          break;
        }
        case 'Playlist': {
          isOwner = resource.user_id === req.user.id;
          break;
        }
        default: {
          return res.status(500).json({
            message: 'Ownership check not implemented for this model',
          });
        }
      }

      if (!isOwner) {
        return res.status(403).json({
          message: 'You do not have permission to modify this resource',
        });
      }

      req.resource = resource;

      next();
    } catch (error) {
      logger.error('Ownership check error: ', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

const canModifyAlbum = checkResourceOwnership(Album);
const canModifyTrack = checkResourceOwnership(Track);
const canModifyArtist = checkResourceOwnership(Artist);

module.exports = {
  checkResourceOwnership,
  canModifyAlbum,
  canModifyTrack,
  canModifyArtist,
};
