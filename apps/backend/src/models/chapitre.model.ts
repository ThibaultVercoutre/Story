import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

// Ici nous importerons tous nos modèles
// Exemple: import User from './User';

// Ici nous définirons les associations entre les modèles
// Exemple: User.hasMany(Post);

// Interface pour les attributs du chapitre
interface ChapitreAttributes {
  id: string; // UUID pour la dérivation de clé
  titre: string; // Champ chiffré (stocké en hex)
  numero: number; // Non chiffré (pour indexation/tri)
  storyId: string; // Clé étrangère vers Story
  iv: string; // IV partagé pour toute la ligne
  tag: string; // Tag GCM partagé pour toute la ligne
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface pour la création (id optionnel car généré automatiquement)
interface ChapitreCreationAttributes extends Optional<ChapitreAttributes, 'id'> {}

// Interface pour les données en clair (utilisée par les services)
interface ChapitreDecrypted {
  id: string;
  titre: string;
  numero: number;
  storyId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Définition du modèle
class Chapitre extends Model<ChapitreAttributes, ChapitreCreationAttributes> 
  implements ChapitreAttributes {
  public id!: string;
  public titre!: string; // Stocké chiffré
  public numero!: number;
  public storyId!: string;
  public iv!: string;
  public tag!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialisation du modèle
Chapitre.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    titre: {
      type: DataTypes.TEXT, // Stockage des données chiffrées en hex
      allowNull: false,
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    storyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'stories',
        key: 'id',
      },
    },
    iv: {
      type: DataTypes.STRING(24), // 12 bytes en hex = 24 caractères
      allowNull: false,
    },
    tag: {
      type: DataTypes.STRING(32), // 16 bytes en hex = 32 caractères
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Chapitre',
    tableName: 'chapitres',
    timestamps: true,
  }
);

export default Chapitre;
export type { ChapitreDecrypted };
// Nous exporterons aussi nos modèles
// Exemple: export { User }; 