import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { MorceauTexte } from '../models/index.js';
import { TypeMorceauTexte } from '../models/morceauTexte.model.js';
import { EncryptionService } from './encryption.service.js';

export interface MorceauTexteInput {
  chapitreId: number;
  type: TypeMorceauTexte;
  contenu: string;
  ordre: number;
}

export interface MorceauTexteOutput {
  id: number;
  uuid: string;
  chapitreId: number;
  type: TypeMorceauTexte;
  contenu: string;
  ordre: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour les champs chiffrés de MorceauTexte
interface MorceauTexteEncryptedFields {
  contenu: string;
}

export class MorceauTexteService {
  // Configuration centralisée des champs chiffrés
  private static readonly ENCRYPTED_FIELDS_CONFIG = {
    contenu: {
      fromInput: (data: MorceauTexteInput) => data.contenu,
      fromModel: (model: MorceauTexte) => model.contenu
    }
  } as const;

  // Fonction générique pour extraire les champs à déchiffrer depuis le modèle
  private static getFieldsToDecrypt(morceau: MorceauTexte): MorceauTexteEncryptedFields {
    const fields = {} as MorceauTexteEncryptedFields;
    
    for (const [key, config] of Object.entries(this.ENCRYPTED_FIELDS_CONFIG)) {
      const value = config.fromModel(morceau);
      if (value !== undefined) {
        (fields as any)[key] = value;
      }
    }
    
    return fields;
  }

  // Fonction générique pour extraire les champs à chiffrer depuis les données d'entrée
  private static getFieldsToEncrypt(data: MorceauTexteInput): MorceauTexteEncryptedFields {
    const fields = {} as MorceauTexteEncryptedFields;
    
    for (const [key, config] of Object.entries(this.ENCRYPTED_FIELDS_CONFIG)) {
      const value = config.fromInput(data);
      if (value !== undefined) {
        (fields as any)[key] = value;
      }
    }
    
    return fields;
  }

  // Fonction utilitaire pour convertir les champs chiffrés vers Record<string, string>
  private static fieldsToRecord(fields: MorceauTexteEncryptedFields): Record<string, string> {
    const record: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        record[key] = value;
      }
    }
    
