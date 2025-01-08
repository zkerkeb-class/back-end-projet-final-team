const resolvers = {
  Query: {
    async test() {
      return 'Hello World!';
    },
  },
  Mutation: {
    async test() {
      return 'Hello World!';
    },
  },
};

module.exports = resolvers;
