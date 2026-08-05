const { Sequelize, DataTypes, Model } = require('sequelize');
const logger = require('../utils/loggerUtil');
const config = require('../config');
const dbConfig = require('../config/databaseConf');

const sequelize = new Sequelize(
  `postgres://${config.db.user}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.name}`,
  dbConfig[config.env],
);

const connect = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
};

const disconnect = async () => {
  try {
    await sequelize.close();
    logger.info('Connection has been closed successfully.');
  } catch (error) {
    logger.error('Unable to close the database connection:', error);
  }
};

module.exports = { connect, disconnect, sequelize, DataTypes, Model };
