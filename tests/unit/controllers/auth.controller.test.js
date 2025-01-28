const { userService } = require('../../../src/services');
const {
  registerUser,
  loginUser,
  logoutUser,
  updateProfilePicture,
  getMe,
} = require('../../../src/controllers/auth.controller');

// Mock des services
jest.mock('../../../src/services');

describe('AuthController', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: { id: 1 },
      file: { buffer: Buffer.from('test') },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should successfully register a user', async () => {
      const userData = {
        email: 'test@test.com',
        password: 'password123',
        username: 'test',
        user_type: 'standard',
        first_name: 'test',
        last_name: 'test',
        genre: ['Pop', 'Rock'],
      };
      const mockUser = {
        id: 1,
        ...userData,
        image_url: null,
        isVerified: false,
        isActive: true,
        lastLogin: null,
        refresh_token: null,
        refresh_token_expires_at: null,
        deletedAt: null,
      };

      mockReq.body = userData;
      userService.register.mockResolvedValue(mockUser);

      await registerUser(mockReq, mockRes, mockNext);

      expect(userService.register).toHaveBeenCalledWith(userData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle registration errors', async () => {
      const error = new Error('Registration failed');
      userService.register.mockRejectedValue(error);

      await registerUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('loginUser', () => {
    it('should successfully login a user', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockLoginResponse = {
        user: { id: 1, email: credentials.email },
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      };

      mockReq.body = credentials;
      userService.login.mockResolvedValue(mockLoginResponse);

      await loginUser(mockReq, mockRes, mockNext);

      expect(userService.login).toHaveBeenCalledWith(
        credentials.email,
        credentials.password,
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockLoginResponse);
    });

    it('should handle login errors', async () => {
      const error = new Error('Login failed');
      userService.login.mockRejectedValue(error);

      await loginUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateProfilePicture', () => {
    it('should successfully update profile picture', async () => {
      const mockUpdatedUser = {
        id: 1,
        image_url: 'http://example.com/image.jpg',
      };

      userService.updateProfilePicture.mockResolvedValue(mockUpdatedUser);

      await updateProfilePicture(mockReq, mockRes, mockNext);

      expect(userService.updateProfilePicture).toHaveBeenCalledWith(
        mockReq.user.id,
        mockReq.file.buffer,
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedUser);
    });

    it('should handle missing file error', async () => {
      mockReq.file = undefined;

      await updateProfilePicture(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'No image file provided',
      });
    });
  });

  describe('getMe', () => {
    it('should return current user information', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      mockReq.user = mockUser;

      await getMe(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle errors', async () => {
      const error = new Error('User not found');
      mockReq.user = null;

      await getMe(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('logoutUser', () => {
    it('should successfully logout user', async () => {
      const mockLogoutResponse = { message: 'Logged out successfully' };
      userService.logout.mockResolvedValue(mockLogoutResponse);

      await logoutUser(mockReq, mockRes, mockNext);

      expect(userService.logout).toHaveBeenCalledWith(mockReq.user.id);
      expect(mockRes.json).toHaveBeenCalledWith(mockLogoutResponse);
    });

    it('should handle logout errors', async () => {
      const error = new Error('Logout failed');
      userService.logout.mockRejectedValue(error);

      await logoutUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
