const Express = require('express');
const swaggerDocument = require('../docs/swagger.json');
const swaggerUIPath = require('swagger-ui-express');
const ArtistRouter = require('./artist.route');
const UserRouter = require('./user.route');
const AuthRouter = require('./auth.route');

const router = Express.Router();
router.use('/artist', ArtistRouter);
router.use('/user', UserRouter);
router.use('/auth', AuthRouter);
router.use(
  '/api-docs',
  swaggerUIPath.serve,
  swaggerUIPath.setup(swaggerDocument),
);

module.exports = router;
