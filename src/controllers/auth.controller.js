const userService = require('../services/user.service');
const cdnService = require('../services/cdn.service');

const registerUser = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.profile_picture = await cdnService.processProfilePicture(
        req.file.buffer,
      );
    }
    const user = await userService.register(req.body);
    res.status(201).json({
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: user.roles,
        user_type: user.user_type,
        profile_picture_url: user.profile_picture_url,
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await userService.login(email, password);
    res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        first_name: result.user.first_name,
        last_name: result.user.last_name,
        roles: result.user.roles,
        profile_picture_url: result.user.profile_picture_url,
        user_type: result.user.user_type,
      },
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await userService.refreshToken(refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    await userService.logout(req.user.id);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
};
