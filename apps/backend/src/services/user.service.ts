import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import { EncryptionService } from './encryption.service.js';

export interface UserInput {
  email: string;
  nom: string;
  password: string;
}

export interface UserOutput {
  id: number;
  uuid: string;
  email: string;
  nom: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export class UserService {
  private static readonly SALT_ROUNDS = 12;

  // Créer un nouvel utilisateur
  public static async createUser(data: UserInput): Promise<UserOutput> {
    const uuid = uuidv4();
    
    // Hacher le mot de passe
    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);
    
    // Chiffrer les données sensibles
    const fieldsToEncrypt = {
      email: data.email,
      nom: data.nom,
    };
    
    const { encryptedData, iv, tag } = EncryptionService.encryptRowData(fieldsToEncrypt, uuid);
    
    const user = await User.create({
      uuid,
      email: encryptedData.email,
      nom: encryptedData.nom,
      passwordHash,
      iv,
      tag,
      isActive: true,
    });

    return this.formatUserOutput(user);
  }

  // Authentifier un utilisateur
  public static async authenticateUser(credentials: LoginCredentials): Promise<UserOutput | null> {
    const users = await User.findAll({ where: { isActive: true } });
    
    // Chercher l'utilisateur par email déchiffré
    for (const user of users) {
      try {
        const fieldsToDecrypt = {
          email: user.email,
          nom: user.nom,
        };
        
        const decryptedData = EncryptionService.decryptRowData(
          fieldsToDecrypt,
          user.uuid,
          user.iv,
          user.tag
        );
        
        // Vérifier si l'email correspond
        if (decryptedData.email === credentials.email) {
          // Vérifier le mot de passe
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
          
          if (isPasswordValid) {
            // Mettre à jour la dernière connexion
            await user.update({ lastLoginAt: new Date() });
            return this.formatUserOutput(user);
          }
        }
      } catch (error) {
        // Ignorer les erreurs de déchiffrement pour les utilisateurs corrompus
        continue;
      }
    }
    
    return null;
  }

  // Récupérer un utilisateur par ID
  public static async getUserById(id: number): Promise<UserOutput | null> {
    const user = await User.findByPk(id);
    
    if (!user || !user.isActive) {
      return null;
    }

    return this.formatUserOutput(user);
  }

  // Récupérer un utilisateur par UUID
  public static async getUserByUuid(uuid: string): Promise<UserOutput | null> {
    const user = await User.findOne({ where: { uuid, isActive: true } });
    
    if (!user) {
      return null;
    }

    return this.formatUserOutput(user);
  }

  // Récupérer un utilisateur par email
  public static async getUserByEmail(email: string): Promise<UserOutput | null> {
    const users = await User.findAll({ where: { isActive: true } });
    
    for (const user of users) {
      try {
        const fieldsToDecrypt = {
          email: user.email,
          nom: user.nom,
        };
        
        const decryptedData = EncryptionService.decryptRowData(
          fieldsToDecrypt,
          user.uuid,
          user.iv,
          user.tag
        );
        
        if (decryptedData.email === email) {
          return this.formatUserOutput(user);
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }

  // Mettre à jour un utilisateur
  public static async updateUser(id: number, data: Partial<UserInput>): Promise<UserOutput | null> {
    const user = await User.findByPk(id);
    
    if (!user || !user.isActive) {
      return null;
    }

    // Si on met à jour des champs chiffrés
    if (data.email || data.nom) {
      const fieldsToDecrypt = {
        email: user.email,
        nom: user.nom,
      };
      
      const currentData = EncryptionService.decryptRowData(
        fieldsToDecrypt,
        user.uuid,
        user.iv,
        user.tag
      );
      
      // Préparer les nouvelles données
      const newData = {
        email: data.email || currentData.email,
        nom: data.nom || currentData.nom,
      };
      
      const { encryptedData, iv, tag } = EncryptionService.encryptRowData(newData, user.uuid);
      
      await user.update({
        email: encryptedData.email,
        nom: encryptedData.nom,
        iv,
        tag,
      });
    }

    // Si on met à jour le mot de passe
    if (data.password) {
      const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);
      await user.update({ passwordHash });
    }

    return this.formatUserOutput(user);
  }

  // Désactiver un utilisateur (soft delete)
  public static async deactivateUser(id: number): Promise<boolean> {
    const user = await User.findByPk(id);
    
    if (!user) {
      return false;
    }

    await user.update({ isActive: false });
    return true;
  }

  // Vérifier si un email existe déjà
  public static async emailExists(email: string): Promise<boolean> {
    const existingUser = await this.getUserByEmail(email);
    return existingUser !== null;
  }

  // Formater la sortie utilisateur (déchiffrer les données)
  private static formatUserOutput(user: InstanceType<typeof User>): UserOutput {
    const fieldsToDecrypt = {
      email: user.email,
      nom: user.nom,
    };
    
    const decryptedData = EncryptionService.decryptRowData(
      fieldsToDecrypt,
      user.uuid,
      user.iv,
      user.tag
    );

    return {
      id: user.id,
      uuid: user.uuid,
      email: decryptedData.email,
      nom: decryptedData.nom,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
} 