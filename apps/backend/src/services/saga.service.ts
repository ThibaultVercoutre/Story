import { v4 as uuidv4 } from 'uuid';
import { Saga } from '../models/index.js';
import { EncryptionService } from './encryption.service.js';

export interface SagaInput {
  titre: string;
  description?: string;
  auteur: string;
  statut?: 'brouillon' | 'en_cours' | 'terminee' | 'publiee';
}

export interface SagaOutput {
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

// Interface pour les champs chiffrés de Saga
interface SagaEncryptedFields {
  titre: string;
  slug: string;
  description?: string;
  auteur: string;
}

export class SagaService {
  // Configuration centralisée des champs chiffrés
  private static readonly ENCRYPTED_FIELDS_CONFIG = {
    titre: {
      fromInput: (data: SagaInput) => data.titre,
      fromModel: (model: Saga) => model.titre
    },
    slug: {
      fromInput: (data: SagaInput) => this.generateSlug(data.titre),
      fromModel: (model: Saga) => model.slug
    },
    description: {
      fromInput: (data: SagaInput) => data.description,
      fromModel: (model: Saga) => model.description
    },
    auteur: {
      fromInput: (data: SagaInput) => data.auteur || 'Auteur Inconnu',
      fromModel: (model: Saga) => model.auteur || 'Auteur Inconnu'
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
  private static getFieldsToDecrypt(saga: Saga): SagaEncryptedFields {
    const fields = {} as SagaEncryptedFields;
    
    for (const [key, config] of Object.entries(this.ENCRYPTED_FIELDS_CONFIG)) {
      const value = config.fromModel(saga);
      if (value !== undefined) {
        (fields as any)[key] = value;
      }
    }
    
    return fields;
  }

  // Fonction générique pour extraire les champs à chiffrer depuis les données d'entrée
  private static getFieldsToEncrypt(data: SagaInput): SagaEncryptedFields {
    const fields = {} as SagaEncryptedFields;
    
    for (const [key, config] of Object.entries(this.ENCRYPTED_FIELDS_CONFIG)) {
      const value = config.fromInput(data);
      if (value !== undefined) {
        (fields as any)[key] = value;
      }
    }
    
    return fields;
  }

  // Fonction utilitaire pour convertir les champs chiffrés vers Record<string, string>
  private static fieldsToRecord(fields: SagaEncryptedFields): Record<string, string> {
    const record: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        record[key] = value;
      }
    }
    
    return record;
  }

  // Récupérer toutes les sagas
  public static async getAllSagas(): Promise<SagaOutput[]> {
    const sagas = await Saga.findAll({
      order: [['createdAt', 'DESC']],
    });

    return sagas.map((saga: InstanceType<typeof Saga>) => {
      const fieldsToDecrypt = this.getFieldsToDecrypt(saga);
      const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

      const decryptedData = EncryptionService.decryptRowData(
        fieldsRecord,
        saga.uuid,
        saga.iv,
        saga.tag
      );

      return {
        id: saga.id,
        uuid: saga.uuid,
        titre: decryptedData.titre,
        slug: decryptedData.slug,
        description: decryptedData.description,
        auteur: decryptedData.auteur,
        statut: saga.statut,
        createdAt: saga.createdAt,
        updatedAt: saga.updatedAt,
      };
    });
  }

  // Récupérer une saga par ID
  public static async getSagaById(id: number): Promise<SagaOutput | null> {
    const saga = await Saga.findByPk(id);
    
    if (!saga) {
      return null;
    }

    const fieldsToDecrypt = this.getFieldsToDecrypt(saga);
    const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

    const decryptedData = EncryptionService.decryptRowData(
      fieldsRecord,
      saga.uuid,
      saga.iv,
      saga.tag
    );

    return {
      id: saga.id,
      uuid: saga.uuid,
      titre: decryptedData.titre,
      slug: decryptedData.slug,
      description: decryptedData.description,
      auteur: decryptedData.auteur,
      statut: saga.statut,
      createdAt: saga.createdAt,
      updatedAt: saga.updatedAt,
    };
  }

  // Récupérer une saga par UUID
  public static async getSagaByUuid(uuid: string): Promise<SagaOutput | null> {
    const saga = await Saga.findOne({ where: { uuid } });
    
    if (!saga) {
      return null;
    }

    const fieldsToDecrypt = this.getFieldsToDecrypt(saga);
    const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

    const decryptedData = EncryptionService.decryptRowData(
      fieldsRecord,
      saga.uuid,
      saga.iv,
      saga.tag
    );

    return {
      id: saga.id,
      uuid: saga.uuid,
      titre: decryptedData.titre,
      slug: decryptedData.slug,
      description: decryptedData.description,
      auteur: decryptedData.auteur,
      statut: saga.statut,
      createdAt: saga.createdAt,
      updatedAt: saga.updatedAt,
    };
  }

  // Récupérer une saga par slug
  public static async getSagaBySlug(slug: string): Promise<SagaOutput | null> {
    const sagas = await Saga.findAll();
    
    for (const saga of sagas) {
      try {
        const fieldsToDecrypt = this.getFieldsToDecrypt(saga);
        const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

        const decryptedData = EncryptionService.decryptRowData(
          fieldsRecord,
          saga.uuid,
          saga.iv,
          saga.tag
        );

        if (decryptedData.slug === slug) {
          return {
            id: saga.id,
            uuid: saga.uuid,
            titre: decryptedData.titre,
            slug: decryptedData.slug,
            description: decryptedData.description,
            auteur: decryptedData.auteur,
            statut: saga.statut,
            createdAt: saga.createdAt,
            updatedAt: saga.updatedAt,
          };
        }
      } catch (error) {
        // Ignore les erreurs de déchiffrement pour les sagas corrompues
        continue;
      }
    }

    return null;
  }

