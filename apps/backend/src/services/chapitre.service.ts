import { v4 as uuidv4 } from 'uuid';
import { Chapitre } from '../models/index.js';
import { EncryptionService } from './encryption.service.js';

export interface ChapitreInput {
  titre: string;
  numero: number;
  storyId: number;
  storyUuid: string;
}

export interface ChapitreOutput {
  id: number;
  uuid: string;
  titre: string;
  slug: string;
  numero: number;
  storyId: number;
  storyUuid: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ChapitreService {
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

  // Récupérer tous les chapitres
  public static async getAllChapitres(): Promise<ChapitreOutput[]> {
    const chapitres = await Chapitre.findAll({
      order: [['numero', 'ASC']],
    });

    return chapitres.map(chapitre => {
      const decryptedData = EncryptionService.decryptRowData(
        { titre: chapitre.titre, slug: chapitre.slug },
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
        storyUuid: chapitre.storyUuid,
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

    const decryptedData = EncryptionService.decryptRowData(
      { titre: chapitre.titre, slug: chapitre.slug },
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
      storyUuid: chapitre.storyUuid,
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

    const decryptedData = EncryptionService.decryptRowData(
      { titre: chapitre.titre, slug: chapitre.slug },
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
      storyUuid: chapitre.storyUuid,
      createdAt: chapitre.createdAt,
      updatedAt: chapitre.updatedAt,
    };
  }

  // Récupérer un chapitre par slug
  public static async getChapitreBySlug(slug: string): Promise<ChapitreOutput | null> {
    const chapitres = await Chapitre.findAll();
    
    for (const chapitre of chapitres) {
      try {
        const decryptedData = EncryptionService.decryptRowData(
          { titre: chapitre.titre, slug: chapitre.slug },
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
            storyUuid: chapitre.storyUuid,
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
      const decryptedData = EncryptionService.decryptRowData(
        { titre: chapitre.titre, slug: chapitre.slug },
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
        storyUuid: chapitre.storyUuid,
        createdAt: chapitre.createdAt,
        updatedAt: chapitre.updatedAt,
      };
    });
  }

  // Récupérer les chapitres d'une story par UUID
  public static async getChapitresByStoryUuid(storyUuid: string): Promise<ChapitreOutput[]> {
    const chapitres = await Chapitre.findAll({
      where: { storyUuid },
      order: [['numero', 'ASC']],
    });

    return chapitres.map(chapitre => {
      const decryptedData = EncryptionService.decryptRowData(
        { titre: chapitre.titre, slug: chapitre.slug },
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
        storyUuid: chapitre.storyUuid,
        createdAt: chapitre.createdAt,
        updatedAt: chapitre.updatedAt,
      };
    });
  }

  // Créer un nouveau chapitre
  public static async createChapitre(data: ChapitreInput): Promise<ChapitreOutput> {
    const uuid = uuidv4();
    const slug = this.generateSlug(data.titre);
    
    const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
      { titre: data.titre, slug },
      uuid
    );

    const chapitre = await Chapitre.create({
      uuid,
      titre: encryptedData.titre,
      slug: encryptedData.slug,
      numero: data.numero,
      storyId: data.storyId,
      storyUuid: data.storyUuid,
      iv,
      tag,
    });

    return {
      id: chapitre.id,
      uuid: chapitre.uuid,
      titre: data.titre,
      slug,
      numero: chapitre.numero,
      storyId: chapitre.storyId,
      storyUuid: chapitre.storyUuid,
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
    const currentDecryptedData = EncryptionService.decryptRowData(
      { titre: chapitre.titre, slug: chapitre.slug },
      chapitre.uuid,
      chapitre.iv,
      chapitre.tag
    );

    // Préparer les nouvelles données
    const newTitre = data.titre || currentDecryptedData.titre;
    const newSlug = data.titre ? this.generateSlug(data.titre) : currentDecryptedData.slug;

    const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
      { titre: newTitre, slug: newSlug },
      chapitre.uuid
    );

    // Mettre à jour le chapitre
    await chapitre.update({
      titre: encryptedData.titre,
      slug: encryptedData.slug,
      numero: data.numero || chapitre.numero,
      storyId: data.storyId || chapitre.storyId,
      storyUuid: data.storyUuid || chapitre.storyUuid,
      iv,
      tag,
    });

    return {
      id: chapitre.id,
      uuid: chapitre.uuid,
      titre: newTitre,
      slug: newSlug,
      numero: chapitre.numero,
      storyId: chapitre.storyId,
      storyUuid: chapitre.storyUuid,
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