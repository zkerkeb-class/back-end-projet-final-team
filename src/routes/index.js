const Express = require('express');
const ArtistRouter = require('./artist.route');
const UserRouter = require('./user.route');
const AuthRouter = require('./auth.route');

const router = Express.Router();

router.use('/artist', ArtistRouter);
router.use('/user', UserRouter);
router.use('/auth', AuthRouter);

module.exports = router;
