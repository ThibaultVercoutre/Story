import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

// Interface pour les attributs de la story
interface StoryAttributes {
  id: string; // UUID pour la dérivation de clé
  titre: string; // Champ chiffré (stocké en hex)
  description?: string; // Champ chiffré optionnel (stocké en hex)
  auteur: string; // Non chiffré (pour recherche/tri)
  statut: 'brouillon' | 'en_cours' | 'terminee' | 'publiee'; // Non chiffré
  iv: string; // IV partagé pour toute la ligne
  tag: string; // Tag GCM partagé pour toute la ligne
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface pour la création (id optionnel car généré automatiquement)
interface StoryCreationAttributes extends Optional<StoryAttributes, 'id'> {}

// Interface pour les données en clair (utilisée par les services)
interface StoryDecrypted {
  id: string;
  titre: string;
  description?: string;
  auteur: string;
  statut: 'brouillon' | 'en_cours' | 'terminee' | 'publiee';
  createdAt?: Date;
  updatedAt?: Date;
}

// Définition du modèle
class Story extends Model<StoryAttributes, StoryCreationAttributes> 
  implements StoryAttributes {
  public id!: string;
  public titre!: string; // Stocké chiffré
  public description?: string; // Stocké chiffré
  public auteur!: string;
  public statut!: 'brouillon' | 'en_cours' | 'terminee' | 'publiee';
  public iv!: string;
  public tag!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialisation du modèle
Story.init(
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
    modelName: 'Story',
    tableName: 'stories',
    timestamps: true,
  }
);

export default Story;
export type { StoryDecrypted };
