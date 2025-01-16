const { logger, app } = require('./services/app.service');
const config = require('./config');
const { connect, sequelize } = require('./services/db.service');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/schemas');
const resolvers = require('./graphql/resolvers');
const redisCache = require('./services/redisCache.service');

const port = config.port || 8080;

const start = async () => {
  try {
    await connect();

    await sequelize.sync({ force: false }).then(() => {
      logger.info('✅ Database synced');
    });

    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: config.env === 'development' ? true : false, // Enable introspection for the playground
      playground: false, // Disable old playground
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app });

    await redisCache.isRedisReady().then((isReady) => {
      if (isReady) {
        logger.info('✅ Redis is ready');
      } else {
        logger.error('❌ Redis is not ready', isReady);
      }
    });

    app.listen(port, () => {
      logger.info(`✅ Server listening on port ${port}`);
      logger.info(
        `✅ GraphQL server ready ${config.env === 'development' ? `at ${process.env.GRAPHQL_STUDIO}` : ''}`,
      );
    });
  } catch (err) {
    logger.error(`Error starting server: ${err.message}`);
  }
};

start();
