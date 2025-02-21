const { logger } = require('../config/logger');
const phoneticSearch = require('../services/phoneticSearch.service');
const { cacheService } = require('../services/redisCache.service');
const filteredSearchService = require('../services/filteredSearch.service');

const resolvers = {
  SearchResult: {
    __resolveType(obj) {
      if (obj.trackNumber !== undefined) return 'Track';
      if (obj.totalTracks !== undefined && obj.releaseDate) return 'Album';
      if (obj.creator !== undefined) return 'Playlist';
      if (obj.name !== undefined && obj.genre !== undefined) return 'Artist';
      return null;
    },
  },
  Query: {
    async test() {
      return 'Hello World!';
    },
    async search(_parent, args, _context, _info) {
      try {
        const { query, entityType, limit = 10 } = args.input;
        const cacheKey = `search:${query}:${entityType}:${limit}:${JSON.stringify(
          args,
        )}`;
        const cachedResult = await cacheService.get(cacheKey);
        if (cachedResult) {
          return cachedResult;
        }

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

        if (entity === 'all') {
          const result = await phoneticSearch.search(query, limit, entity);
          await cacheService.set(cacheKey, result);
          return result;
        } else {
          const result = await phoneticSearch.searchEntity(
            query,
            limit,
            entity,
          );
          await cacheService.set(cacheKey, result);
          return result;
        }
      } catch (err) {
        logger.error('Search error: ', err);
        throw new Error('An error occurred while performing the search');
      }
    },

    async filterSearch(_, { input }) {
      try {
        const cacheKey = `filteredSearch:${JSON.stringify(input)}`;
        const cachedResult = await cacheService.get(cacheKey);
        if (cachedResult) {
          return cachedResult;
        }

        const filteredSearch = new filteredSearchService();
        const results = await filteredSearch.filterSearch(input);

        await cacheService.set(cacheKey, results);

        return results;
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
