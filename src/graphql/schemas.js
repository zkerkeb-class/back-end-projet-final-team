const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar JSON

  enum EntityType {
    PLAYLIST
    TITLE
    ALBUM
    ARTIST
  }

  input TrackFilters {
    genres: [String]
    minDuration: Float
    maxDuration: Float
    fromReleaseDate: String
    toReleaseDate: String
    minPopularityScore: Float
  }

  input AlbumFilters {
    genres: [String]
    minTracks: Float
    maxTracks: Float
    fromReleaseDate: String
    toReleaseDate: String
    minPopularityScore: Float
  }

  input ArtistFilters {
    genres: [String]
    minPopularityScore: Float
  }

  input PlaylistFilters {
    minTracks: Float
    maxTracks: Float
    minDuration: Float
    maxDuration: Float
    minPopularityScore: Float
  }

  input SearchInput {
    query: String!
    entityType: EntityType
    limit: Int!
  }

  input Filters {
    query: String
    entityType: EntityType
    trackFilters: TrackFilters
    albumFilters: AlbumFilters
    artistFilters: ArtistFilters
    limit: Int!
    offset: Int!
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
    album_id: String!
    album_name: String!
    artist_id: String!
    artist_name: String!
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

  union SearchResult = Track | Album | Artist | Playlist

  type SearchResultEdge {
    node: SearchResult!
    type: EntityType!
  }

  type SearchResultsFiltered {
    edges: [SearchResultEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String!
  }

  type Query {
    test: String!
    search(input: SearchInput!): SearchResults!
    filterSearch(input: Filters!): SearchResultsFiltered!
  }

  type Mutation {
    test: String!
  }
`;

module.exports = typeDefs;
