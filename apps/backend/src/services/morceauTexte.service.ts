import { v4 as uuidv4 } from 'uuid';
import { MorceauTexte } from '../models/index.js';
import { TypeMorceauTexte } from '../models/morceauTexte.model.js';
import { EncryptionService } from './encryption.service.js';

export interface MorceauTexteInput {
  chapitreId: number;
  chapitreUuid: string;
  type: TypeMorceauTexte;
  contenu: string;
  ordre: number;
}

export interface MorceauTexteOutput {
  id: number;
  uuid: string;
  chapitreId: number;
  chapitreUuid: string;
  type: TypeMorceauTexte;
  contenu: string;
  ordre: number;
  createdAt: Date;
  updatedAt: Date;
}

export class MorceauTexteService {
  // Récupérer tous les morceaux de texte d'un chapitre par ID
  public static async getMorceauxTexteByChapitreId(chapitreId: number): Promise<MorceauTexteOutput[]> {
    const morceaux = await MorceauTexte.findAll({
      where: { chapitreId },
      order: [['ordre', 'ASC']],
    });

    return morceaux.map(morceau => {
      const decryptedData = EncryptionService.decryptRowData(
        { contenu: morceau.contenu },
        morceau.uuid,
        morceau.iv,
        morceau.tag
      );

      return {
        id: morceau.id,
        uuid: morceau.uuid,
        chapitreId: morceau.chapitreId,
        chapitreUuid: morceau.chapitreUuid,
        type: morceau.type,
        contenu: decryptedData.contenu,
        ordre: morceau.ordre,
        createdAt: morceau.createdAt,
        updatedAt: morceau.updatedAt,
      };
    });
  }

  // Récupérer tous les morceaux de texte d'un chapitre par UUID
  public static async getMorceauxTexteByChapitreUuid(chapitreUuid: string): Promise<MorceauTexteOutput[]> {
    const morceaux = await MorceauTexte.findAll({
      where: { chapitreUuid },
      order: [['ordre', 'ASC']],
    });

    return morceaux.map(morceau => {
      const decryptedData = EncryptionService.decryptRowData(
        { contenu: morceau.contenu },
        morceau.uuid,
        morceau.iv,
        morceau.tag
      );

      return {
        id: morceau.id,
        uuid: morceau.uuid,
        chapitreId: morceau.chapitreId,
        chapitreUuid: morceau.chapitreUuid,
        type: morceau.type,
        contenu: decryptedData.contenu,
        ordre: morceau.ordre,
        createdAt: morceau.createdAt,
        updatedAt: morceau.updatedAt,
      };
    });
  }

  // Récupérer un morceau de texte par ID
  public static async getMorceauTexteById(id: number): Promise<MorceauTexteOutput | null> {
    const morceau = await MorceauTexte.findByPk(id);
    
    if (!morceau) {
      return null;
    }

    const decryptedData = EncryptionService.decryptRowData(
      { contenu: morceau.contenu },
      morceau.uuid,
      morceau.iv,
      morceau.tag
    );

    return {
      id: morceau.id,
      uuid: morceau.uuid,
      chapitreId: morceau.chapitreId,
      chapitreUuid: morceau.chapitreUuid,
      type: morceau.type,
      contenu: decryptedData.contenu,
      ordre: morceau.ordre,
      createdAt: morceau.createdAt,
      updatedAt: morceau.updatedAt,
    };
  }

  // Récupérer un morceau de texte par UUID
  public static async getMorceauTexteByUuid(uuid: string): Promise<MorceauTexteOutput | null> {
    const morceau = await MorceauTexte.findOne({ where: { uuid } });
    
    if (!morceau) {
      return null;
    }

    const decryptedData = EncryptionService.decryptRowData(
      { contenu: morceau.contenu },
      morceau.uuid,
      morceau.iv,
      morceau.tag
    );

    return {
      id: morceau.id,
      uuid: morceau.uuid,
      chapitreId: morceau.chapitreId,
      chapitreUuid: morceau.chapitreUuid,
      type: morceau.type,
      contenu: decryptedData.contenu,
      ordre: morceau.ordre,
      createdAt: morceau.createdAt,
      updatedAt: morceau.updatedAt,
    };
  }

  // Créer un nouveau morceau de texte
  public static async createMorceauTexte(data: MorceauTexteInput): Promise<MorceauTexteOutput> {
    const uuid = uuidv4();
    
    const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
      { contenu: data.contenu },
      uuid
    );

    const morceau = await MorceauTexte.create({
      uuid,
      chapitreId: data.chapitreId,
      chapitreUuid: data.chapitreUuid,
      type: data.type,
      contenu: encryptedData.contenu,
      ordre: data.ordre,
      iv,
      tag,
    });

    return {
      id: morceau.id,
      uuid: morceau.uuid,
      chapitreId: morceau.chapitreId,
      chapitreUuid: morceau.chapitreUuid,
      type: morceau.type,
      contenu: data.contenu,
      ordre: morceau.ordre,
      createdAt: morceau.createdAt,
      updatedAt: morceau.updatedAt,
    };
  }

  // Mettre à jour un morceau de texte
  public static async updateMorceauTexte(id: number, data: Partial<MorceauTexteInput>): Promise<MorceauTexteOutput | null> {
    const morceau = await MorceauTexte.findByPk(id);
    
    if (!morceau) {
      return null;
    }

    // Déchiffrer les données actuelles
    const currentDecryptedData = EncryptionService.decryptRowData(
      { contenu: morceau.contenu },
      morceau.uuid,
      morceau.iv,
      morceau.tag
    );

    // Préparer les nouvelles données
    const newContenu = data.contenu || currentDecryptedData.contenu;

    const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
      { contenu: newContenu },
      morceau.uuid
    );

    // Mettre à jour le morceau
    await morceau.update({
      chapitreId: data.chapitreId || morceau.chapitreId,
      chapitreUuid: data.chapitreUuid || morceau.chapitreUuid,
      type: data.type || morceau.type,
      contenu: encryptedData.contenu,
      ordre: data.ordre || morceau.ordre,
      iv,
      tag,
    });

    return {
      id: morceau.id,
      uuid: morceau.uuid,
      chapitreId: morceau.chapitreId,
      chapitreUuid: morceau.chapitreUuid,
      type: morceau.type,
      contenu: newContenu,
      ordre: morceau.ordre,
      createdAt: morceau.createdAt,
      updatedAt: morceau.updatedAt,
    };
  }

  // Supprimer un morceau de texte
  public static async deleteMorceauTexte(id: number): Promise<boolean> {
    const morceau = await MorceauTexte.findByPk(id);
    
    if (!morceau) {
      return false;
    }

    await morceau.destroy();
    return true;
  }
} 