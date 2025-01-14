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
    entityType: EntityType
    limit: Int!
  }

  type Track {
    id: Int!
    name: String!
    album: String!
    artist: String!
    duration: Float!
    trackNumber: Int!
    lyrics: String!
    genre: String!
    audioFilePath: String!
    cover: String!
    popularityScore: Float!
  }

  type Album {
    id: Int!
    name: String!
    releaseDate: String!
    genre: String!
    primaryArtist: String!
    totalTracks: Int!
    coverArtUrl: String!
    totalDurationSeconds: Int!
    popularityScore: Float!
    phoneticTitle: String!
  }

  type Artist {
    id: Int!
    name: String!
    genre: String!
    popularityScore: Float!
  }

  type Playlist {
    id: Int!
    name: String!
    creator: String!
    totalTracks: Int!
    totalDurationSeconds: Int!
    popularityScore: Float!
  }

  type SearchResults {
    tracks: [Track]!
    albums: [Album]!
    artists: [Artist]!
    playlists: [Playlist]!
  }

  type Query {
    test: String!
    search(input: SearchInput!): SearchResults!
  }

  type Mutation {
    test: String!
  }
`;

module.exports = typeDefs;
