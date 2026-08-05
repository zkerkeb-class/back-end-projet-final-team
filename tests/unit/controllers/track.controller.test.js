const { trackService } = require('../../../src/services');
const cdnService = require('../../../src/services/cdn.service');
const audioService = require('../../../src/services/audio.service');
const { cacheService } = require('../../../src/services/redisCache.service');
const {
  createTrack,
  deleteTrack,
  getTopTracks,
  updateTrack,
} = require('../../../src/controllers/track.controller');

// Mock des services
jest.mock('../../../src/services');
jest.mock('../../../src/services/cdn.service');
jest.mock('../../../src/services/audio.service');
jest.mock('../../../src/services/redisCache.service', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

describe('TrackController', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: { id: 1, artist_id: 1 },
      files: {
        audio: [{ buffer: Buffer.from('test'), originalname: 'test.mp3' }],
        image_url: [{ buffer: Buffer.from('test') }],
      },
      params: { id: 1 },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };
    mockNext = jest.fn();
    cacheService.get.mockReset();
    cacheService.set.mockReset();
    jest.clearAllMocks();
  });

  describe('createTrack', () => {
    it('should successfully create a track', async () => {
      const trackData = {
        title: 'Test Track',
        genre: ['Pop'],
      };
      const mockTrack = {
        id: 1,
        ...trackData,
        artist_id: 1,
        image_url: { url: 'test.jpg' },
        audio_file_path: { url: 'test.mp3' },
        duration_seconds: 180,
      };

      mockReq.body = trackData;
      audioService.processAudio.mockResolvedValue({
        url: 'test.mp3',
        duration: 180,
      });
      cdnService.processTrackCover.mockResolvedValue({ url: 'test.jpg' });
      trackService.create.mockResolvedValue(mockTrack);

      await createTrack(mockReq, mockRes, mockNext);

      expect(audioService.processAudio).toHaveBeenCalled();
      expect(cdnService.processTrackCover).toHaveBeenCalled();
      expect(trackService.create).toHaveBeenCalledWith({
        ...trackData,
        artist_id: mockReq.user.artist_id,
        image_url: { url: 'test.jpg' },
        audio_file_path: { url: 'test.mp3' },
        duration_seconds: 180,
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockTrack);
    });

    it('should handle missing audio file', async () => {
      mockReq.files = {};

      await createTrack(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Audio file is required',
      });
    });

    it('should handle invalid audio format', async () => {
      mockReq.files.audio[0].originalname = 'test.txt';

      await createTrack(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid audio format. Supported formats: mp3, wav, m4a',
      });
    });
  });

  describe('deleteTrack', () => {
    it('should successfully delete a track', async () => {
      const mockTrack = {
        id: 1,
        artist_id: 1,
        audio_file_path: { baseKey: 'audio/1' },
        image_url: { baseKey: 'image/1' },
      };

      trackService.findById.mockResolvedValue(mockTrack);
      trackService.delete.mockResolvedValue();

      await deleteTrack(mockReq, mockRes, mockNext);

      expect(audioService.deleteAudio).toHaveBeenCalledWith(
        mockTrack.audio_file_path.baseKey,
      );
      expect(cdnService.deleteProfilePictures).toHaveBeenCalledWith(
        mockTrack.image_url.baseKey,
      );
      expect(trackService.delete).toHaveBeenCalledWith(mockTrack.id);
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.end).toHaveBeenCalled();
    });

    it('should handle unauthorized deletion', async () => {
      const mockTrack = {
        id: 1,
        artist_id: 2,
      };

      trackService.findById.mockResolvedValue(mockTrack);
      mockReq.user.artist_id = 3;

      await deleteTrack(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'You can only delete your own tracks',
      });
    });
  });

  describe('updateTrack', () => {
    it('should successfully update a track', async () => {
      const updateData = {
        title: 'Updated Track',
      };
      const mockTrack = {
        id: 1,
        artist_id: 1,
      };
      const updatedTrack = {
        ...mockTrack,
        ...updateData,
      };

      mockReq.body = updateData;
      trackService.findById.mockResolvedValue(mockTrack);
      trackService.update.mockResolvedValue(updatedTrack);

      await updateTrack(mockReq, mockRes, mockNext);

      expect(trackService.update).toHaveBeenCalledWith(
        mockReq.params.id,
        updateData,
      );
      expect(mockRes.json).toHaveBeenCalledWith(updatedTrack);
    });

    it('should handle unauthorized update', async () => {
      const mockTrack = {
        id: 1,
        artist_id: 2,
      };

      trackService.findById.mockResolvedValue(mockTrack);
      mockReq.user.artist_id = 3;

      await updateTrack(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'You can only update your own tracks',
      });
    });
  });

  describe('getTopTracks', () => {
    it('should return top tracks', async () => {
      const mockTracks = [
        { id: 1, title: 'Track 1' },
        { id: 2, title: 'Track 2' },
      ];
      const limit = 10;
      mockReq.query = { limit };
      cacheService.get.mockResolvedValue(null);
      cacheService.set.mockResolvedValue();
      trackService.getTopTracks.mockResolvedValue(mockTracks);

      await getTopTracks(mockReq, mockRes, mockNext);

      expect(trackService.getTopTracks).toHaveBeenCalledWith(limit);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTracks);
    });
  });

  it('should handle errors', async () => {
    const error = new Error('Database error');
    mockReq.query = { limit: 10 };
    cacheService.get.mockResolvedValue(null);
    trackService.getTopTracks.mockRejectedValue(error);

    await getTopTracks(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
