const { logger, app } = require('./services/app.service');
const config = require('./config');
const { connect, sequelize } = require('./services/db.service');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/schemas');
const resolvers = require('./graphql/resolvers');

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
      introspection: true, // Enable introspection for the playground
      playground: false, // Disable old playground
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app });

    app.listen(port, () => {
      logger.info(`✅ Server listening on port ${port}`);
      logger.info(
        `✅ GraphQL server ready at http://localhost:${port}${apolloServer.graphqlPath}`,
      );
    });
  } catch (err) {
    logger.error(`Error starting server: ${err.message}`);
  }
};

start();
