const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const path = require('path');
const fs = require('fs').promises;
const createUniqueId = require('../utils/createUniqueId');
const logger = require('../utils/loggerUtil');
const s3Service = require('./s3.service');

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

class AudioService {
  constructor() {
    this.supportedFormats = ['mp3', 'wav', 'm4a'];
    this.audioBasePath =
      process.env.AUDIO_STORAGE_PATH ||
      path.join(__dirname, '../../storage/audio');
    this.initializeStorage();

    // Audio quality settings
    this.audioSettings = {
      mp3: {
        codec: 'libmp3lame',
        bitrate: '192k',
        channels: 2,
        sampleRate: 44100,
        quality: 5, // Range is 0-9, lower means better quality
      },
      wav: {
        codec: 'pcm_s16le',
        channels: 2,
        sampleRate: 44100,
      },
      m4a: {
        codec: 'aac',
        bitrate: '192k',
        channels: 2,
        sampleRate: 44100,
      },
    };
  }

  async initializeStorage() {
    try {
      await fs.access(this.audioBasePath);
    } catch {
      await fs.mkdir(this.audioBasePath, { recursive: true });
    }
  }

  async processAudio(buffer, originalFormat) {
    try {
      const baseKey = createUniqueId('tracks');
      const basePath = path.join(this.audioBasePath, baseKey);
      await fs.mkdir(basePath, { recursive: true });

      // Save original buffer to temporary file
      const tempPath = path.join(basePath, `original.${originalFormat}`);
      await fs.writeFile(tempPath, buffer);

      // Save original format if it's supported
      const filePaths = {};
      let duration = 0;
      if (this.supportedFormats.includes(originalFormat)) {
        const originalFilePath = path.join(basePath, `track.${originalFormat}`);
        await fs.copyFile(tempPath, originalFilePath);
        filePaths[originalFormat] = path.relative(
          this.audioBasePath,
          originalFilePath,
        );
        duration = await this.getAudioDuration(originalFilePath);
      }

      // First, convert to WAV as intermediate format if not already WAV
      const wavPath = path.join(basePath, 'intermediate.wav');
      if (originalFormat !== 'wav') {
        await this.convertToWav(tempPath, wavPath);
      }

      // Convert to other formats using WAV as source
      const sourcePath = originalFormat === 'wav' ? tempPath : wavPath;
      const conversions = this.supportedFormats
        .filter((format) => format !== originalFormat && format !== 'wav')
        .map((format) => this.convertFormat(sourcePath, basePath, format));

      // If WAV is needed and not original format, copy intermediate to final
      if (originalFormat !== 'wav' && this.supportedFormats.includes('wav')) {
        const wavFinalPath = path.join(basePath, 'track.wav');
        await fs.copyFile(wavPath, wavFinalPath);
        filePaths['wav'] = path.relative(this.audioBasePath, wavFinalPath);
      }

      // Wait for all conversions to complete
      await Promise.all(conversions);

      // Get file paths for converted formats
      for (const format of this.supportedFormats) {
        if (format === originalFormat || format === 'wav') continue;
        const filePath = path.join(basePath, `track.${format}`);
        if (await this.fileExists(filePath)) {
          filePaths[format] = path.relative(this.audioBasePath, filePath);
        }
      }

      // Clean up temporary files
      await fs.unlink(tempPath);
      if (originalFormat !== 'wav') {
        await fs.unlink(wavPath);
      }

      for (const format in filePaths) {
        const relativePath = filePaths[format];
        const fullPath = path.join(this.audioBasePath, relativePath);
        const fileBuffer = await fs.readFile(fullPath);
        const key = `${baseKey}/${path.basename(relativePath)}`;
        filePaths[format] = await s3Service.uploadBuffer(
          fileBuffer,
          key,
          'audio/mpeg',
        );
      }

      await fs.rm(basePath, { recursive: true, force: true });

      return {
        baseKey,
        urls: filePaths,
        duration,
      };
    } catch (error) {
      logger.error('Error processing audio:', error);
      throw new Error(`Audio processing failed: ${error.message}`);
    }
  }

