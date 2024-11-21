const { Sequelize } = require('sequelize');
const LoggerUtil = require('../utils/loggerUtil');

let sequelize;

const connect = async (
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  forceSync = true,
) => {
  try {
    sequelize = new Sequelize(
      `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
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
    await sequelize.authenticate();
    LoggerUtil.info('Connection has been established successfully.');

    await sequelize.sync({ force: forceSync }); // attention avec le 'force' cela supprime les tables :O
    LoggerUtil.info('All models were synchronized successfully.');
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

module.exports = { connect, disconnect };
