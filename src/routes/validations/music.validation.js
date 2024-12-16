const Joi = require('joi');
const { GENRE } = require('../../models/enums');

const trackSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title cannot be empty',
  }),

  album_id: Joi.number().integer().positive().allow(null).messages({
    'number.base': 'Album ID must be a number',
    'number.integer': 'Album ID must be an integer',
    'number.positive': 'Album ID must be positive',
  }),

  artist_id: Joi.number().integer().positive().required().messages({
    'any.required': 'Artist ID is required',
    'number.base': 'Artist ID must be a number',
    'number.integer': 'Artist ID must be an integer',
    'number.positive': 'Artist ID must be positive',
  }),

  duration_seconds: Joi.number().integer().positive().required().messages({
    'any.required': 'Duration is required',
    'number.base': 'Duration must be a number',
    'number.integer': 'Duration must be an integer',
    'number.positive': 'Duration must be positive',
  }),

  genre: Joi.string()
    .valid(...Object.values(GENRE))
    .required()
    .messages({
      'any.required': 'Genre is required',
      'any.only': 'Invalid genre',
    }),

  track_number: Joi.number().integer().positive().allow(null),

  lyrics: Joi.string().allow('', null),
  audio_file_path: Joi.string().required(),
  file_formats: Joi.array().items(Joi.string()),
  phonetic_title: Joi.string().allow('', null),
  musical_features: Joi.object().allow(null),
});

const albumSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title cannot be empty',
  }),

  release_date: Joi.date().iso().required().messages({
    'any.required': 'Release date is required',
    'date.base': 'Invalid release date',
  }),

  genre: Joi.string()
    .valid(...Object.values(GENRE))
    .required()
    .messages({
      'any.required': 'Genre is required',
      'any.only': 'Invalid genre',
    }),

  primary_artist_id: Joi.number().integer().positive().required().messages({
    'any.required': 'Primary artist ID is required',
    'number.base': 'Primary artist ID must be a number',
    'number.integer': 'Primary artist ID must be an integer',
    'number.positive': 'Primary artist ID must be positive',
  }),

  artist_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .unique()
    .min(1)
    .required()
    .messages({
      'any.required': 'Artist IDs are required',
      'array.min': 'At least one artist is required',
      'array.unique': 'Artist IDs must be unique',
    }),

  cover_art_url: Joi.string().uri().allow('', null),
  total_tracks: Joi.number().integer().min(0).default(0),
  total_duration_seconds: Joi.number().integer().min(0).default(0),
  popularity_score: Joi.number().min(0).max(100).default(0),
});

const playlistSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Name is required',
    'string.empty': 'Name cannot be empty',
  }),

  is_public: Joi.boolean().required().messages({
    'any.required': 'Public/private status is required',
    'boolean.base': 'Public/private status must be a boolean',
  }),
});

const artistSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Name is required',
    'string.empty': 'Name cannot be empty',
  }),

  genre: Joi.string()
    .valid(...Object.values(GENRE))
    .required()
    .messages({
      'any.required': 'Genre is required',
      'any.only': 'Invalid genre',
    }),

  country: Joi.string().min(2).max(100).allow('', null).messages({
    'string.min': 'Country must be at least 2 characters',
    'string.max': 'Country cannot exceed 100 characters',
  }),

  bio: Joi.string().allow('', null),
  spotify_url: Joi.string().uri().allow('', null),
  image_url: Joi.string().uri().allow('', null),
  phonetic_name: Joi.string().allow('', null),
});

module.exports = {
  trackSchema,
  albumSchema,
  playlistSchema,
  artistSchema,
};
