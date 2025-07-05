import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

// Ici nous importerons tous nos modèles
// Exemple: import User from './User';

// Ici nous définirons les associations entre les modèles
// Exemple: User.hasMany(Post);

// Interface pour les attributs du chapitre
interface ChapitreAttributes {
  id: number; // ID auto-incrémenté pour la base de données
  uuid: string; // UUID pour la dérivation de clé de chiffrement
  titre: string; // Champ chiffré (stocké en hex)
  slug: string; // Champ chiffré (slug généré depuis le titre, stocké en hex)
  numero: number; // Non chiffré (pour indexation/tri)
  storyId: number; // Clé étrangère vers Story (ID auto-incrémenté)
  iv: string; // IV partagé pour toute la ligne
  tag: string; // Tag GCM partagé pour toute la ligne
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface pour la création (id et uuid optionnels car générés automatiquement)
interface ChapitreCreationAttributes extends Optional<ChapitreAttributes, 'id' | 'uuid'> {}

// Interface pour les données en clair (utilisée par les services)
interface ChapitreDecrypted {
  id: number;
  uuid: string;
  titre: string;
  slug: string;
  numero: number;
  storyId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Définition du modèle
class Chapitre extends Model<ChapitreAttributes, ChapitreCreationAttributes> 
  implements ChapitreAttributes {
  public id!: number;
  public uuid!: string;
  public titre!: string; // Stocké chiffré
  public slug!: string; // Stocké chiffré
  public numero!: number;
  public storyId!: number;
  public iv!: string;
  public tag!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialisation du modèle
Chapitre.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    titre: {
      type: DataTypes.TEXT, // Stockage des données chiffrées en hex
      allowNull: false,
    },
    slug: {
      type: DataTypes.TEXT, // Stockage du slug chiffré en hex
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
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'stories',
        key: 'id',
      },
    },
    iv: {
      type: DataTypes.TEXT, // IV hex (ou concaténation future) séparé par ':'
      allowNull: false,
    },
    tag: {
      type: DataTypes.TEXT, // tag hex (ou concaténation future) séparé par ':'
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