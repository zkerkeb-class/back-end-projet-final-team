const Express = require('express');
const UserController = require('../controllers/user.controller');
const validateIdParam = require('../middlewares/validateIdParam');
const isAuth = require('../middlewares/isAuth');

const router = Express.Router();

router.get('/', isAuth, UserController.getUsers);
router.get('/:id', isAuth, validateIdParam, UserController.getUserById);
router.put('/:id', isAuth, validateIdParam, UserController.updateUser);
router.delete('/:id', isAuth, validateIdParam, UserController.deleteUser);

module.exports = router;
