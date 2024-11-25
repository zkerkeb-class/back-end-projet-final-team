const { Sequelize, DataTypes, Model } = require('sequelize');
const LoggerUtil = require('../utils/loggerUtil');
const config = require('../config');

const sequelize = new Sequelize(
  `postgres://${config.db.user}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.name}`,
  {
    dialect: 'postgres',
    logging: (msg) => {
      if (msg.includes('SELECT')) {
        LoggerUtil.debug(msg);
      } else {
        LoggerUtil.info(msg);
      }
    },
    define: {
      underscored: true,
      timestamps: true,
      paranoid: true,
    },
  },
);

const connect = async () => {
  try {
    await sequelize.authenticate();
    LoggerUtil.info('Connection has been established successfully.');
  } catch (error) {
    LoggerUtil.error('Unable to connect to the database:', error);
  }
};

const disconnect = async () => {
  try {
    await sequelize.close();
    LoggerUtil.info('Connection has been closed successfully.');
  } catch (error) {
    LoggerUtil.error('Unable to close the database connection:', error);
  }
};

module.exports = { connect, disconnect, sequelize, DataTypes, Model };
