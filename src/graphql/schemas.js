const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar JSON

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

  type ImageUrl {
    urls: ImageUrls!
    baseKey: String!
  }

  type ImageUrls {
    large: ImageFormats!
    medium: ImageFormats!
    original: ImageFormats!
    thumbnail: ImageFormats!
  }

  type ImageFormats {
    png: String!
    webp: String!
    jpeg: String!
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
    image_url: JSON!
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
    image_url: JSON!
  }

  type Artist {
    id: Int!
    name: String!
    genre: String!
    popularityScore: Float!
    image_url: JSON!
  }

  type Playlist {
    id: Int!
    name: String!
    creator: String!
    totalTracks: Int!
    totalDurationSeconds: Int!
    popularityScore: Float!
    image_url: JSON!
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
