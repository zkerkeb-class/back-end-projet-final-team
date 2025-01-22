const { logger, app } = require('./services/app.service');
const config = require('./config');
const { connect, sequelize } = require('./services/db.service');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/schemas');
const resolvers = require('./graphql/resolvers');
const { cacheService, client } = require('./services/redisCache.service');
const webSocketService = require('./services/websocket.service');
const responseTimeMiddleware = require('./middlewares/responseTime.middleware');
const session = require('express-session');
const { RedisStore } = require('connect-redis');
const { attachUser } = require('./middlewares/auth.middleware');
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

    await cacheService.isRedisReady().then((isReady) => {
      if (isReady) {
        logger.info('✅ Redis is ready');
      } else {
        logger.error('❌ Redis is not ready', isReady);
      }
    });
    app.use(
      session({
        store: new RedisStore({ client }),
        secret: config.redis.secretSession,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false,
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24,
        },
      }),
    );

    app.use(attachUser);

    app.use(responseTimeMiddleware);

    const server = app.listen(port, () => {
      logger.info(`✅ Server listening on port ${port}`);
      logger.info(
        `✅ GraphQL server ready ${config.env === 'development' ? `at ${process.env.GRAPHQL_STUDIO}` : ''}`,
      );
    });

    webSocketService.initialize(server);

    const gracefulShutdown = () => {
      webSocketService.shutdown();
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (err) {
    logger.error(`Error starting server: ${err.message}`);
  }
};

start();
