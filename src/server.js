const { logger, app } = require('./services/app.service');
const config = require('./config');
const { connect, sequelize } = require('./services/db.service');

const port = config.port || 8080;

const start = async () => {
  try {
    await connect();

    sequelize.sync({ force: false }).then(() => {
      logger.info('✅ Database synced');
    });

    app.listen(port, () => {
      logger.info(`Server listening on port ${port}`);
    });
  } catch (err) {
    logger.error(`Error starting server: ${err.message}`);
  }
};

start();
