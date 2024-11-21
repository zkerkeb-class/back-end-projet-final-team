const { logger, app } = require('./services/app.service');
const config = require('./config');
const { connect } = require('./services/db.service');

const port = config.port || 8080;

const start = async () => {
  try {
    await connect(
      config.db.port,
      config.db.name,
      config.db.user,
      config.db.password,
      config.db.host,
    );

    app.listen(port, () => {
      logger.info(`Server listening on port ${port}`);
    });
  } catch (err) {
    logger.error(`Error starting server: ${err.message}`);
  }
};

start();
