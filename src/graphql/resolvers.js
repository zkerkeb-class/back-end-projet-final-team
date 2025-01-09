const phoneticSearch = require('../services/phoneticSearch');

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
      }
      const result = await phoneticSearch.searchTracks(query, limit, entity);
      return result.map((track) => track.title);
    },
  },
  Mutation: {
    async test() {
      return 'Hello World!';
    },
  },
};

module.exports = resolvers;
