const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Query {
    test: String!
  }
  type Mutation {
    test: String!
  }
`;

module.exports = typeDefs;