  // Récupérer une saga par ID, UUID ou slug
  public static async getSagaByIdOrUuidOrSlug(identifier: string | number): Promise<SagaOutput | null> {
    // Si c'est un nombre, chercher par ID
    if (typeof identifier === 'number') {
      return this.getSagaById(identifier);
    }
    
    // Si c'est un string, vérifier si c'est un UUID
    if (typeof identifier === 'string' && identifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return this.getSagaByUuid(identifier);
    }
    
    // Sinon chercher par slug
    return this.getSagaBySlug(identifier as string);
  }

  // Récupérer les sagas par auteur
  public static async getSagasByAuteur(auteur: string): Promise<SagaOutput[]> {
    const sagas = await Saga.findAll({
      where: { auteur },
      order: [['createdAt', 'DESC']],
    });

    return sagas.map((saga: InstanceType<typeof Saga>) => {
      const fieldsToDecrypt = this.getFieldsToDecrypt(saga);
      const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

      const decryptedData = EncryptionService.decryptRowData(
        fieldsRecord,
        saga.uuid,
        saga.iv,
        saga.tag
      );

      return {
        id: saga.id,
        uuid: saga.uuid,
        titre: decryptedData.titre,
        slug: decryptedData.slug,
        description: decryptedData.description,
        auteur: decryptedData.auteur,
        statut: saga.statut,
        createdAt: saga.createdAt,
        updatedAt: saga.updatedAt,
      };
    });
  }

  // Récupérer les sagas par statut
  public static async getSagasByStatut(statut: 'brouillon' | 'en_cours' | 'terminee' | 'publiee'): Promise<SagaOutput[]> {
    const sagas = await Saga.findAll({
      where: { statut },
      order: [['createdAt', 'DESC']],
    });

    return sagas.map((saga: InstanceType<typeof Saga>) => {
      const fieldsToDecrypt = this.getFieldsToDecrypt(saga);
      const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

      const decryptedData = EncryptionService.decryptRowData(
        fieldsRecord,
        saga.uuid,
        saga.iv,
        saga.tag
      );

      return {
        id: saga.id,
        uuid: saga.uuid,
        titre: decryptedData.titre,
        slug: decryptedData.slug,
        description: decryptedData.description,
        auteur: decryptedData.auteur,
        statut: saga.statut,
        createdAt: saga.createdAt,
        updatedAt: saga.updatedAt,
      };
    });
  }

  // Créer une nouvelle saga
  public static async createSaga(data: SagaInput): Promise<SagaOutput> {
    const uuid = uuidv4();
    const fieldsToEncrypt = this.getFieldsToEncrypt(data);
    const fieldsRecord = this.fieldsToRecord(fieldsToEncrypt);

    const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
      fieldsRecord,
      uuid
    );

    const saga = await Saga.create({
      uuid,
      titre: encryptedData.titre,
      slug: encryptedData.slug,
      description: encryptedData.description,
      auteur: encryptedData.auteur,
      statut: data.statut || 'brouillon',
      iv,
      tag,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      id: saga.id,
      uuid: saga.uuid,
      titre: fieldsToEncrypt.titre,
      slug: fieldsToEncrypt.slug,
      description: fieldsToEncrypt.description,
      auteur: fieldsToEncrypt.auteur,
      statut: saga.statut,
      createdAt: saga.createdAt,
      updatedAt: saga.updatedAt,
    };
  }

  // Mettre à jour une saga
  public static async updateSaga(id: number, data: Partial<SagaInput>): Promise<SagaOutput | null> {
    const saga = await Saga.findByPk(id);
    
    if (!saga) {
      return null;
    }

    // Déchiffrer les données actuelles
    const currentFieldsToDecrypt = this.getFieldsToDecrypt(saga);
    const currentFieldsRecord = this.fieldsToRecord(currentFieldsToDecrypt);

    const currentDecryptedData = EncryptionService.decryptRowData(
      currentFieldsRecord,
      saga.uuid,
      saga.iv,
      saga.tag
    );

    // Préparer les nouvelles données
    const newData: SagaInput = {
      titre: data.titre || currentDecryptedData.titre,
      description: data.description !== undefined ? data.description : currentDecryptedData.description,
      auteur: data.auteur || currentDecryptedData.auteur,
      statut: data.statut || saga.statut,
    };

    const fieldsToEncrypt = this.getFieldsToEncrypt(newData);
    const fieldsRecord = this.fieldsToRecord(fieldsToEncrypt);

    const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
      fieldsRecord,
      saga.uuid
    );

    // Mettre à jour la saga
    await saga.update({
      titre: encryptedData.titre,
      slug: encryptedData.slug,
      description: encryptedData.description,
      auteur: encryptedData.auteur,
      statut: newData.statut,
      iv,
      tag,
    });

    return {
      id: saga.id,
      uuid: saga.uuid,
      titre: fieldsToEncrypt.titre,
      slug: fieldsToEncrypt.slug,
      description: fieldsToEncrypt.description,
      auteur: fieldsToEncrypt.auteur,
      statut: saga.statut,
      createdAt: saga.createdAt,
      updatedAt: saga.updatedAt,
    };
  }

  // Supprimer une saga
  public static async deleteSaga(id: number): Promise<boolean> {
    const saga = await Saga.findByPk(id);
    
    if (!saga) {
      return false;
    }

    await saga.destroy();
    return true;
  }
} 