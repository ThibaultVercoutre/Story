import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

// Interface pour les attributs de la story
interface StoryAttributes {
  id: number; // ID auto-incrémenté pour la base de données
  uuid: string; // UUID pour la dérivation de clé de chiffrement
  titre: string; // Champ chiffré (stocké en hex)
  slug: string; // Champ chiffré (slug généré depuis le titre, stocké en hex)
  description?: string; // Champ chiffré optionnel (stocké en hex)
  auteur: string; // Non chiffré (pour recherche/tri)
  statut: 'brouillon' | 'en_cours' | 'terminee' | 'publiee'; // Non chiffré
  iv: string; // IV partagé pour toute la ligne
  tag: string; // Tag GCM partagé pour toute la ligne
  userId: number; // ID de l'utilisateur
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface pour la création (id et uuid optionnels car générés automatiquement)
interface StoryCreationAttributes extends Optional<StoryAttributes, 'id' | 'uuid'> {}

// Interface pour les données en clair (utilisée par les services)
interface StoryDecrypted {
  id: number;
  uuid: string;
  titre: string;
  slug: string;
  description?: string;
  auteur: string;
  statut: 'brouillon' | 'en_cours' | 'terminee' | 'publiee';
  createdAt?: Date;
  updatedAt?: Date;
}

// Définition du modèle
class Story extends Model<StoryAttributes, StoryCreationAttributes> 
  implements StoryAttributes {
  public id!: number;
  public uuid!: string;
  public titre!: string; // Stocké chiffré
  public slug!: string; // Stocké chiffré
  public description?: string; // Stocké chiffré
  public auteur!: string;
  public statut!: 'brouillon' | 'en_cours' | 'terminee' | 'publiee';
  public iv!: string;
  public tag!: string;
  public userId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialisation du modèle
Story.init(
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
    description: {
      type: DataTypes.TEXT, // Stockage des données chiffrées en hex
      allowNull: true,
    },
    auteur: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    statut: {
      type: DataTypes.ENUM('brouillon', 'en_cours', 'terminee', 'publiee'),
      allowNull: false,
      defaultValue: 'brouillon',
    },
    iv: {
      type: DataTypes.TEXT, // concaténation de plusieurs IV hex séparés par ':'
      allowNull: false,
    },
    tag: {
      type: DataTypes.TEXT, // concaténation de plusieurs tags hex séparés par ':'
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Story',
    tableName: 'stories',
    timestamps: true,
  }
);

export default Story;
export type { StoryDecrypted };
