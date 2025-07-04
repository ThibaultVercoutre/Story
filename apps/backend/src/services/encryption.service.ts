import crypto from 'crypto';

export class EncryptionService {
  private static getMasterKey(): string {
    const masterKey = process.env.MASTER_KEY;
    if (!masterKey) {
      throw new Error('MASTER_KEY non définie dans les variables d\'environnement');
    }
    return masterKey;
  }

  // Dérive une clé unique par ligne
  private static deriveKey(id: string): Buffer {
    const masterKey = this.getMasterKey();
    return crypto.createHash('shake256', { outputLength: 32 })
      .update(masterKey + id)
      .digest();
  }

  // Chiffre les données pour une ligne
  public static encryptRowData(plainData: Record<string, string>, id: string): {
    encryptedData: Record<string, string>;
    iv: string;
    tag: string;
  } {
    const key = this.deriveKey(id);
    const iv = crypto.randomBytes(12);
    const aad = Buffer.from('row:' + id);
    
    const encryptedData: Record<string, string> = {};
    let tag: Buffer;

    // Chiffre chaque champ avec la même clé, IV et AAD
    for (const [fieldName, plaintext] of Object.entries(plainData)) {
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
      cipher.setAAD(aad);
      
      const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
      ]);
      
      tag = cipher.getAuthTag();
      encryptedData[fieldName] = encrypted.toString('hex');
    }

    return {
      encryptedData,
      iv: iv.toString('hex'),
      tag: tag!.toString('hex')
    };
  }

  // Déchiffre les données d'une ligne
  public static decryptRowData(
    encryptedData: Record<string, string>,
    id: string,
    iv: string,
    tag: string
  ): Record<string, string> {
    const key = this.deriveKey(id);
    const aad = Buffer.from('row:' + id);
    
    const decryptedData: Record<string, string> = {};

    for (const [fieldName, encryptedValue] of Object.entries(encryptedData)) {
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
      decipher.setAAD(aad);
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedValue, 'hex')),
        decipher.final()
      ]);
      
      decryptedData[fieldName] = decrypted.toString('utf8');
    }

    return decryptedData;
  }
} 