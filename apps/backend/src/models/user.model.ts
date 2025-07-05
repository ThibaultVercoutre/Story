import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface UserAttributes {
  id: number;
  uuid: string;
  email: string; // Chiffré
  nom: string; // Chiffré
  passwordHash: string; // Haché (pas chiffré)
  iv: string;
  tag: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'lastLoginAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public uuid!: string;
  public email!: string;
  public nom!: string;
  public passwordHash!: string;
  public iv!: string;
  public tag!: string;
  public isActive!: boolean;
  public lastLoginAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Email chiffré',
    },
    nom: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Nom chiffré',
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Mot de passe haché avec bcrypt',
    },
    iv: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Vecteurs d\'initialisation pour le chiffrement',
    },
    tag: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Tags d\'authentification pour le chiffrement',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['uuid'],
      },
    ],
  }
);

export default User; 