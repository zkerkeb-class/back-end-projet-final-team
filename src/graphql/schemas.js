const { gql } = require('apollo-server-express');

const typeDefs = gql`
  enum EntityType {
    PLAYLIST
    TITLE
    ALBUM
    ARTIST
  }

  input SearchInput {
    query: String!
    entityType: EntityType!
    limit: Int!
  }

  type Query {
    test: String!
    search(input: SearchInput!): [String!]!
  }

  type Mutation {
    test: String!
  }
`;

module.exports = typeDefs;
