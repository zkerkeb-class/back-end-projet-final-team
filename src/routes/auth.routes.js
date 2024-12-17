const router = require('express').Router();
const logger = require('../utils/loggerUtil');
const {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  updateProfilePicture,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const upload = require('../config/multer');
const { validateImageUpload } = require('../middlewares/cdn.middleware');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} = require('./validations/auth.validation');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */

// Middleware to parse form data
const parseFormData = (req, res, next) => {
  if (req.body.data) {
    try {
      req.body = { ...JSON.parse(req.body.data) };
    } catch (error) {
      logger.error(error);
      return res.status(400).json({ message: 'Invalid JSON in form data' });
    }
  }
  next();
};

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: string
 *                 description: JSON string containing user data
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post(
  '/register',
  upload.single('profile_picture'),
  parseFormData,
  validate(registerSchema),
  validateImageUpload,
  registerUser,
);

/**
 * @swagger
 * /auth/profile-picture:
 *   put:
 *     summary: Update user profile picture
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - profile_picture
 *             properties:
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.put(
  '/profile-picture',
  authenticate,
  upload.single('profile_picture'),
  validateImageUpload,
  updateProfilePicture,
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 */
router.post('/login', validate(loginSchema), loginUser);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout', authenticate, logoutUser);

module.exports = router;
