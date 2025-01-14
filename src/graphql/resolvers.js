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
  },
  Mutation: {
    async test() {
      return 'Hello World!';
    },
  },
};

module.exports = resolvers;
