import { v4 as uuidv4 } from 'uuid';
import { Chapitre } from '../models/index.js';
import { EncryptionService } from './encryption.service.js';
import { SlugUtil } from '../utils/slug.util.js';

export interface ChapitreInput {
  titre: string;
  numero: number;
  storyId: number;
}

export interface ChapitreOutput {
  id: number;
  uuid: string;
  titre: string;
  slug: string;
  numero: number;
  storyId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour les champs chiffrés de Chapitre
interface ChapitreEncryptedFields {
  titre: string;
  slug: string;
}

export class ChapitreService {
  // Configuration centralisée des champs chiffrés
  private static readonly ENCRYPTED_FIELDS_CONFIG = {
    titre: {
      fromInput: (data: ChapitreInput) => data.titre,
      fromModel: (model: Chapitre) => model.titre
    },
    slug: {
      fromInput: (data: ChapitreInput) => SlugUtil.generateSlug(data.titre),
      fromModel: (model: Chapitre) => model.slug
    }
  } as const;



  // Fonction générique pour extraire les champs à déchiffrer depuis le modèle
  private static getFieldsToDecrypt(chapitre: Chapitre): ChapitreEncryptedFields {
    const fields = {} as ChapitreEncryptedFields;
    
    for (const [key, config] of Object.entries(this.ENCRYPTED_FIELDS_CONFIG)) {
      const value = config.fromModel(chapitre);
      if (value !== undefined) {
        (fields as any)[key] = value;
      }
    }
    
    return fields;
  }

  // Fonction générique pour extraire les champs à chiffrer depuis les données d'entrée
  private static getFieldsToEncrypt(data: ChapitreInput): ChapitreEncryptedFields {
    const fields = {} as ChapitreEncryptedFields;
    
    for (const [key, config] of Object.entries(this.ENCRYPTED_FIELDS_CONFIG)) {
      const value = config.fromInput(data);
      if (value !== undefined) {
        (fields as any)[key] = value;
      }
    }
    
    return fields;
  }

  // Fonction utilitaire pour convertir les champs chiffrés vers Record<string, string>
  private static fieldsToRecord(fields: ChapitreEncryptedFields): Record<string, string> {
    const record: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        record[key] = value;
      }
    }
    
