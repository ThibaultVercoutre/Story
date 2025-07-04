import { v4 as uuidv4 } from 'uuid';
import { Chapitre } from '../models/index.js';
import { EncryptionService } from './encryption.service.js';

export interface ChapitreInput {
  titre: string;
  numero: number;
  storyId: string;
}

export interface ChapitreOutput {
  id: string;
  titre: string;
  numero: number;
  storyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ChapitreService {
  // Récupérer tous les chapitres
  public static async getAllChapitres(): Promise<ChapitreOutput[]> {
    const chapitres = await Chapitre.findAll({
      order: [['numero', 'ASC']],
    });

    return chapitres.map(chapitre => {
      const decryptedData = EncryptionService.decryptRowData(
        { titre: chapitre.titre },
        chapitre.id,
        chapitre.iv,
        chapitre.tag
      );

      return {
        id: chapitre.id,
        titre: decryptedData.titre,
        numero: chapitre.numero,
        storyId: chapitre.storyId,
        createdAt: chapitre.createdAt,
        updatedAt: chapitre.updatedAt,
      };
    });
  }

  // Récupérer un chapitre par ID
  public static async getChapitreById(id: string): Promise<ChapitreOutput | null> {
    const chapitre = await Chapitre.findByPk(id);
    
    if (!chapitre) {
      return null;
    }

    const decryptedData = EncryptionService.decryptRowData(
      { titre: chapitre.titre },
      chapitre.id,
      chapitre.iv,
      chapitre.tag
    );

    return {
      id: chapitre.id,
      titre: decryptedData.titre,
      numero: chapitre.numero,
      storyId: chapitre.storyId,
      createdAt: chapitre.createdAt,
      updatedAt: chapitre.updatedAt,
    };
  }

  // Créer un nouveau chapitre
  public static async createChapitre(data: ChapitreInput): Promise<ChapitreOutput> {
    const id = uuidv4();
    
    const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
      { titre: data.titre },
      id
    );

    const chapitre = await Chapitre.create({
      id,
      titre: encryptedData.titre,
      numero: data.numero,
      storyId: data.storyId,
      iv,
      tag,
    });

    return {
      id: chapitre.id,
      titre: data.titre,
      numero: chapitre.numero,
      storyId: chapitre.storyId,
      createdAt: chapitre.createdAt,
      updatedAt: chapitre.updatedAt,
    };
  }

  // Mettre à jour un chapitre
  public static async updateChapitre(id: string, data: Partial<ChapitreInput>): Promise<ChapitreOutput | null> {
    const chapitre = await Chapitre.findByPk(id);
    
    if (!chapitre) {
      return null;
    }

    // Si le titre est modifié, on doit rechiffrer
    if (data.titre) {
      const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
        { titre: data.titre },
        id
      );

      await chapitre.update({
        titre: encryptedData.titre,
        numero: data.numero || chapitre.numero,
        iv,
        tag,
      });

      return {
        id: chapitre.id,
        titre: data.titre,
        numero: data.numero || chapitre.numero,
        storyId: chapitre.storyId,
        createdAt: chapitre.createdAt,
        updatedAt: chapitre.updatedAt,
      };
    } else if (data.numero) {
      // Si seul le numéro change, pas besoin de rechiffrer
      await chapitre.update({
        numero: data.numero,
      });

      const decryptedData = EncryptionService.decryptRowData(
        { titre: chapitre.titre },
        chapitre.id,
        chapitre.iv,
        chapitre.tag
      );

      return {
        id: chapitre.id,
        titre: decryptedData.titre,
        numero: data.numero,
        storyId: chapitre.storyId,
        createdAt: chapitre.createdAt,
        updatedAt: chapitre.updatedAt,
      };
    }

    return null;
  }

  // Supprimer un chapitre
  public static async deleteChapitre(id: string): Promise<boolean> {
    const chapitre = await Chapitre.findByPk(id);
    
    if (!chapitre) {
      return false;
    }

    await chapitre.destroy();
    return true;
  }
} 