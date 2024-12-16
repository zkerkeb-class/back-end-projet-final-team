const { faker } = require('@faker-js/faker');
const logger = require('../utils/loggerUtil');
const bcrypt = require('bcrypt');
const {
  User,
  Role,
  Artist,
  Album,
  Track,
  Playlist,
  UserRole,
  AlbumArtist,
  PlaylistTrack,
} = require('../models');
const { GENRE, USER_TYPE } = require('../models/enums');

const TOTAL_USERS = 10;
const TOTAL_ARTISTS = 5;
const ALBUMS_PER_ARTIST = 2;
const TRACKS_PER_ALBUM = 8;
const PLAYLISTS_PER_USER = 2;

async function seedDatabase() {
  try {
    logger.log('Starting database seeding...');

    // Create roles
    logger.log('Creating roles...');
    const roles = await Promise.all([
      Role.create({
        name: 'admin_user',
        description: 'Administrator with full access',
      }),
      Role.create({
        name: 'artist_user',
        description: 'Artist with content management access',
      }),
      Role.create({
        name: 'standard_user',
        description: 'Standard user with basic access',
      }),
    ]);

    // Create admin user
    logger.log('Creating admin user...');
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password_hash: await bcrypt.hash('admin123', 10),
      user_type: USER_TYPE.ADMIN,
      first_name: 'Admin',
      last_name: 'User',
      is_verified: true,
      is_active: true,
    });

    await UserRole.create({
      user_id: adminUser.id,
      role_id: roles[0].id, // admin role
    });

    // Create standard users
    logger.log('Creating standard users...');
    const users = await Promise.all(
      Array(TOTAL_USERS)
        .fill()
        .map(async () => {
          const user = await User.create({
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password_hash: await bcrypt.hash('password123', 10),
            user_type: USER_TYPE.STANDARD,
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            profile_picture_url: faker.image.avatar(),
            is_verified: true,
            is_active: true,
          });

          await UserRole.create({
            user_id: user.id,
            role_id: roles[2].id, // standard role
          });

          return user;
        }),
    );

    // Create artists
    logger.log('Creating artists...');
    const artists = await Promise.all(
      Array(TOTAL_ARTISTS)
        .fill()
        .map(async () => {
          const artist = await Artist.create({
            name: faker.person.fullName(),
            bio: faker.lorem.paragraph(),
            genre: faker.helpers.arrayElement(Object.values(GENRE)),
            country: faker.location.country(),
            image_url: faker.image.avatar(),
            phonetic_name: faker.person.fullName(),
            total_listeners: faker.number.int({ min: 1000, max: 1000000 }),
          });

          // Create artist user account
          const artistUser = await User.create({
            username: faker.internet.displayName(),
            email: faker.internet.email(),
            password_hash: await bcrypt.hash('password123', 10),
            user_type: USER_TYPE.ARTIST,
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            profile_picture_url: faker.image.avatar(),
            artist_id: artist.id,
            is_verified: true,
            is_active: true,
          });

          await UserRole.create({
            user_id: artistUser.id,
            role_id: roles[1].id, // artist role
          });

          return artist;
        }),
    );

    // Create albums for each artist
    logger.log('Creating albums and tracks...');
    for (const artist of artists) {
      await Promise.all(
        Array(ALBUMS_PER_ARTIST)
          .fill()
          .map(async () => {
            const album = await Album.create({
              title: faker.music.songName(),
              release_date: faker.date.past(),
              genre: artist.genre,
              primary_artist_id: artist.id,
              cover_art_url: faker.image.urlPicsumPhotos(),
              total_tracks: TRACKS_PER_ALBUM,
              popularity_score: faker.number.float({ min: 0, max: 100 }),
            });

            await AlbumArtist.create({
              album_id: album.id,
              artist_id: artist.id,
              role: 'primary',
            });

            // Create tracks for the album
            const tracks = await Promise.all(
              Array(TRACKS_PER_ALBUM)
                .fill()
                .map(async (_, index) => {
                  return Track.create({
                    title: faker.music.songName(),
                    album_id: album.id,
                    artist_id: artist.id,
                    duration_seconds: faker.number.int({ min: 120, max: 300 }),
                    track_number: index + 1,
                    genre: album.genre,
                    audio_file_path: faker.system.filePath(),
                    file_formats: ['mp3', 'wav'],
                    popularity_score: faker.number.float({ min: 0, max: 100 }),
                    total_plays: faker.number.int({ min: 0, max: 1000000 }),
                    release_date: album.release_date,
                    phonetic_title: faker.music.songName(),
                  });
                }),
            );

            return { album, tracks };
          }),
      );
    }

    // Create playlists for each user
    logger.log('Creating playlists...');
    const tracks = await Track.findAll();

    for (const user of [...users, adminUser]) {
      await Promise.all(
        Array(PLAYLISTS_PER_USER)
          .fill()
          .map(async () => {
            const playlist = await Playlist.create({
              name: faker.music.genre(),
              creator_id: user.id,
              is_public: faker.datatype.boolean(),
              total_tracks: faker.number.int({ min: 5, max: 15 }),
            });

            // Add random tracks to playlist
            const playlistTracks = faker.helpers.arrayElements(
              tracks,
              playlist.total_tracks,
            );
            await Promise.all(
              playlistTracks.map((track, index) =>
                PlaylistTrack.create({
                  playlist_id: playlist.id,
                  track_id: track.id,
                  track_order: index + 1,
                  added_at: faker.date.recent(),
                }),
              ),
            );

            return playlist;
          }),
      );
    }

    logger.log('Database seeding completed successfully!');
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
}

// Run the seeder
seedDatabase()
  .then(() => {
    logger.log('Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Seeding failed:', error);
    process.exit(1);
  });
