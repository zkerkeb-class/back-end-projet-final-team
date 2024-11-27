const Express = require('express');
const UserController = require('../controllers/user.controller');
const validateIdParam = require('../middlewares/validateIdParam');

const router = Express.Router();

router.get('/', UserController.getUsers);
router.get('/:id', validateIdParam, UserController.getUserById);
router.put('/:id', validateIdParam, UserController.updateUser);
router.delete('/:id', validateIdParam, UserController.deleteUser);

module.exports = router;
