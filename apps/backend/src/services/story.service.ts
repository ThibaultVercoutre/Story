import { v4 as uuidv4 } from 'uuid';
import Story from '../models/story.model.js';
import { EncryptionService } from './encryption.service.js';

export interface StoryInput {
  titre: string;
  description?: string;
  auteur: string;
  statut?: 'brouillon' | 'en_cours' | 'terminee' | 'publiee';
}

export interface StoryOutput {
  id: string;
  titre: string;
  description?: string;
  auteur: string;
  statut: 'brouillon' | 'en_cours' | 'terminee' | 'publiee';
  createdAt: Date;
  updatedAt: Date;
}

export class StoryService {
  // Récupérer toutes les stories
  public static async getAllStories(): Promise<StoryOutput[]> {
    const stories = await Story.findAll({
      order: [['createdAt', 'DESC']],
    });

    return stories.map((story: InstanceType<typeof Story>) => {
      const fieldsToDecrypt: Record<string, string> = { titre: story.titre };
      if (story.description) {
        fieldsToDecrypt.description = story.description;
      }

      const decryptedData = EncryptionService.decryptRowData(
        fieldsToDecrypt,
        story.id,
        story.iv,
        story.tag
      );

      return {
        id: story.id,
        titre: decryptedData.titre,
        description: decryptedData.description,
        auteur: story.auteur,
        statut: story.statut,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
      };
    });
  }

  // Récupérer une story par ID
  public static async getStoryById(id: string): Promise<StoryOutput | null> {
    const story = await Story.findByPk(id);
    
    if (!story) {
      return null;
    }

    const fieldsToDecrypt: Record<string, string> = { titre: story.titre };
    if (story.description) {
      fieldsToDecrypt.description = story.description;
    }

    const decryptedData = EncryptionService.decryptRowData(
      fieldsToDecrypt,
      story.id,
      story.iv,
      story.tag
    );

    return {
      id: story.id,
      titre: decryptedData.titre,
      description: decryptedData.description,
      auteur: story.auteur,
      statut: story.statut,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
    };
  }

  // Récupérer les stories par auteur
  public static async getStoriesByAuteur(auteur: string): Promise<StoryOutput[]> {
    const stories = await Story.findAll({
      where: { auteur },
      order: [['createdAt', 'DESC']],
    });

    return stories.map((story: InstanceType<typeof Story>) => {
      const fieldsToDecrypt: Record<string, string> = { titre: story.titre };
      if (story.description) {
        fieldsToDecrypt.description = story.description;
      }

      const decryptedData = EncryptionService.decryptRowData(
        fieldsToDecrypt,
        story.id,
        story.iv,
        story.tag
      );

      return {
        id: story.id,
        titre: decryptedData.titre,
        description: decryptedData.description,
        auteur: story.auteur,
        statut: story.statut,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
      };
    });
  }

  // Récupérer les stories par statut
  public static async getStoriesByStatut(statut: 'brouillon' | 'en_cours' | 'terminee' | 'publiee'): Promise<StoryOutput[]> {
    const stories = await Story.findAll({
      where: { statut },
      order: [['createdAt', 'DESC']],
    });

    return stories.map((story: InstanceType<typeof Story>) => {
      const fieldsToDecrypt: Record<string, string> = { titre: story.titre };
      if (story.description) {
        fieldsToDecrypt.description = story.description;
      }

      const decryptedData = EncryptionService.decryptRowData(
        fieldsToDecrypt,
        story.id,
        story.iv,
        story.tag
      );

      return {
        id: story.id,
        titre: decryptedData.titre,
        description: decryptedData.description,
        auteur: story.auteur,
        statut: story.statut,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
      };
    });
  }

  // Créer une nouvelle story
  public static async createStory(data: StoryInput): Promise<StoryOutput> {
    const id = uuidv4();
    
    const fieldsToEncrypt: Record<string, string> = { titre: data.titre };
    if (data.description) {
      fieldsToEncrypt.description = data.description;
    }

    const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
      fieldsToEncrypt,
      id
    );

    const story = await Story.create({
      id,
      titre: encryptedData.titre,
      description: encryptedData.description,
      auteur: data.auteur,
      statut: data.statut || 'brouillon',
      iv,
      tag,
    });

    return {
      id: story.id,
      titre: data.titre,
      description: data.description,
      auteur: story.auteur,
      statut: story.statut,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
    };
  }

  // Mettre à jour une story
  public static async updateStory(id: string, data: Partial<StoryInput>): Promise<StoryOutput | null> {
    const story = await Story.findByPk(id);
    
    if (!story) {
      return null;
    }

    // Si des champs chiffrés sont modifiés, on doit rechiffrer
    if (data.titre || data.description !== undefined) {
      // Récupérer les données actuelles déchiffrées
      const currentFieldsToDecrypt: Record<string, string> = { titre: story.titre };
      if (story.description) {
        currentFieldsToDecrypt.description = story.description;
      }

      const currentDecryptedData = EncryptionService.decryptRowData(
        currentFieldsToDecrypt,
        story.id,
        story.iv,
        story.tag
      );

      // Préparer les nouvelles données à chiffrer
      const newFieldsToEncrypt: Record<string, string> = {
        titre: data.titre || currentDecryptedData.titre,
      };
      
      if (data.description !== undefined) {
        if (data.description) {
          newFieldsToEncrypt.description = data.description;
        }
      } else if (currentDecryptedData.description) {
        newFieldsToEncrypt.description = currentDecryptedData.description;
      }

      const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
        newFieldsToEncrypt,
        id
      );

      await story.update({
        titre: encryptedData.titre,
        description: encryptedData.description,
        auteur: data.auteur || story.auteur,
        statut: data.statut || story.statut,
        iv,
        tag,
      });

      return {
        id: story.id,
        titre: data.titre || currentDecryptedData.titre,
        description: data.description !== undefined ? data.description : currentDecryptedData.description,
        auteur: data.auteur || story.auteur,
        statut: data.statut || story.statut,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
      };
    } else {
      // Si seuls les champs non chiffrés changent, pas besoin de rechiffrer
      await story.update({
        auteur: data.auteur || story.auteur,
        statut: data.statut || story.statut,
      });

      const fieldsToDecrypt: Record<string, string> = { titre: story.titre };
      if (story.description) {
        fieldsToDecrypt.description = story.description;
      }

      const decryptedData = EncryptionService.decryptRowData(
        fieldsToDecrypt,
        story.id,
        story.iv,
        story.tag
      );

      return {
        id: story.id,
        titre: decryptedData.titre,
        description: decryptedData.description,
        auteur: data.auteur || story.auteur,
        statut: data.statut || story.statut,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
      };
    }
  }

  // Supprimer une story
  public static async deleteStory(id: string): Promise<boolean> {
    const story = await Story.findByPk(id);
    
    if (!story) {
      return false;
    }

    await story.destroy();
    return true;
  }
} 