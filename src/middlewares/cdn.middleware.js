const path = require('path');
const express = require('express');
const cdnService = require('../services/cdn.service');

/**
 * Middleware to serve CDN images with format and size negotiation
 */
const serveImages = (storageBasePath) => {
  return express.static(storageBasePath, {
    setHeaders: (res, filePath) => {
      // Set cache control headers
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
      res.setHeader(
        'Expires',
        new Date(Date.now() + 31536000000).toUTCString(),
      );

      // Set content type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      switch (ext) {
        case '.webp':
          res.setHeader('Content-Type', 'image/webp');
          break;
        case '.avif':
          res.setHeader('Content-Type', 'image/avif');
          break;
        case '.jpg':
        case '.jpeg':
          res.setHeader('Content-Type', 'image/jpeg');
          break;
      }
    },
  });
};

/**
 * Middleware to determine the best image format and size based on client capabilities
 */
const negotiateImageFormat = (req, res, next) => {
  // Get client's accepted formats
  const acceptHeader = req.headers.accept || '';
  req.preferredFormat = cdnService.getBestFormat(acceptHeader);

  // Get client's viewport size (if provided in query or headers)
  const viewportWidth = parseInt(
    req.query.width || req.headers['viewport-width'] || 0,
  );
  req.preferredSize = cdnService.getBestSize(viewportWidth);

  next();
};

/**
 * Middleware to validate image upload
 */
const validateImageUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    next();
  }

  const file = req.file || req.files[0];
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/jpg',
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return res.status(400).json({
      message:
        'Invalid file type. Only JPEG, PNG, AVIF, JPG, and WebP images are allowed',
    });
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return res.status(400).json({
      message: 'File too large. Maximum size is 5MB',
    });
  }

  next();
};

module.exports = {
  serveImages,
  negotiateImageFormat,
  validateImageUpload,
};
