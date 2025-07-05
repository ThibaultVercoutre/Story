import { v4 as uuidv4 } from 'uuid';
import Story from '../models/story.model.js';
import { EncryptionService } from './encryption.service.js';

export interface StoryInput {
  titre: string;
  description?: string;
  auteur: string;
  statut?: 'brouillon' | 'en_cours' | 'terminee' | 'publiee';
  userId: number;
}

export interface StoryOutput {
  id: number;
  uuid: string;
  titre: string;
  slug: string;
  description?: string;
  auteur: string;
  statut: 'brouillon' | 'en_cours' | 'terminee' | 'publiee';
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour les champs chiffrés de Story
interface StoryEncryptedFields {
  titre: string;
  slug: string;
  description?: string;
  auteur: string;
}

export class StoryService {
  // Configuration centralisée des champs chiffrés
  private static readonly ENCRYPTED_FIELDS_CONFIG = {
    titre: {
      fromInput: (data: StoryInput) => data.titre,
      fromModel: (model: Story) => model.titre
    },
    slug: {
      fromInput: (data: StoryInput) => this.generateSlug(data.titre),
      fromModel: (model: Story) => model.slug
    },
    description: {
      fromInput: (data: StoryInput) => data.description,
      fromModel: (model: Story) => model.description
    },
    auteur: {
      fromInput: (data: StoryInput) => data.auteur || 'Auteur Inconnu',
      fromModel: (model: Story) => model.auteur || 'Auteur Inconnu'
    }
  } as const;

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

  // Fonction générique pour extraire les champs à déchiffrer depuis le modèle
  private static getFieldsToDecrypt(story: Story): StoryEncryptedFields {
    const fields = {} as StoryEncryptedFields;
    
    for (const [key, config] of Object.entries(this.ENCRYPTED_FIELDS_CONFIG)) {
      const value = config.fromModel(story);
      if (value !== undefined) {
        (fields as any)[key] = value;
      }
    }
    
    return fields;
  }

  // Fonction générique pour extraire les champs à chiffrer depuis les données d'entrée
  private static getFieldsToEncrypt(data: StoryInput): StoryEncryptedFields {
    const fields = {} as StoryEncryptedFields;
    
    for (const [key, config] of Object.entries(this.ENCRYPTED_FIELDS_CONFIG)) {
      const value = config.fromInput(data);
      if (value !== undefined) {
        (fields as any)[key] = value;
      }
    }
    
    return fields;
  }

  // Fonction utilitaire pour convertir les champs chiffrés vers Record<string, string>
  private static fieldsToRecord(fields: StoryEncryptedFields): Record<string, string> {
    const record: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        record[key] = value;
      }
    }
    
    return record;
  }

  // Récupérer toutes les stories
  public static async getAllStories(): Promise<StoryOutput[]> {
    const stories = await Story.findAll({
      order: [['createdAt', 'DESC']],
    });

    return stories.map((story: InstanceType<typeof Story>) => {
      const fieldsToDecrypt = this.getFieldsToDecrypt(story);
      const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

      const decryptedData = EncryptionService.decryptRowData(
        fieldsRecord,
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
        auteur: decryptedData.auteur,
        statut: story.statut,
        userId: story.userId,
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

    const fieldsToDecrypt = this.getFieldsToDecrypt(story);
    const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

    const decryptedData = EncryptionService.decryptRowData(
      fieldsRecord,
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
      auteur: decryptedData.auteur,
      statut: story.statut,
      userId: story.userId,
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

    const fieldsToDecrypt = this.getFieldsToDecrypt(story);
    const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

    const decryptedData = EncryptionService.decryptRowData(
      fieldsRecord,
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
      auteur: decryptedData.auteur,
      statut: story.statut,
      userId: story.userId,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
    };
  }

  // Récupérer une story par slug
  public static async getStoryBySlug(slug: string): Promise<StoryOutput | null> {
    const stories = await Story.findAll();
    
    for (const story of stories) {
      try {
        const fieldsToDecrypt = this.getFieldsToDecrypt(story);
        const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

        const decryptedData = EncryptionService.decryptRowData(
          fieldsRecord,
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
            auteur: decryptedData.auteur,
            statut: story.statut,
            userId: story.userId,
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
      const fieldsToDecrypt = this.getFieldsToDecrypt(story);
      const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

      const decryptedData = EncryptionService.decryptRowData(
        fieldsRecord,
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
        auteur: decryptedData.auteur,
        statut: story.statut,
        userId: story.userId,
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
      const fieldsToDecrypt = this.getFieldsToDecrypt(story);
      const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

      const decryptedData = EncryptionService.decryptRowData(
        fieldsRecord,
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
        auteur: decryptedData.auteur,
        statut: story.statut,
        userId: story.userId,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
      };
    });
  }

  // Créer une nouvelle story
  public static async createStory(data: StoryInput): Promise<StoryOutput> {
    const uuid = uuidv4();
    const fieldsToEncrypt = this.getFieldsToEncrypt(data);
    const fieldsRecord = this.fieldsToRecord(fieldsToEncrypt);

    const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
      fieldsRecord,
      uuid
    );

    const story = await Story.create({
      uuid,
      titre: encryptedData.titre,
      slug: encryptedData.slug,
      description: encryptedData.description,
      auteur: encryptedData.auteur,
      statut: data.statut || 'brouillon',
      iv,
      tag,
      userId: data.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      id: story.id,
      uuid: story.uuid,
      titre: fieldsToEncrypt.titre,
      slug: fieldsToEncrypt.slug,
      description: fieldsToEncrypt.description,
      auteur: fieldsToEncrypt.auteur,
      statut: story.statut,
      userId: story.userId,
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
    const currentFieldsToDecrypt = this.getFieldsToDecrypt(story);
    const currentFieldsRecord = this.fieldsToRecord(currentFieldsToDecrypt);

    const currentDecryptedData = EncryptionService.decryptRowData(
      currentFieldsRecord,
      story.uuid,
      story.iv,
      story.tag
    );

    // Préparer les nouvelles données
    const newData: StoryInput = {
      titre: data.titre || currentDecryptedData.titre,
      description: data.description !== undefined ? data.description : currentDecryptedData.description,
      auteur: data.auteur || currentDecryptedData.auteur,
      statut: data.statut || story.statut,
      userId: story.userId
    };

    const fieldsToEncrypt = this.getFieldsToEncrypt(newData);
    const fieldsRecord = this.fieldsToRecord(fieldsToEncrypt);

    const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
      fieldsRecord,
      story.uuid
    );

    // Mettre à jour la story
    await story.update({
      titre: encryptedData.titre,
      slug: encryptedData.slug,
      description: encryptedData.description,
      auteur: encryptedData.auteur,
      statut: newData.statut,
      iv,
      tag,
    });

    return {
      id: story.id,
      uuid: story.uuid,
      titre: fieldsToEncrypt.titre,
      slug: fieldsToEncrypt.slug,
      description: fieldsToEncrypt.description,
      auteur: fieldsToEncrypt.auteur,
      statut: story.statut,
      userId: story.userId,
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