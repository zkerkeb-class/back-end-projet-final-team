const { playlistService } = require('../../../src/services');
const {
  createPlaylist,
  updatePlaylistData,
  updatePlaylistCover,
  deletePlaylist,
} = require('../../../src/controllers/playlist.controller');

jest.mock('../../../src/services');

describe('PlaylistController', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: { id: 1 },
      file: { buffer: Buffer.from('test') },
      params: { id: 1 },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('createPlaylist', () => {
    it('should successfully create a playlist', async () => {
      const mockPlaylist = {
        id: 1,
        creator_id: 1,
        name: 'My Playlist',
      };

      playlistService.createPlaylist.mockResolvedValue(mockPlaylist);

      await createPlaylist(mockReq, mockRes, mockNext);

      expect(playlistService.createPlaylist).toHaveBeenCalledWith(
        mockReq.user.id,
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockPlaylist);
    });

    it('should handle creation errors', async () => {
      const error = new Error('Creation failed');
      playlistService.createPlaylist.mockRejectedValue(error);

      await createPlaylist(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updatePlaylistData', () => {
    it('should successfully update playlist data', async () => {
      const updateData = { name: 'Updated Playlist' };
      const mockPlaylist = {
        id: 1,
        creator_id: 1,
        name: 'Old Name',
      };
      const updatedPlaylist = {
        ...mockPlaylist,
        ...updateData,
      };

      mockReq.body = updateData;
      playlistService.findById.mockResolvedValue(mockPlaylist);
      playlistService.updatePlaylistData.mockResolvedValue(updatedPlaylist);

      await updatePlaylistData(mockReq, mockRes, mockNext);

      expect(playlistService.updatePlaylistData).toHaveBeenCalledWith(
        mockReq.params.id,
        updateData,
      );
      expect(mockRes.json).toHaveBeenCalledWith(updatedPlaylist);
    });

    it('should handle unauthorized update', async () => {
      const mockPlaylist = {
        id: 1,
        creator_id: 2,
      };

      playlistService.findById.mockResolvedValue(mockPlaylist);

      await updatePlaylistData(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'You can only update your own playlists',
      });
    });
  });

  describe('updatePlaylistCover', () => {
    it('should successfully update playlist cover', async () => {
      const mockPlaylist = {
        id: 1,
        creator_id: 1,
      };
      const updatedPlaylist = {
        ...mockPlaylist,
        image_url: 'new-cover.jpg',
      };

      playlistService.findById.mockResolvedValue(mockPlaylist);
      playlistService.updatePlaylistCover.mockResolvedValue(updatedPlaylist);

      await updatePlaylistCover(mockReq, mockRes, mockNext);

      expect(playlistService.updatePlaylistCover).toHaveBeenCalledWith(
        mockReq.params.id,
        mockReq.file.buffer,
      );
      expect(mockRes.json).toHaveBeenCalledWith(updatedPlaylist);
    });

    it('should handle missing cover image', async () => {
      mockReq.file = undefined;

      await updatePlaylistCover(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'No cover image provided',
      });
    });

    it('should handle unauthorized update', async () => {
      const mockPlaylist = {
        id: 1,
        creator_id: 2,
      };

      playlistService.findById.mockResolvedValue(mockPlaylist);

      await updatePlaylistCover(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'You can only update your own playlists',
      });
    });
  });

  describe('deletePlaylist', () => {
    it('should successfully delete a playlist', async () => {
      const mockPlaylist = {
        id: 1,
        creator_id: 1,
        image_url: { baseKey: 'covers/1' },
      };

      playlistService.findById.mockResolvedValue(mockPlaylist);
      playlistService.deletePlaylist.mockResolvedValue();

      await deletePlaylist(mockReq, mockRes, mockNext);

      expect(playlistService.deletePlaylist).toHaveBeenCalledWith(
        mockReq.params.id,
        mockPlaylist.image_url.baseKey,
      );
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.end).toHaveBeenCalled();
    });

    it('should handle unauthorized deletion', async () => {
      const mockPlaylist = {
        id: 1,
        creator_id: 2,
      };

      playlistService.findById.mockResolvedValue(mockPlaylist);

      await deletePlaylist(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'You can only delete your own playlists',
      });
    });
  });
});
