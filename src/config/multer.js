const multer = require('multer');
const logger = require('../utils/loggerUtil');

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files are allowed!'), false);
    return;
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(
      new Error('Invalid image format. Only JPEG, PNG and WebP are allowed.'),
      false,
    );
    return;
  }

  cb(null, true);
};

const audioFilter = (req, file, cb) => {
  if (file.fieldname === 'audio') {
    if (!file.originalname.match(/\.(mp3|wav|m4a)$/)) {
      cb(new Error('Only MP3, WAV and M4A files are allowed!'), false);
      return;
    }

    const allowedTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/x-m4a',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(
        new Error('Invalid audio format. Only MP3, WAV and M4A are allowed.'),
        false,
      );
      return;
    }
  } else if (file.fieldname === 'cover') {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed for cover!'), false);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(
        new Error(
          'Invalid image format. Only JPEG, PNG and WebP are allowed for cover.',
        ),
        false,
      );
      return;
    }
  }

  cb(null, true);
};

const uploadImage = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
});

const uploadAudio = multer({
  storage: storage,
  fileFilter: audioFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for audio files
    files: 2, // Allow both audio and cover image
  },
});

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message:
          err.field === 'audio'
            ? 'Audio file too large. Maximum size is 50MB'
            : 'Image file too large. Maximum size is 5MB',
      });
    }
    return res.status(400).json({ message: err.message });
  }
  next(err);
};

module.exports = {
  uploadImage,
  uploadAudio,
  handleMulterError,
};
