const router = require('express').Router();
const {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  updateProfilePicture,
  getMe,
} = require('../controllers/auth.controller');
const {
  authenticate,
  isAuthenticated,
} = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const { uploadImage } = require('../config/multer');
const { validateImageUpload } = require('../middlewares/cdn.middleware');
const userExist = require('../middlewares/userExist.middleware');
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

//#region
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
 *               image_url:
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
//#endregion
router.post('/register', validate(registerSchema), userExist, registerUser);

//#region
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
 *               - image_url
 *             properties:
 *               image_url:
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
//#endregion
router.put(
  '/profile-picture',
  authenticate,
  uploadImage.single('image_url'),
  validateImageUpload,
  updateProfilePicture,
);

//#region
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
//#endregion
router.post('/login', validate(loginSchema), loginUser);

//#region
/**
 * @swagger
 * /auth/getMe:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
//#endregion
router.get('/getMe', isAuthenticated, getMe);

//#region
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
//#endregion
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);

//#region
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
//#endregion
router.post('/logout', authenticate, logoutUser);

module.exports = router;
