import { v4 as uuidv4 } from 'uuid';
import { MorceauTexte } from '../models/index.js';
import { TypeMorceauTexte } from '../models/morceauTexte.model.js';
import { EncryptionService } from './encryption.service.js';

export interface MorceauTexteInput {
  chapitreId: string;
  type: TypeMorceauTexte;
  contenu: string;
  ordre: number;
}

export interface MorceauTexteOutput {
  id: string;
  chapitreId: string;
  type: TypeMorceauTexte;
  contenu: string;
  ordre: number;
  createdAt: Date;
  updatedAt: Date;
}

export class MorceauTexteService {
  // Récupérer tous les morceaux de texte d'un chapitre
  public static async getMorceauxTexteByChapitreId(chapitreId: string): Promise<MorceauTexteOutput[]> {
    const morceaux = await MorceauTexte.findAll({
      where: { chapitreId },
      order: [['ordre', 'ASC']],
    });

    return morceaux.map(morceau => {
      const decryptedData = EncryptionService.decryptRowData(
        { contenu: morceau.contenu },
        morceau.id,
        morceau.iv,
        morceau.tag
      );

      return {
        id: morceau.id,
        chapitreId: morceau.chapitreId,
        type: morceau.type,
        contenu: decryptedData.contenu,
        ordre: morceau.ordre,
        createdAt: morceau.createdAt,
        updatedAt: morceau.updatedAt,
      };
    });
  }

  // Récupérer un morceau de texte par ID
  public static async getMorceauTexteById(id: string): Promise<MorceauTexteOutput | null> {
    const morceau = await MorceauTexte.findByPk(id);
    
    if (!morceau) {
      return null;
    }

    const decryptedData = EncryptionService.decryptRowData(
      { contenu: morceau.contenu },
      morceau.id,
      morceau.iv,
      morceau.tag
    );

    return {
      id: morceau.id,
      chapitreId: morceau.chapitreId,
      type: morceau.type,
      contenu: decryptedData.contenu,
      ordre: morceau.ordre,
      createdAt: morceau.createdAt,
      updatedAt: morceau.updatedAt,
    };
  }

  // Créer un nouveau morceau de texte
  public static async createMorceauTexte(data: MorceauTexteInput): Promise<MorceauTexteOutput> {
    const id = uuidv4();
    
    const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
      { contenu: data.contenu },
      id
    );

    const morceau = await MorceauTexte.create({
      id,
      chapitreId: data.chapitreId,
      type: data.type,
      contenu: encryptedData.contenu,
      ordre: data.ordre,
      iv,
      tag,
    });

    return {
      id: morceau.id,
      chapitreId: morceau.chapitreId,
      type: morceau.type,
      contenu: data.contenu,
      ordre: morceau.ordre,
      createdAt: morceau.createdAt,
      updatedAt: morceau.updatedAt,
    };
  }

  // Mettre à jour un morceau de texte
  public static async updateMorceauTexte(id: string, data: Partial<MorceauTexteInput>): Promise<MorceauTexteOutput | null> {
    const morceau = await MorceauTexte.findByPk(id);
    
    if (!morceau) {
      return null;
    }

    // Si le contenu est modifié, on doit rechiffrer
    if (data.contenu) {
      const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
        { contenu: data.contenu },
        id
      );

      await morceau.update({
        chapitreId: data.chapitreId || morceau.chapitreId,
        type: data.type || morceau.type,
        contenu: encryptedData.contenu,
        ordre: data.ordre || morceau.ordre,
        iv,
        tag,
      });

      return {
        id: morceau.id,
        chapitreId: data.chapitreId || morceau.chapitreId,
        type: data.type || morceau.type,
        contenu: data.contenu,
        ordre: data.ordre || morceau.ordre,
        createdAt: morceau.createdAt,
        updatedAt: morceau.updatedAt,
      };
    } else {
      // Si seuls les autres champs changent, pas besoin de rechiffrer
      await morceau.update({
        chapitreId: data.chapitreId || morceau.chapitreId,
        type: data.type || morceau.type,
        ordre: data.ordre || morceau.ordre,
      });

      const decryptedData = EncryptionService.decryptRowData(
        { contenu: morceau.contenu },
        morceau.id,
        morceau.iv,
        morceau.tag
      );

      return {
        id: morceau.id,
        chapitreId: data.chapitreId || morceau.chapitreId,
        type: data.type || morceau.type,
        contenu: decryptedData.contenu,
        ordre: data.ordre || morceau.ordre,
        createdAt: morceau.createdAt,
        updatedAt: morceau.updatedAt,
      };
    }
  }

  // Supprimer un morceau de texte
  public static async deleteMorceauTexte(id: string): Promise<boolean> {
    const morceau = await MorceauTexte.findByPk(id);
    
    if (!morceau) {
      return false;
    }

    await morceau.destroy();
    return true;
  }
} 