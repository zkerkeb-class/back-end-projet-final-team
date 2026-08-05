const { Pool } = require('pg');
const config = require('../config');
const logger = require('../utils/loggerUtil');

async function initFuzzyMatch() {
  const pool = new Pool({
    user: config.db.user,
    host: config.db.host,
    database: config.db.name,
    password: config.db.password,
    port: config.db.port,
  });

  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;');
    logger.debug('Extension fuzzystrmatch was installed successfully');
  } catch (error) {
    logger.error('Error when installing fuzzystrmatch extension:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

module.exports = initFuzzyMatch;
