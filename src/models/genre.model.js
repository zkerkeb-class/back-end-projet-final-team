const { sequelize, DataTypes, Model } = require('../services/db.service');
const musicGenres = require('../constants/musicGenres');

class Genre extends Model {}

Genre.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'Genre',
    tableName: 'genres',
    timestamps: true,
    underscored: true,
  },
);

Genre.sync({ force: false }).then(async () => {
  const existingGenres = await Genre.findAll();
  if (existingGenres.length === 0) {
    musicGenres.forEach(async (genre) => {
      await Genre.create({ name: genre });
    });
  }
});

module.exports = Genre;
