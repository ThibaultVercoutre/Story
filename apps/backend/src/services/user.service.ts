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

// Interface pour les champs chiffrés de User
interface UserEncryptedFields {
  email: string;
  nom: string;
}

export class UserService {
  private static readonly SALT_ROUNDS = 12;

  // Configuration centralisée des champs chiffrés
  private static readonly ENCRYPTED_FIELDS_CONFIG = {
    email: {
      fromInput: (data: Partial<UserInput>) => data.email || '',
      fromModel: (model: User) => model.email
    },
    nom: {
      fromInput: (data: Partial<UserInput>) => data.nom || '',
      fromModel: (model: User) => model.nom
    }
  } as const;

  // Fonction générique pour extraire les champs à déchiffrer depuis le modèle
  private static getFieldsToDecrypt(user: User): UserEncryptedFields {
    const fields = {} as UserEncryptedFields;
    
    for (const [key, config] of Object.entries(this.ENCRYPTED_FIELDS_CONFIG)) {
      const value = config.fromModel(user);
      if (value !== undefined) {
        (fields as any)[key] = value;
      }
    }
    
    return fields;
  }

  // Fonction générique pour extraire les champs à chiffrer depuis les données d'entrée
  private static getFieldsToEncrypt(data: Partial<UserInput>): UserEncryptedFields {
    const fields = {} as UserEncryptedFields;
    
    for (const [key, config] of Object.entries(this.ENCRYPTED_FIELDS_CONFIG)) {
      const value = config.fromInput(data);
      if (value !== undefined) {
        (fields as any)[key] = value;
      }
    }
    
    return fields;
  }

  // Fonction utilitaire pour convertir les champs chiffrés vers Record<string, string>
  private static fieldsToRecord(fields: UserEncryptedFields): Record<string, string> {
    const record: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        record[key] = value;
      }
    }
    
    return record;
  }

  // Créer un nouvel utilisateur
  public static async createUser(data: UserInput): Promise<UserOutput> {
    const uuid = uuidv4();
    
    // Hacher le mot de passe
    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);
    
    // Chiffrer les données sensibles
    const fieldsToEncrypt = this.getFieldsToEncrypt(data);
    const fieldsRecord = this.fieldsToRecord(fieldsToEncrypt);
    
    const { encryptedData, iv, tag } = EncryptionService.encryptRowData(fieldsRecord, uuid);
    
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
        const fieldsToDecrypt = this.getFieldsToDecrypt(user);
        const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);
        
        const decryptedData = EncryptionService.decryptRowData(
          fieldsRecord,
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
        const fieldsToDecrypt = this.getFieldsToDecrypt(user);
        const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);
        
        const decryptedData = EncryptionService.decryptRowData(
          fieldsRecord,
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
      const currentFieldsToDecrypt = this.getFieldsToDecrypt(user);
      const currentFieldsRecord = this.fieldsToRecord(currentFieldsToDecrypt);
      
      const currentData = EncryptionService.decryptRowData(
        currentFieldsRecord,
        user.uuid,
        user.iv,
        user.tag
      );
      
      // Préparer les nouvelles données
      const newData: Partial<UserInput> = {
        email: data.email || currentData.email,
        nom: data.nom || currentData.nom,
      };
      
      const fieldsToEncrypt = this.getFieldsToEncrypt(newData);
      const fieldsRecord = this.fieldsToRecord(fieldsToEncrypt);
      const { encryptedData, iv, tag } = EncryptionService.encryptRowData(fieldsRecord, user.uuid);
      
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
    const user = await this.getUserByEmail(email);
    return user !== null;
  }

  private static formatUserOutput(user: InstanceType<typeof User>): UserOutput {
    const fieldsToDecrypt = this.getFieldsToDecrypt(user);
    const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);
    
    const decryptedData = EncryptionService.decryptRowData(
      fieldsRecord,
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