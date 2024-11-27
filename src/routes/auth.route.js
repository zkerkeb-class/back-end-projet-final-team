const Express = require('express');
const AuthController = require('../controllers/auth.controller');
const {
  validateUser,
  validateLogin,
  userAlreadyExists,
} = require('../middlewares/user.schema');

const router = Express.Router();

router.post(
  '/register',
  validateUser,
  userAlreadyExists,
  AuthController.registerUser,
);
router.post('/login', validateLogin, AuthController.loginUser);

module.exports = router;
