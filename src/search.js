const { sequelize } = require('./services/db.service');
const natural = require('natural');
const logger = require('./utils/loggerUtil');

const metaphone = new natural.Metaphone();

const searchPhonetic = async (query) => {
  const phoneticQuery = metaphone.process(query);

  const results = await sequelize.query(
    `SELECT id, title, phonetic_title,
            LEAST(
                levenshtein(phonetic_title, :phoneticQuery),
                levenshtein(title, :query),
                levenshtein(SUBSTRING(title, 1, LENGTH(:query)), :query)
            ) AS relevance_score
     FROM tracks
     WHERE levenshtein(phonetic_title, :phoneticQuery) <= 3
        OR levenshtein(title, :query) <= 2
        OR phonetic_title LIKE :likeQuery
        OR title LIKE :likeQuery
        OR levenshtein(SUBSTRING(title, 1, LENGTH(:query)), :query) <= 2
     ORDER BY relevance_score ASC
     LIMIT 5`,
    {
      replacements: {
        query,
        phoneticQuery,
        likeQuery: `${query}%`, // Vérifie si le début correspond
      },
      type: sequelize.QueryTypes.SELECT,
    },
  );

  return results;
};

const testSearch = async () => {
  const query = 'Make with u';
  const results = await searchPhonetic(query);
  logger.info(results);
};

testSearch().catch(logger.error);
