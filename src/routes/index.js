const Express = require('express');
const ArtistRouter = require('./artist.route');

const router = Express.Router();

router.use('/artist', ArtistRouter);

module.exports = router;
