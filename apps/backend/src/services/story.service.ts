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
  id: number;
  uuid: string;
  titre: string;
  slug: string;
  description?: string;
  auteur: string;
  statut: 'brouillon' | 'en_cours' | 'terminee' | 'publiee';
  createdAt: Date;
  updatedAt: Date;
}

export class StoryService {
  // Fonction utilitaire pour générer un slug depuis un titre
  private static generateSlug(titre: string): string {
    return titre
      .toLowerCase()
      .normalize('NFD') // Décompose les caractères accentués
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9\s-]/g, '') // Garde seulement lettres, chiffres, espaces et tirets
      .trim()
      .replace(/\s+/g, '-') // Remplace les espaces par des tirets
      .replace(/-+/g, '-'); // Évite les tirets multiples
  }

  // Récupérer toutes les stories
  public static async getAllStories(): Promise<StoryOutput[]> {
    const stories = await Story.findAll({
      order: [['createdAt', 'DESC']],
    });

    return stories.map((story: InstanceType<typeof Story>) => {
      const fieldsToDecrypt: Record<string, string> = { titre: story.titre, slug: story.slug };
      if (story.description) {
        fieldsToDecrypt.description = story.description;
      }

      const decryptedData = EncryptionService.decryptRowData(
        fieldsToDecrypt,
        story.uuid,
        story.iv,
        story.tag
      );

      return {
        id: story.id,
        uuid: story.uuid,
        titre: decryptedData.titre,
        slug: decryptedData.slug,
        description: decryptedData.description,
        auteur: story.auteur,
        statut: story.statut,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
      };
    });
  }

  // Récupérer une story par ID
  public static async getStoryById(id: number): Promise<StoryOutput | null> {
    const story = await Story.findByPk(id);
    
    if (!story) {
      return null;
    }

    const fieldsToDecrypt: Record<string, string> = { titre: story.titre, slug: story.slug };
    if (story.description) {
      fieldsToDecrypt.description = story.description;
    }

    const decryptedData = EncryptionService.decryptRowData(
      fieldsToDecrypt,
      story.uuid,
      story.iv,
      story.tag
    );

    return {
      id: story.id,
      uuid: story.uuid,
      titre: decryptedData.titre,
      slug: decryptedData.slug,
      description: decryptedData.description,
      auteur: story.auteur,
      statut: story.statut,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
    };
  }

  // Récupérer une story par UUID
  public static async getStoryByUuid(uuid: string): Promise<StoryOutput | null> {
    const story = await Story.findOne({ where: { uuid } });
    
    if (!story) {
      return null;
    }

    const fieldsToDecrypt: Record<string, string> = { titre: story.titre, slug: story.slug };
    if (story.description) {
      fieldsToDecrypt.description = story.description;
    }

    const decryptedData = EncryptionService.decryptRowData(
      fieldsToDecrypt,
      story.uuid,
      story.iv,
      story.tag
    );

    return {
      id: story.id,
      uuid: story.uuid,
      titre: decryptedData.titre,
      slug: decryptedData.slug,
      description: decryptedData.description,
      auteur: story.auteur,
      statut: story.statut,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
    };
  }

  // Récupérer une story par slug
  public static async getStoryBySlug(slug: string): Promise<StoryOutput | null> {
    const stories = await Story.findAll();
    
    for (const story of stories) {
      try {
        const fieldsToDecrypt: Record<string, string> = { titre: story.titre, slug: story.slug };
        if (story.description) {
          fieldsToDecrypt.description = story.description;
        }

        const decryptedData = EncryptionService.decryptRowData(
          fieldsToDecrypt,
          story.uuid,
          story.iv,
          story.tag
        );

        if (decryptedData.slug === slug) {
          return {
            id: story.id,
            uuid: story.uuid,
            titre: decryptedData.titre,
            slug: decryptedData.slug,
            description: decryptedData.description,
            auteur: story.auteur,
            statut: story.statut,
            createdAt: story.createdAt,
            updatedAt: story.updatedAt,
          };
        }
      } catch (error) {
        // Ignore les erreurs de déchiffrement pour les stories corrompues
        continue;
      }
    }

    return null;
  }

  // Récupérer une story par ID, UUID ou slug
  public static async getStoryByIdOrUuidOrSlug(identifier: string | number): Promise<StoryOutput | null> {
    // Si c'est un nombre, chercher par ID
    if (typeof identifier === 'number') {
      return this.getStoryById(identifier);
    }
    
    // Si c'est un string, vérifier si c'est un UUID
    if (typeof identifier === 'string' && identifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return this.getStoryByUuid(identifier);
    }
    
    // Sinon chercher par slug
    return this.getStoryBySlug(identifier as string);
  }

  // Récupérer les stories par auteur
  public static async getStoriesByAuteur(auteur: string): Promise<StoryOutput[]> {
    const stories = await Story.findAll({
      where: { auteur },
      order: [['createdAt', 'DESC']],
    });

    return stories.map((story: InstanceType<typeof Story>) => {
      const fieldsToDecrypt: Record<string, string> = { titre: story.titre, slug: story.slug };
      if (story.description) {
        fieldsToDecrypt.description = story.description;
      }

      const decryptedData = EncryptionService.decryptRowData(
        fieldsToDecrypt,
        story.uuid,
        story.iv,
        story.tag
      );

      return {
        id: story.id,
        uuid: story.uuid,
        titre: decryptedData.titre,
        slug: decryptedData.slug,
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
      const fieldsToDecrypt: Record<string, string> = { titre: story.titre, slug: story.slug };
      if (story.description) {
        fieldsToDecrypt.description = story.description;
      }

      const decryptedData = EncryptionService.decryptRowData(
        fieldsToDecrypt,
        story.uuid,
        story.iv,
        story.tag
      );

      return {
        id: story.id,
        uuid: story.uuid,
        titre: decryptedData.titre,
        slug: decryptedData.slug,
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
    const uuid = uuidv4();
    const slug = this.generateSlug(data.titre);
    
    const fieldsToEncrypt: Record<string, string> = { titre: data.titre, slug };
    if (data.description) {
      fieldsToEncrypt.description = data.description;
    }

    const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
      fieldsToEncrypt,
      uuid
    );

    const story = await Story.create({
      uuid,
      titre: encryptedData.titre,
      slug: encryptedData.slug,
      description: encryptedData.description,
      auteur: data.auteur,
      statut: data.statut || 'brouillon',
      iv,
      tag,
    });

    return {
      id: story.id,
      uuid: story.uuid,
      titre: data.titre,
      slug: slug,
      description: data.description,
      auteur: story.auteur,
      statut: story.statut,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
    };
  }

  // Mettre à jour une story
  public static async updateStory(id: number, data: Partial<StoryInput>): Promise<StoryOutput | null> {
    const story = await Story.findByPk(id);
    
    if (!story) {
      return null;
    }

    // Déchiffrer les données actuelles
    const currentFieldsToDecrypt: Record<string, string> = { titre: story.titre, slug: story.slug };
    if (story.description) {
      currentFieldsToDecrypt.description = story.description;
    }

    const currentDecryptedData = EncryptionService.decryptRowData(
      currentFieldsToDecrypt,
      story.uuid,
      story.iv,
      story.tag
    );

    // Préparer les nouvelles données
    const newTitre = data.titre || currentDecryptedData.titre;
    const newSlug = data.titre ? this.generateSlug(data.titre) : currentDecryptedData.slug;
    const newDescription = data.description !== undefined ? data.description : currentDecryptedData.description;

    const fieldsToEncrypt: Record<string, string> = { titre: newTitre, slug: newSlug };
    if (newDescription) {
      fieldsToEncrypt.description = newDescription;
    }

    const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
      fieldsToEncrypt,
      story.uuid
    );

    // Mettre à jour la story
    await story.update({
      titre: encryptedData.titre,
      slug: encryptedData.slug,
      description: encryptedData.description,
      auteur: data.auteur || story.auteur,
      statut: data.statut || story.statut,
      iv,
      tag,
    });

    return {
      id: story.id,
      uuid: story.uuid,
      titre: newTitre,
      slug: newSlug,
      description: newDescription,
      auteur: story.auteur,
      statut: story.statut,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
    };
  }

  // Supprimer une story
  public static async deleteStory(id: number): Promise<boolean> {
    const story = await Story.findByPk(id);
    
    if (!story) {
      return false;
    }

    await story.destroy();
    return true;
  }
} 