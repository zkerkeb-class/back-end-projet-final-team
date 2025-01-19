const { logger } = require('../config/logger');
const phoneticSearch = require('../services/phoneticSearch.service');

const resolvers = {
  Query: {
    async test() {
      return 'Hello World!';
    },
    async search(_parent, args, _context, _info) {
      const { query, entityType, limit = 10 } = args.input;
      let entity;
      switch (entityType) {
        case 'PLAYLIST':
          entity = 'playlists';
          break;
        case 'TITLE':
          entity = 'tracks';
          break;
        case 'ALBUM':
          entity = 'albums';
          break;
        case 'ARTIST':
          entity = 'artists';
          break;
        default:
          entity = 'all';
          break;
      }
      const result = await phoneticSearch.search(query, limit, entity);
      return result;
    },

    async filterSearch(_parent, { input }, context, _info) {
      try {
        // eslint-disable-next-line no-unused-vars
        const { searchService, cache } = context;
        // eslint-disable-next-line no-unused-vars
        const { query, types, limit, offset } = input;
      } catch (err) {
        logger.error('Search error: ', err);
        throw new Error('An error occurred while performing the search');
      }
    },
  },
  Mutation: {
    async test() {
      return 'Hello World!';
    },
  },
};

module.exports = resolvers;