    return record;
  }

  // Récupérer tous les chapitres
  public static async getAllChapitres(): Promise<ChapitreOutput[]> {
    const chapitres = await Chapitre.findAll({
      order: [['numero', 'ASC']],
    });

    return chapitres.map(chapitre => {
      const fieldsToDecrypt = this.getFieldsToDecrypt(chapitre);
      const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

      const decryptedData = EncryptionService.decryptRowData(
        fieldsRecord,
        chapitre.uuid,
        chapitre.iv,
        chapitre.tag
      );

      return {
        id: chapitre.id,
        uuid: chapitre.uuid,
        titre: decryptedData.titre,
        slug: decryptedData.slug,
        numero: chapitre.numero,
        storyId: chapitre.storyId,
        createdAt: chapitre.createdAt,
        updatedAt: chapitre.updatedAt,
      };
    });
  }

  // Récupérer un chapitre par ID
  public static async getChapitreById(id: number): Promise<ChapitreOutput | null> {
    const chapitre = await Chapitre.findByPk(id);
    
    if (!chapitre) {
      return null;
    }

    const fieldsToDecrypt = this.getFieldsToDecrypt(chapitre);
    const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

    const decryptedData = EncryptionService.decryptRowData(
      fieldsRecord,
      chapitre.uuid,
      chapitre.iv,
      chapitre.tag
    );

    return {
      id: chapitre.id,
      uuid: chapitre.uuid,
      titre: decryptedData.titre,
      slug: decryptedData.slug,
      numero: chapitre.numero,
      storyId: chapitre.storyId,
      createdAt: chapitre.createdAt,
      updatedAt: chapitre.updatedAt,
    };
  }

  // Récupérer un chapitre par UUID
  public static async getChapitreByUuid(uuid: string): Promise<ChapitreOutput | null> {
    const chapitre = await Chapitre.findOne({ where: { uuid } });
    
    if (!chapitre) {
      return null;
    }

    const fieldsToDecrypt = this.getFieldsToDecrypt(chapitre);
    const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

    const decryptedData = EncryptionService.decryptRowData(
      fieldsRecord,
      chapitre.uuid,
      chapitre.iv,
      chapitre.tag
    );

    return {
      id: chapitre.id,
      uuid: chapitre.uuid,
      titre: decryptedData.titre,
      slug: decryptedData.slug,
      numero: chapitre.numero,
      storyId: chapitre.storyId,
      createdAt: chapitre.createdAt,
      updatedAt: chapitre.updatedAt,
    };
  }

  // Récupérer un chapitre par slug
  public static async getChapitreBySlug(slug: string): Promise<ChapitreOutput | null> {
    const chapitres = await Chapitre.findAll();
    
    for (const chapitre of chapitres) {
      try {
        const fieldsToDecrypt = this.getFieldsToDecrypt(chapitre);
        const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

        const decryptedData = EncryptionService.decryptRowData(
          fieldsRecord,
          chapitre.uuid,
          chapitre.iv,
          chapitre.tag
        );

        if (decryptedData.slug === slug) {
          return {
            id: chapitre.id,
            uuid: chapitre.uuid,
            titre: decryptedData.titre,
            slug: decryptedData.slug,
            numero: chapitre.numero,
            storyId: chapitre.storyId,
            createdAt: chapitre.createdAt,
            updatedAt: chapitre.updatedAt,
          };
        }
      } catch (error) {
        // Ignore les erreurs de déchiffrement pour les chapitres corrompus
        continue;
      }
    }

    return null;
  }

  // Récupérer un chapitre par ID, UUID ou slug
  public static async getChapitreByIdOrUuidOrSlug(identifier: string | number): Promise<ChapitreOutput | null> {
    // Si c'est un nombre, chercher par ID
    if (typeof identifier === 'number') {
      return this.getChapitreById(identifier);
    }
    
    // Si c'est un string, vérifier si c'est un UUID
    if (typeof identifier === 'string' && identifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return this.getChapitreByUuid(identifier);
    }
    
    // Sinon chercher par slug
    return this.getChapitreBySlug(identifier as string);
  }

  // Récupérer les chapitres d'une story par ID
  public static async getChapitresByStoryId(storyId: number): Promise<ChapitreOutput[]> {
    const chapitres = await Chapitre.findAll({
      where: { storyId },
      order: [['numero', 'ASC']],
    });

    return chapitres.map(chapitre => {
      const fieldsToDecrypt = this.getFieldsToDecrypt(chapitre);
      const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

      const decryptedData = EncryptionService.decryptRowData(
        fieldsRecord,
        chapitre.uuid,
        chapitre.iv,
        chapitre.tag
      );

      return {
        id: chapitre.id,
        uuid: chapitre.uuid,
        titre: decryptedData.titre,
        slug: decryptedData.slug,
        numero: chapitre.numero,
        storyId: chapitre.storyId,
        createdAt: chapitre.createdAt,
        updatedAt: chapitre.updatedAt,
      };
    });
  }

  // Créer un nouveau chapitre
  public static async createChapitre(data: ChapitreInput): Promise<ChapitreOutput> {
    const uuid = uuidv4();
    const fieldsToEncrypt = this.getFieldsToEncrypt(data);
    const fieldsRecord = this.fieldsToRecord(fieldsToEncrypt);
    
    const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
      fieldsRecord,
      uuid
    );

    const chapitre = await Chapitre.create({
      uuid,
      titre: encryptedData.titre,
      slug: encryptedData.slug,
      numero: data.numero,
      storyId: data.storyId,
      iv,
      tag,
    });

    return {
      id: chapitre.id,
      uuid: chapitre.uuid,
      titre: fieldsToEncrypt.titre,
      slug: fieldsToEncrypt.slug,
      numero: chapitre.numero,
      storyId: chapitre.storyId,
      createdAt: chapitre.createdAt,
      updatedAt: chapitre.updatedAt,
    };
  }

  // Mettre à jour un chapitre
  public static async updateChapitre(id: number, data: Partial<ChapitreInput>): Promise<ChapitreOutput | null> {
    const chapitre = await Chapitre.findByPk(id);
    
    if (!chapitre) {
      return null;
    }

    // Déchiffrer les données actuelles
    const currentFieldsToDecrypt = this.getFieldsToDecrypt(chapitre);
    const currentFieldsRecord = this.fieldsToRecord(currentFieldsToDecrypt);

    const currentDecryptedData = EncryptionService.decryptRowData(
      currentFieldsRecord,
      chapitre.uuid,
      chapitre.iv,
      chapitre.tag
    );

    // Préparer les nouvelles données
    const newData: ChapitreInput = {
      titre: data.titre || currentDecryptedData.titre,
      numero: data.numero || chapitre.numero,
      storyId: data.storyId || chapitre.storyId
    };

    const fieldsToEncrypt = this.getFieldsToEncrypt(newData);
    const fieldsRecord = this.fieldsToRecord(fieldsToEncrypt);

    const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
      fieldsRecord,
      chapitre.uuid
    );

    // Mettre à jour le chapitre
    await chapitre.update({
      titre: encryptedData.titre,
      slug: encryptedData.slug,
      numero: newData.numero,
      storyId: newData.storyId,
      iv,
      tag,
    });

    return {
      id: chapitre.id,
      uuid: chapitre.uuid,
      titre: fieldsToEncrypt.titre,
      slug: fieldsToEncrypt.slug,
      numero: chapitre.numero,
      storyId: chapitre.storyId,
      createdAt: chapitre.createdAt,
      updatedAt: chapitre.updatedAt,
    };
  }

  // Supprimer un chapitre
  public static async deleteChapitre(id: number): Promise<boolean> {
    const chapitre = await Chapitre.findByPk(id);
    
    if (!chapitre) {
      return false;
    }

    await chapitre.destroy();
    return true;
  }
} 