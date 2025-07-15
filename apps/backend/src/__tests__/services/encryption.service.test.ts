import { EncryptionService } from '../../services/encryption.service.js';

describe('EncryptionService', () => {
  const testUuid = 'test-uuid-12345';
  const testData = {
    email: 'test@example.com',
    nom: 'Test User',
    description: 'Une description test avec des caractères spéciaux: éàç',
  };

  beforeEach(() => {
    // S'assurer que MASTER_KEY est définie
    process.env.MASTER_KEY = 'test-master-key-for-encryption-service-testing-only';
  });

  describe('encryptRowData', () => {
    it('devrait chiffrer les données correctement', () => {
      const result = EncryptionService.encryptRowData(testData, testUuid);

      expect(result).toHaveProperty('encryptedData');
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('tag');
      
      // Vérifier que les données sont chiffrées
      expect(result.encryptedData.email).not.toBe(testData.email);
      expect(result.encryptedData.nom).not.toBe(testData.nom);
      expect(result.encryptedData.description).not.toBe(testData.description);
      
      // Vérifier que les données chiffrées sont en format hexadécimal
      expect(result.encryptedData.email).toMatch(/^[0-9a-f]+$/);
      expect(result.encryptedData.nom).toMatch(/^[0-9a-f]+$/);
      expect(result.encryptedData.description).toMatch(/^[0-9a-f]+$/);
      
      // Vérifier la structure des iv et tags
      expect(result.iv.split(':')).toHaveLength(3);
      expect(result.tag.split(':')).toHaveLength(3);
    });

    it('devrait produire des résultats différents pour des UUIDs différents', () => {
      const result1 = EncryptionService.encryptRowData(testData, testUuid);
      const result2 = EncryptionService.encryptRowData(testData, 'different-uuid');

      expect(result1.encryptedData.email).not.toBe(result2.encryptedData.email);
      expect(result1.encryptedData.nom).not.toBe(result2.encryptedData.nom);
    });

    it('devrait produire des résultats différents pour des données différentes', () => {
      const differentData = {
        email: 'different@example.com',
        nom: 'Different User',
        description: 'Different description',
      };

      const result1 = EncryptionService.encryptRowData(testData, testUuid);
      const result2 = EncryptionService.encryptRowData(differentData, testUuid);

      expect(result1.encryptedData.email).not.toBe(result2.encryptedData.email);
      expect(result1.encryptedData.nom).not.toBe(result2.encryptedData.nom);
    });

    it('devrait gérer les champs avec des valeurs vides', () => {
      const dataWithEmpty = {
        email: '',
        nom: 'Test User',
        description: '',
      };

      const result = EncryptionService.encryptRowData(dataWithEmpty, testUuid);

      expect(result.encryptedData.email).toBeDefined();
      expect(result.encryptedData.nom).toBeDefined();
      expect(result.encryptedData.description).toBeDefined();
    });
  });

  describe('decryptRowData', () => {
    it('devrait déchiffrer les données correctement', () => {
      const encrypted = EncryptionService.encryptRowData(testData, testUuid);
      const decrypted = EncryptionService.decryptRowData(
        encrypted.encryptedData,
        testUuid,
        encrypted.iv,
        encrypted.tag
      );

      expect(decrypted.email).toBe(testData.email);
      expect(decrypted.nom).toBe(testData.nom);
      expect(decrypted.description).toBe(testData.description);
    });

    it('devrait préserver les caractères spéciaux', () => {
      const specialData = {
        text: 'Texte avec accents: éàçùî et symboles: @#$%^&*()',
        emoji: '🎉🚀✨',
        unicode: 'Unicode: ñáéíóú',
      };

      const encrypted = EncryptionService.encryptRowData(specialData, testUuid);
      const decrypted = EncryptionService.decryptRowData(
        encrypted.encryptedData,
        testUuid,
        encrypted.iv,
        encrypted.tag
      );

      expect(decrypted.text).toBe(specialData.text);
      expect(decrypted.emoji).toBe(specialData.emoji);
      expect(decrypted.unicode).toBe(specialData.unicode);
    });

    it('devrait échouer avec un UUID différent', () => {
      const encrypted = EncryptionService.encryptRowData(testData, testUuid);
      
      expect(() => {
        EncryptionService.decryptRowData(
          encrypted.encryptedData,
          'different-uuid',
          encrypted.iv,
          encrypted.tag
        );
      }).toThrow();
    });

    it('devrait échouer avec un IV corrompu', () => {
      const encrypted = EncryptionService.encryptRowData(testData, testUuid);
      
      expect(() => {
        EncryptionService.decryptRowData(
          encrypted.encryptedData,
          testUuid,
          'corrupted-iv',
          encrypted.tag
        );
      }).toThrow();
    });

    it('devrait échouer avec un tag corrompu', () => {
      const encrypted = EncryptionService.encryptRowData(testData, testUuid);
      
      expect(() => {
        EncryptionService.decryptRowData(
          encrypted.encryptedData,
          testUuid,
          encrypted.iv,
          'corrupted-tag'
        );
      }).toThrow();
    });

    it('devrait échouer avec des données chiffrées corrompues', () => {
      const encrypted = EncryptionService.encryptRowData(testData, testUuid);
      const corruptedData = {
        ...encrypted.encryptedData,
        email: 'corrupted-data',
      };
      
      expect(() => {
        EncryptionService.decryptRowData(
          corruptedData,
          testUuid,
          encrypted.iv,
          encrypted.tag
        );
      }).toThrow();
    });

    it('devrait échouer avec un désalignement iv/tag', () => {
      const encrypted = EncryptionService.encryptRowData(testData, testUuid);
      
      expect(() => {
        EncryptionService.decryptRowData(
          encrypted.encryptedData,
          testUuid,
          encrypted.iv + ':extra-iv',
          encrypted.tag
        );
      }).toThrow('Désalignement entre iv/tag et données chiffrées');
    });
  });

  describe('Ordre des champs', () => {
    it('devrait maintenir la cohérence avec des ordres de champs différents', () => {
      const data1 = { a: 'valeur1', b: 'valeur2', c: 'valeur3' };
      const data2 = { c: 'valeur3', a: 'valeur1', b: 'valeur2' };

      const encrypted1 = EncryptionService.encryptRowData(data1, testUuid);
      const encrypted2 = EncryptionService.encryptRowData(data2, testUuid);

      // Déchiffrer pour vérifier que les données sont identiques
      const decrypted1 = EncryptionService.decryptRowData(
        encrypted1.encryptedData,
        testUuid,
        encrypted1.iv,
        encrypted1.tag
      );
      const decrypted2 = EncryptionService.decryptRowData(
        encrypted2.encryptedData,
        testUuid,
        encrypted2.iv,
        encrypted2.tag
      );

      expect(decrypted1.a).toBe(decrypted2.a);
      expect(decrypted1.b).toBe(decrypted2.b);
      expect(decrypted1.c).toBe(decrypted2.c);
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait échouer si MASTER_KEY n\'est pas définie', () => {
      const originalMasterKey = process.env.MASTER_KEY;
      delete process.env.MASTER_KEY;

      expect(() => {
        EncryptionService.encryptRowData(testData, testUuid);
      }).toThrow('MASTER_KEY non définie dans les variables d\'environnement');

      process.env.MASTER_KEY = originalMasterKey;
    });
  });

  describe('Propriétés de sécurité', () => {
    it('devrait produire des résultats différents à chaque chiffrement (IV aléatoire)', () => {
      const result1 = EncryptionService.encryptRowData(testData, testUuid);
      const result2 = EncryptionService.encryptRowData(testData, testUuid);

      // Même si les données et UUID sont identiques, les IV doivent être différents
      expect(result1.iv).not.toBe(result2.iv);
      expect(result1.tag).not.toBe(result2.tag);
      expect(result1.encryptedData.email).not.toBe(result2.encryptedData.email);
    });

    it('devrait utiliser des clés différentes pour chaque champ', () => {
      const singleFieldData1 = { email: 'same-value' };
      const singleFieldData2 = { nom: 'same-value' };

      const encrypted1 = EncryptionService.encryptRowData(singleFieldData1, testUuid);
      const encrypted2 = EncryptionService.encryptRowData(singleFieldData2, testUuid);

      // Même valeur mais champs différents = chiffrement différent
      expect(encrypted1.encryptedData.email).not.toBe(encrypted2.encryptedData.nom);
    });
  });
}); 