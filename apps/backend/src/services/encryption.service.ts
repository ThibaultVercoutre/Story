import crypto from 'crypto';

export class EncryptionService {
  private static getMasterKey(): string {
    const masterKey = process.env.MASTER_KEY;
    if (!masterKey) {
      throw new Error('MASTER_KEY non définie dans les variables d\'environnement');
    }
    return masterKey;
  }

  // Dérive une clé unique par ligne en utilisant l'UUID
  private static deriveKey(uuid: string): Buffer {
    const masterKey = this.getMasterKey();
    return crypto.createHash('shake256', { outputLength: 32 })
      .update(masterKey + uuid)
      .digest();
  }

  // Chiffre les données pour une ligne
  public static encryptRowData(plainData: Record<string, string>, uuid: string): {
    encryptedData: Record<string, string>;
    iv: string;
    tag: string;
  } {
    const key = this.deriveKey(uuid);
    const encryptedData: Record<string, string> = {};
    const ivParts: string[] = [];
    const tagParts: string[] = [];

    // Utiliser un ordre de clés stable pour garantir l'alignement iv/tag <-> champ
    const sortedEntries = Object.entries(plainData).sort(([a], [b]) => a.localeCompare(b));

    for (const [fieldName, value] of sortedEntries) {
      // Clé unique par champ
      const fieldKey = crypto.createHash('sha256').update(key.toString('hex') + fieldName).digest();
      const ivField = crypto.randomBytes(12); // AES-GCM IV 12 bytes
      const cipher = crypto.createCipheriv('aes-256-gcm', fieldKey, ivField);
      cipher.setAAD(Buffer.from('field:' + uuid + ':' + fieldName));

      const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
      const fieldTag = cipher.getAuthTag();

      encryptedData[fieldName] = encrypted.toString('hex');
      ivParts.push(ivField.toString('hex'));
      tagParts.push(fieldTag.toString('hex'));
    }

    return {
      encryptedData,
      iv: ivParts.join(':'),
      tag: tagParts.join(':'),
    };
  }

  // Déchiffre les données d'une ligne
  public static decryptRowData(
    encryptedData: Record<string, string>,
    uuid: string,
    iv: string,
    tag: string
  ): Record<string, string> {
    const key = this.deriveKey(uuid);

    const ivParts = iv.split(':');
    const tagParts = tag.split(':');

    // Assurer la cohérence de l'ordre des champs (alphabétique)
    const sortedEncryptedEntries = Object.entries(encryptedData).sort(([a], [b]) => a.localeCompare(b));

    if (ivParts.length !== sortedEncryptedEntries.length || tagParts.length !== sortedEncryptedEntries.length) {
      throw new Error('Désalignement entre iv/tag et données chiffrées');
    }

    const decryptedData: Record<string, string> = {};

    for (let idx = 0; idx < sortedEncryptedEntries.length; idx++) {
      const [fieldName, encryptedValue] = sortedEncryptedEntries[idx];
      const ivField = Buffer.from(ivParts[idx], 'hex');
      const tagField = Buffer.from(tagParts[idx], 'hex');

      const fieldKey = crypto.createHash('sha256').update(key.toString('hex') + fieldName).digest();
      const decipher = crypto.createDecipheriv('aes-256-gcm', fieldKey, ivField);
      decipher.setAAD(Buffer.from('field:' + uuid + ':' + fieldName));
      decipher.setAuthTag(tagField);

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedValue, 'hex')),
        decipher.final()
      ]);

      decryptedData[fieldName] = decrypted.toString('utf8');
    }

    return decryptedData;
  }
} 