  convertToWav(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      const settings = this.audioSettings.wav;
      ffmpeg(inputPath)
        .toFormat('wav')
        .audioCodec(settings.codec)
        .audioChannels(settings.channels)
        .audioFrequency(settings.sampleRate)
        .on('error', (err) => {
          logger.error('Error converting to WAV:', err);
          reject(err);
        })
        .on('end', () => {
          logger.info('Successfully converted to WAV');
          resolve();
        })
        .save(outputPath);
    });
  }

  convertFormat(inputPath, outputDir, format) {
    return new Promise((resolve, reject) => {
      const settings = this.audioSettings[format];
      const outputPath = path.join(outputDir, `track.${format}`);

      const command = ffmpeg(inputPath)
        .audioChannels(settings.channels)
        .audioFrequency(settings.sampleRate);

      // Add format-specific settings
      switch (format) {
        case 'mp3':
          command
            .toFormat(format)
            .audioCodec(settings.codec)
            .audioBitrate(settings.bitrate)
            .audioQuality(settings.quality)
            .outputOptions(['-id3v2_version', '3', '-write_xing', '1']);
          break;

        case 'm4a':
          command
            .toFormat('ipod')
            .audioCodec(settings.codec)
            .audioBitrate(settings.bitrate)
            .outputOptions([
              '-strict',
              'experimental',
              '-movflags',
              '+faststart',
            ]);
          break;
      }

      command
        .on('start', (commandLine) => {
          logger.info(
            `Starting conversion to ${format}. Command: ${commandLine}`,
          );
        })
        .on('progress', (progress) => {
          logger.debug(
            `Converting to ${format}: ${Math.round(progress.percent)}% done`,
          );
        })
        .on('error', (err, stdout, stderr) => {
          logger.error(`Error converting to ${format}:`, err);
          logger.error('FFmpeg stdout:', stdout);
          logger.error('FFmpeg stderr:', stderr);
          reject(new Error(`Failed to convert to ${format}: ${err.message}`));
        })
        .on('end', () => {
          logger.info(`Successfully converted to ${format}`);
          resolve();
        })
        .save(outputPath);
    });
  }

  async deleteAudio(baseKey) {
    try {
      const dirPath = path.join(this.audioBasePath, baseKey);
      await fs.rm(dirPath, { recursive: true, force: true });
    } catch (error) {
      logger.error('Error deleting audio:', error);
      throw new Error(`Failed to delete audio: ${error.message}`);
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getAudioDuration(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          logger.error('Error getting audio duration:', err);
          reject(new Error(`Failed to get audio duration: ${err.message}`));
          return;
        }

        if (metadata.format && metadata.format.duration) {
          logger.debug('Duration obtained from format metadata');
          return resolve(metadata.format.duration);
        }

        const audioStream = metadata.streams.find(
          (stream) => stream.codec_type === 'audio',
        );
        if (audioStream) {
          if (audioStream.duration) {
            logger.debug('Duration obtained from audio stream');
            return resolve(audioStream.duration);
          }

          if (
            audioStream.time_base &&
            audioStream.nb_frames &&
            audioStream.duration_ts
          ) {
            const timeBase = audioStream.time_base.split('/');
            const duration =
              (audioStream.duration_ts * parseInt(timeBase[0])) /
              parseInt(timeBase[1]);
            logger.debug('Duration calculated from time_base and frames');
            return resolve(duration);
          }

          if (audioStream.bit_rate && metadata.format.size) {
            const duration = (metadata.format.size * 8) / audioStream.bit_rate;
            logger.debug('Duration calculated from bit_rate and file size');
            return resolve(duration);
          }
        }

        logger.warn('Could not determine audio duration through any method');
        reject(new Error('Could not determine audio duration'));
      });
    });
  }
}

module.exports = new AudioService();
