const { logger, app } = require('./services/app.service');
const config = require('./config');
const { connect, sequelize } = require('./services/db.service');
const roleService = require('./services/role.service');
const userService = require('./services/user.service');

const port = config.port || 8080;

const initializeRoles = async () => {
  try {
    await roleService.createDefaultRoles();
    await userService.initAdmin();
  } catch (error) {
    logger.error('Error initializing roles: ', error);
  }
};

const start = async () => {
  try {
    await connect();

    sequelize.sync({ force: false }).then(() => {
      initializeRoles();
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
