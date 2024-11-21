const { logger, app } = require('./services/app.service');
const config = require('./config');

const port = config.port || 8080;

const start = async () => {
  try {
    app.listen(port, () => {
      logger.info(`Server listening on port ${port}`);
    });
  } catch (err) {
    logger.error(`Error starting server: ${err.message}`);
  }
};

start();
