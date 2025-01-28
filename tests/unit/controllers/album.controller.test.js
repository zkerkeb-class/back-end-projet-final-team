const { albumService } = require('../../../src/services');
const cacheService = require('../../../src/services/redisCache.service');
const { Album } = require('../../../src/models');
const {
  createAlbum,
  getAlbums,
  getAlbumById,
  updateAlbum,
  updateAlbumCoverArt,
  deleteAlbum,
} = require('../../../src/controllers/album.controller');

jest.mock('../../../src/services');
jest.mock('../../../src/services/redisCache.service');
jest.mock('../../../src/models', () => {
  return {
    Album: {
      findAndCountAll: jest.fn(),
      findByPk: jest.fn(),
    },
  };
});

describe('AlbumController', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: { id: 1, artist_id: 1, user_type: 'artist' },
      file: { buffer: Buffer.from('test') },
      params: { id: 1 },
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      end: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
    Album.findAndCountAll.mockReset();
    Album.findByPk.mockReset();
  });

  describe('createAlbum', () => {
    it('should successfully create an album', async () => {
      const albumData = {
        title: 'Test Album',
        primary_artist_id: 1,
      };
      const mockAlbum = {
        id: 1,
        ...albumData,
      };

      mockReq.body = albumData;
      albumService.createAlbum.mockResolvedValue(mockAlbum);

      await createAlbum(mockReq, mockRes, mockNext);

      expect(albumService.createAlbum).toHaveBeenCalledWith(albumData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockAlbum);
    });

    it('should handle unauthorized creation', async () => {
      mockReq.body = {
        primary_artist_id: 2,
      };

      await createAlbum(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'You can only create albums for yourself',
      });
    });
  });

  describe('getAlbums', () => {
    it('should return albums with pagination', async () => {
      const mockAlbums = {
        count: 2,
        rows: [
          { id: 1, title: 'Album 1' },
          { id: 2, title: 'Album 2' },
        ],
      };
      const expectedResponse = {
        data: mockAlbums.rows,
        metadata: {
          currentPage: 1,
          itemsPerPage: 20,
          totalItems: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockReq.query = { limit: 20, page: 1 };
      cacheService.get.mockResolvedValue(null);
      Album.findAndCountAll.mockResolvedValue(mockAlbums);

      await getAlbums(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith(expectedResponse);
    });

    it('should return cached albums if available', async () => {
      const cachedData = {
        data: [{ id: 1, title: 'Cached Album' }],
        metadata: {
          /* ... */
        },
      };

      cacheService.get.mockResolvedValue(cachedData);

      await getAlbums(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith(cachedData);
    });
  });

  describe('getAlbumById', () => {
    it('should return an album by id', async () => {
      const mockAlbum = { id: 1, title: 'Test Album' };
      Album.findByPk.mockResolvedValue(mockAlbum);

      await getAlbumById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith(mockAlbum);
    });

    it('should handle not found album', async () => {
      Album.findByPk.mockResolvedValue(null);

      await getAlbumById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith({
        message: 'Album not found',
      });
    });
  });

  describe('updateAlbum', () => {
    it('should successfully update an album', async () => {
      const updateData = { title: 'Updated Album' };
      const mockAlbum = {
        id: 1,
        primary_artist_id: 1,
      };
      const updatedAlbum = {
        ...mockAlbum,
        ...updateData,
      };

      mockReq.body = updateData;
      albumService.findById.mockResolvedValue(mockAlbum);
      albumService.update.mockResolvedValue(updatedAlbum);

      await updateAlbum(mockReq, mockRes, mockNext);

      expect(albumService.update).toHaveBeenCalledWith(
        mockReq.params.id,
        updateData,
      );
      expect(mockRes.json).toHaveBeenCalledWith(updatedAlbum);
    });

    it('should handle unauthorized update', async () => {
      const mockAlbum = {
        id: 1,
        primary_artist_id: 2,
      };

      albumService.findById.mockResolvedValue(mockAlbum);

      await updateAlbum(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'You can only update your own albums',
      });
    });
  });

  describe('updateAlbumCoverArt', () => {
    it('should successfully update album cover', async () => {
      const mockAlbum = {
        id: 1,
        primary_artist_id: 1,
      };
      const updatedAlbum = {
        ...mockAlbum,
        image_url: 'new-cover.jpg',
      };

      albumService.findById.mockResolvedValue(mockAlbum);
      albumService.updateAlbumCover.mockResolvedValue(updatedAlbum);

      await updateAlbumCoverArt(mockReq, mockRes, mockNext);

      expect(albumService.updateAlbumCover).toHaveBeenCalledWith(
        mockAlbum,
        mockReq.file.buffer,
      );
      expect(mockRes.json).toHaveBeenCalledWith(updatedAlbum);
    });

    it('should handle unauthorized update', async () => {
      const mockAlbum = {
        id: 1,
        primary_artist_id: 2,
      };

      albumService.findById.mockResolvedValue(mockAlbum);

      await updateAlbumCoverArt(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'You can only update your own albums',
      });
    });
  });

  describe('deleteAlbum', () => {
    it('should successfully delete an album', async () => {
      const mockAlbum = {
        id: 1,
        primary_artist_id: 1,
        image_url: { baseKey: 'covers/1' },
      };

      albumService.findById.mockResolvedValue(mockAlbum);
      albumService.deleteAlbum.mockResolvedValue();

      await deleteAlbum(mockReq, mockRes, mockNext);

      expect(albumService.deleteAlbum).toHaveBeenCalledWith(
        mockReq.params.id,
        mockAlbum.image_url.baseKey,
      );
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.end).toHaveBeenCalled();
    });

    it('should handle unauthorized deletion', async () => {
      const mockAlbum = {
        id: 1,
        primary_artist_id: 2,
      };

      albumService.findById.mockResolvedValue(mockAlbum);

      await deleteAlbum(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'You can only delete your own albums',
      });
    });
  });
});