    return record;
  }

  // Récupérer tous les morceaux de texte d'un chapitre par ID
  public static async getMorceauxTexteByChapitreId(chapitreId: number): Promise<MorceauTexteOutput[]> {
    const morceaux = await MorceauTexte.findAll({
      where: { chapitreId },
      order: [['ordre', 'ASC']],
    });

    return morceaux.map(morceau => {
      const fieldsToDecrypt = this.getFieldsToDecrypt(morceau);
      const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

      const decryptedData = EncryptionService.decryptRowData(
        fieldsRecord,
        morceau.uuid,
        morceau.iv,
        morceau.tag
      );

      return {
        id: morceau.id,
        uuid: morceau.uuid,
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
  public static async getMorceauTexteById(id: number): Promise<MorceauTexteOutput | null> {
    const morceau = await MorceauTexte.findByPk(id);
    
    if (!morceau) {
      return null;
    }

    const fieldsToDecrypt = this.getFieldsToDecrypt(morceau);
    const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

    const decryptedData = EncryptionService.decryptRowData(
      fieldsRecord,
      morceau.uuid,
      morceau.iv,
      morceau.tag
    );

    return {
      id: morceau.id,
      uuid: morceau.uuid,
      chapitreId: morceau.chapitreId,
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

    const fieldsToDecrypt = this.getFieldsToDecrypt(morceau);
    const fieldsRecord = this.fieldsToRecord(fieldsToDecrypt);

    const decryptedData = EncryptionService.decryptRowData(
      fieldsRecord,
      morceau.uuid,
      morceau.iv,
      morceau.tag
    );

    return {
      id: morceau.id,
      uuid: morceau.uuid,
      chapitreId: morceau.chapitreId,
      type: morceau.type,
      contenu: decryptedData.contenu,
      ordre: morceau.ordre,
      createdAt: morceau.createdAt,
      updatedAt: morceau.updatedAt,
    };
  }

  // Décaler les ordres vers le haut pour faire de la place (avec gestion de la contrainte unique)
  private static async shiftOrdersUp(chapitreId: number, fromOrder: number, transaction?: any): Promise<void> {
    // Utiliser des valeurs temporaires très élevées pour éviter les conflits d'unicité
    const morceauxToShift = await MorceauTexte.findAll({
      where: {
        chapitreId,
        ordre: { [Op.gte]: fromOrder }
      },
      order: [['ordre', 'DESC']], // Commencer par les ordres les plus élevés
      transaction
    });

    // Première passe : mettre des valeurs temporaires très élevées (évite validation min: 1)
    for (const morceau of morceauxToShift) {
      const tempOrder = morceau.ordre + 10000; // Valeurs temporaires élevées
      await morceau.update({ ordre: tempOrder }, { transaction });
    }

    // Deuxième passe : remettre les bonnes valeurs décalées
    for (const morceau of morceauxToShift) {
      const newOrder = morceau.ordre - 10000 + 1; // Décaler de +1
      await morceau.update({ ordre: newOrder }, { transaction });
    }
  }

  // Décaler les ordres vers le bas pour combler un trou (avec gestion de la contrainte unique)
  private static async shiftOrdersDown(chapitreId: number, fromOrder: number, transaction?: any): Promise<void> {
    // Utiliser des valeurs temporaires très élevées pour éviter les conflits d'unicité
    const morceauxToShift = await MorceauTexte.findAll({
      where: {
        chapitreId,
        ordre: { [Op.gt]: fromOrder }
      },
      order: [['ordre', 'ASC']], // Commencer par les ordres les plus bas
      transaction
    });

    // Première passe : mettre des valeurs temporaires très élevées (évite validation min: 1)
    for (const morceau of morceauxToShift) {
      const tempOrder = morceau.ordre + 10000; // Valeurs temporaires élevées
      await morceau.update({ ordre: tempOrder }, { transaction });
    }

    // Deuxième passe : remettre les bonnes valeurs décalées
    for (const morceau of morceauxToShift) {
      const newOrder = morceau.ordre - 10000 - 1; // Décaler de -1
      await morceau.update({ ordre: newOrder }, { transaction });
    }
  }

  // Créer un nouveau morceau de texte avec gestion automatique des ordres
  public static async createMorceauTexte(data: MorceauTexteInput): Promise<MorceauTexteOutput> {
    // Utiliser une transaction pour s'assurer de la cohérence
    const transaction = await MorceauTexte.sequelize!.transaction();
    
    try {
      // Décaler tous les morceaux avec un ordre >= à l'ordre d'insertion
      await this.shiftOrdersUp(data.chapitreId, data.ordre, transaction);

      const uuid = uuidv4();
      const fieldsToEncrypt = this.getFieldsToEncrypt(data);
      const fieldsRecord = this.fieldsToRecord(fieldsToEncrypt);
      
      const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
        fieldsRecord,
        uuid
      );

      const morceau = await MorceauTexte.create({
        uuid,
        chapitreId: data.chapitreId,
        type: data.type,
        contenu: encryptedData.contenu,
        ordre: data.ordre,
        iv,
        tag,
      }, { transaction });

      await transaction.commit();

      return {
        id: morceau.id,
        uuid: morceau.uuid,
        chapitreId: morceau.chapitreId,
        type: morceau.type,
        contenu: fieldsToEncrypt.contenu,
        ordre: morceau.ordre,
        createdAt: morceau.createdAt,
        updatedAt: morceau.updatedAt,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Mettre à jour un morceau de texte
  public static async updateMorceauTexte(id: number, data: Partial<MorceauTexteInput>): Promise<MorceauTexteOutput | null> {
    const morceau = await MorceauTexte.findByPk(id);
    
    if (!morceau) {
      return null;
    }

    // Déchiffrer les données actuelles
    const currentFieldsToDecrypt = this.getFieldsToDecrypt(morceau);
    const currentFieldsRecord = this.fieldsToRecord(currentFieldsToDecrypt);

    const currentDecryptedData = EncryptionService.decryptRowData(
      currentFieldsRecord,
      morceau.uuid,
      morceau.iv,
      morceau.tag
    );

    // Préparer les nouvelles données
    const newData: MorceauTexteInput = {
      chapitreId: data.chapitreId || morceau.chapitreId,
      type: data.type || morceau.type,
      contenu: data.contenu || currentDecryptedData.contenu,
      ordre: data.ordre || morceau.ordre
    };

    const fieldsToEncrypt = this.getFieldsToEncrypt(newData);
    const fieldsRecord = this.fieldsToRecord(fieldsToEncrypt);

    const { encryptedData, iv, tag } = EncryptionService.encryptRowData(
      fieldsRecord,
      morceau.uuid
    );

    // Mettre à jour le morceau
    await morceau.update({
      chapitreId: newData.chapitreId,
      type: newData.type,
      contenu: encryptedData.contenu,
      ordre: newData.ordre,
      iv,
      tag,
    });

    return {
      id: morceau.id,
      uuid: morceau.uuid,
      chapitreId: morceau.chapitreId,
      type: morceau.type,
      contenu: fieldsToEncrypt.contenu,
      ordre: morceau.ordre,
      createdAt: morceau.createdAt,
      updatedAt: morceau.updatedAt,
    };
  }

  // Supprimer un morceau de texte avec gestion automatique des ordres
  public static async deleteMorceauTexte(id: number): Promise<boolean> {
    // Utiliser une transaction pour s'assurer de la cohérence
    const transaction = await MorceauTexte.sequelize!.transaction();
    
    try {
      const morceau = await MorceauTexte.findByPk(id, { transaction });
      
      if (!morceau) {
        await transaction.rollback();
        return false;
      }

      const chapitreId = morceau.chapitreId;
      const ordre = morceau.ordre;

      // Supprimer le morceau
      await morceau.destroy({ transaction });

      // Décaler tous les morceaux suivants vers le bas
      await this.shiftOrdersDown(chapitreId, ordre, transaction);

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
} 