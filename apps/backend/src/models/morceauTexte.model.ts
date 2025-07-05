import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

// Types de morceaux de texte
export enum TypeMorceauTexte {
  PARAGRAPHE = 'paragraphe',
  CITATION = 'citation',
  DIALOGUE = 'dialogue'
}

// Interface pour les attributs du morceau de texte
interface MorceauTexteAttributes {
  id: number; // ID auto-incrémenté pour la base de données
  uuid: string; // UUID pour la dérivation de clé de chiffrement
  chapitreId: number; // Référence au chapitre (ID auto-incrémenté)
  type: TypeMorceauTexte; // Type de morceau (paragraphe, citation, dialogue)
  contenu: string; // Contenu chiffré (stocké en hex)
  ordre: number; // Ordre dans le chapitre (non chiffré pour tri)
  iv: string; // IV partagé pour toute la ligne
  tag: string; // Tag GCM partagé pour toute la ligne
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface pour la création (id et uuid optionnels car générés automatiquement)
interface MorceauTexteCreationAttributes extends Optional<MorceauTexteAttributes, 'id' | 'uuid'> {}

// Définition du modèle
class MorceauTexte extends Model<MorceauTexteAttributes, MorceauTexteCreationAttributes> 
  implements MorceauTexteAttributes {
  public id!: number;
  public uuid!: string;
  public chapitreId!: number;
  public type!: TypeMorceauTexte;
  public contenu!: string; // Stocké chiffré
  public ordre!: number;
  public iv!: string;
  public tag!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialisation du modèle
MorceauTexte.init(
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
    chapitreId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'chapitres',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(TypeMorceauTexte)),
      allowNull: false,
    },
    contenu: {
      type: DataTypes.TEXT, // Stockage des données chiffrées en hex
      allowNull: false,
    },
    ordre: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    iv: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tag: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'MorceauTexte',
    tableName: 'morceaux_texte',
    timestamps: true,
    indexes: [
      {
        fields: ['chapitreId', 'ordre'],
        unique: true,
      },
    ],
  }
);

export default MorceauTexte; 