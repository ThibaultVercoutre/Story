import sequelize from '../config/database.js';
import Chapitre from './chapitre.model.js';
import MorceauTexte from './morceauTexte.model.js';
import Story from './story.model.js';
import User from './user.model.js';

// Ici nous définirons les associations entre les modèles
// Exemple: User.hasMany(Post);

// Définition des associations
// Une story a plusieurs chapitres
Story.hasMany(Chapitre, {
  foreignKey: 'storyId',
  as: 'chapitres',
  onDelete: 'CASCADE',
});

Chapitre.belongsTo(Story, {
  foreignKey: 'storyId',
  as: 'story',
});

// Un chapitre a plusieurs morceaux de texte
Chapitre.hasMany(MorceauTexte, {
  foreignKey: 'chapitreId',
  as: 'morceauxTexte',
  onDelete: 'CASCADE',
});

MorceauTexte.belongsTo(Chapitre, {
  foreignKey: 'chapitreId',
  as: 'chapitre',
});

// Un utilisateur a plusieurs stories
User.hasMany(Story, {
  foreignKey: 'userId',
  as: 'stories',
  onDelete: 'CASCADE',
});

Story.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

export default sequelize;
export { Chapitre, MorceauTexte, Story, User };