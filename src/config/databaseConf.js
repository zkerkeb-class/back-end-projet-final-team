const config = require('./index');
const logger = require('../utils/loggerUtil');

const defaultConfig = {
  dialect: 'postgres',
  seederStorage: 'sequelize',
  seederStorageTableName: 'SequelizeData',
  migrationStorage: 'sequelize',
  migrationStorageTableName: 'SequelizeMeta',
  define: {
    underscored: true,
    timestamps: true,
    paranoid: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

module.exports = {
  development: {
    ...defaultConfig,
    url: config.db.host,
    logging: (msg) => {
      if (msg.includes('SELECT')) {
        logger.debug(msg);
      } else {
        logger.info(msg);
      }
    },
  },
  test: {
    ...defaultConfig,
    url: config.db.host,
    logging: false,
  },
  production: {
    ...defaultConfig,
    url: config.db.host,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
