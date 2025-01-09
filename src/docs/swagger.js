const swaggerJsdoc = require('swagger-jsdoc');
const { version } = require('../../package.json');
const { GENRE, USER_TYPE } = require('../models/enums');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Zakharmony API Documentation',
      version,
      description: 'API documentation for the Zakharmony application',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'API Support',
        email: 'support@zakharmony.com',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        ImageFormat: {
          type: 'object',
          properties: {
            urls: {
              type: 'object',
              properties: {
                original: {
                  type: 'object',
                  properties: {
                    webp: { type: 'string', format: 'uri' },
                    jpeg: { type: 'string', format: 'uri' },
                    png: { type: 'string', format: 'uri' },
                  },
                },
                thumbnail: {
                  type: 'object',
                  properties: {
                    webp: { type: 'string', format: 'uri' },
                    jpeg: { type: 'string', format: 'uri' },
                    png: { type: 'string', format: 'uri' },
                  },
                },
                medium: {
                  type: 'object',
                  properties: {
                    webp: { type: 'string', format: 'uri' },
                    jpeg: { type: 'string', format: 'uri' },
                    png: { type: 'string', format: 'uri' },
                  },
                },
                large: {
                  type: 'object',
                  properties: {
                    webp: { type: 'string', format: 'uri' },
                    jpeg: { type: 'string', format: 'uri' },
                    png: { type: 'string', format: 'uri' },
                  },
                },
              },
            },
            baseKey: { type: 'string' },
          },
        },
        Genre: {
          type: 'string',
          enum: Object.values(GENRE),
        },
        UserType: {
          type: 'string',
          enum: Object.values(USER_TYPE),
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            user_type: { $ref: '#/components/schemas/UserType' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            profile_picture: { $ref: '#/components/schemas/ImageFormat' },
            profile_picture_url: { type: 'string', format: 'uri' },
            is_verified: { type: 'boolean' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Artist: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            bio: { type: 'string' },
            genre: { $ref: '#/components/schemas/Genre' },
            country: { type: 'string' },
            image_url: { type: 'string', format: 'uri' },
            total_listeners: { type: 'integer' },
            phonetic_title: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Album: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            release_date: { type: 'string', format: 'date' },
            genre: { $ref: '#/components/schemas/Genre' },
            primary_artist_id: { type: 'integer' },
            cover_art_url: { type: 'string', format: 'uri' },
            total_tracks: { type: 'integer' },
            total_duration_seconds: { type: 'integer' },
            popularity_score: { type: 'number', format: 'float' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Track: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            album_id: { type: 'integer' },
            artist_id: { type: 'integer' },
            duration_seconds: { type: 'integer' },
            track_number: { type: 'integer' },
            lyrics: { type: 'string' },
            genre: { $ref: '#/components/schemas/Genre' },
            audio_file_path: { type: 'string' },
            file_formats: {
              type: 'array',
              items: { type: 'string' },
            },
            popularity_score: { type: 'number', format: 'float' },
            total_plays: { type: 'integer' },
            release_date: { type: 'string', format: 'date' },
            phonetic_title: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Playlist: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            creator_id: { type: 'integer' },
            is_public: { type: 'boolean' },
            total_tracks: { type: 'integer' },
            total_duration_seconds: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

module.exports = swaggerJsdoc(options);
