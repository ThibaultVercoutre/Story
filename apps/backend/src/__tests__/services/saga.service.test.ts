import { describe, it, expect, beforeEach, jest, beforeAll } from '@jest/globals';
import { SagaService, SagaInput, SagaOutput } from '../../services/saga.service.js';
import { Saga } from '../../models/index.js';
import { EncryptionService } from '../../services/encryption.service.js';
import { SlugUtil } from '../../utils/slug.util.js';

// Mock des dépendances
jest.mock('../../models/index.js');
jest.mock('../../services/encryption.service.js');
jest.mock('../../utils/slug.util.js');

const mockSaga = Saga as jest.MockedClass<typeof Saga>;
const mockEncryptionService = EncryptionService as jest.MockedClass<typeof EncryptionService>;
const mockSlugUtil = SlugUtil as jest.MockedClass<typeof SlugUtil>;

describe('SagaService', () => {
  const mockSagaData = {
    id: 1,
    uuid: 'test-uuid-123',
    titre: 'titre_chiffré',
    slug: 'slug_chiffré',
    description: 'description_chiffrée',
    auteur: 'auteur_chiffré',
    userId: 1,
    statut: 'brouillon' as const,
    iv: 'test-iv',
    tag: 'test-tag',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDecryptedData = {
    titre: 'Ma Grande Saga',
    slug: 'ma-grande-saga',
    description: 'Une saga épique',
    auteur: 'Jean Écrivain'
  };

  const mockEncryptedResult = {
    encryptedData: {
      titre: 'titre_chiffré',
      slug: 'slug_chiffré',
      description: 'description_chiffrée',
      auteur: 'auteur_chiffré',
    },
    iv: 'test-iv',
    tag: 'test-tag'
  };

  beforeAll(() => {
    mockSlugUtil.generateSlug = jest.fn().mockReturnValue('ma-grande-saga') as never;
    mockEncryptionService.decryptRowData = jest.fn().mockReturnValue(mockDecryptedData) as never;
    mockEncryptionService.encryptRowData = jest.fn().mockReturnValue(mockEncryptedResult) as never;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSagas', () => {
    it('doit récupérer toutes les sagas avec données déchiffrées', async () => {
      // @ts-expect-error Mock type incompatibility
      (mockSaga.findAll as any) = jest.fn().mockResolvedValue([mockSagaData] as any);

      const result = await SagaService.getAllSagas();

      expect(mockSaga.findAll).toHaveBeenCalledWith({
        order: [['createdAt', 'DESC']],
      });
      expect(result).toEqual([
        expect.objectContaining({
          id: 1,
          titre: 'Ma Grande Saga',
          slug: 'ma-grande-saga',
          description: 'Une saga épique',
          auteur: 'Jean Écrivain',
          statut: 'brouillon',
        })
      ]);
    });

    it('doit retourner un tableau vide si aucune saga', async () => {
      // @ts-expect-error Mock type incompatibility
      mockSaga.findAll = jest.fn().mockResolvedValue([]);

      const result = await SagaService.getAllSagas();

      expect(result).toEqual([]);
    });
  });

  describe('getSagaById', () => {
    it('doit récupérer une saga par ID avec données déchiffrées', async () => {
      // @ts-expect-error Mock type incompatibility
      mockSaga.findByPk = jest.fn().mockResolvedValue(mockSagaData);

      const result = await SagaService.getSagaById(1);

      expect(mockSaga.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          titre: 'Ma Grande Saga',
          slug: 'ma-grande-saga',
        })
      );
    });

    it('doit retourner null si saga non trouvée', async () => {
      // @ts-expect-error Mock type incompatibility
      mockSaga.findByPk = jest.fn().mockResolvedValue(null);

      const result = await SagaService.getSagaById(999);

      expect(result).toBeNull();
    });
  });

  describe('createSaga', () => {
    it('doit créer une nouvelle saga avec données chiffrées', async () => {
      const inputData: SagaInput = {
        titre: 'Ma Grande Saga',
        description: 'Une saga épique',
        auteur: 'Jean Écrivain',
        userId: 1,
        statut: 'brouillon',
      };

      const mockCreatedSaga = {
        ...mockSagaData,
        // @ts-expect-error Mock type incompatibility
        update: jest.fn().mockResolvedValue(mockSagaData),
      };

      // @ts-expect-error Mock type incompatibility
      mockSaga.create = jest.fn().mockResolvedValue(mockCreatedSaga);

      const result = await SagaService.createSaga(inputData);

      expect(mockSlugUtil.generateSlug).toHaveBeenCalledWith('Ma Grande Saga');
      expect(mockEncryptionService.encryptRowData).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          titre: 'Ma Grande Saga',
          auteur: 'Jean Écrivain',
          userId: 1,
          statut: 'brouillon',
        })
      );
    });
  });

  describe('Tests des statuts', () => {
    const statuts = ['brouillon', 'en_cours', 'terminee', 'publiee'] as const;

    statuts.forEach(statut => {
      it(`doit gérer le statut ${statut}`, async () => {
        const sagaWithStatus = { ...mockSagaData, statut };
        // @ts-expect-error Mock type incompatibility
        mockSaga.findAll = jest.fn().mockResolvedValue([sagaWithStatus]);

        const result = await SagaService.getSagasByStatut(statut);

        expect(mockSaga.findAll).toHaveBeenCalledWith({
          where: { statut },
          order: [['createdAt', 'DESC']],
        });
        expect(result[0]).toEqual(
          expect.objectContaining({
            statut,
          })
        );
      });
    });
  });

  describe('Tests de recherche', () => {
    it('doit rechercher par auteur', async () => {
      // @ts-expect-error Mock type incompatibility
      mockSaga.findAll = jest.fn().mockResolvedValue([mockSagaData]);

      const result = await SagaService.getSagasByAuteur('Jean Écrivain');

      expect(result).toEqual([
        expect.objectContaining({
          auteur: 'Jean Écrivain',
        })
      ]);
    });

    it('doit rechercher par userId', async () => {
      // @ts-expect-error Mock type incompatibility
      mockSaga.findAll = jest.fn().mockResolvedValue([mockSagaData]);

      const result = await SagaService.getSagasByUserId(1);

      expect(mockSaga.findAll).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: [['createdAt', 'DESC']],
      });
      expect(result[0]).toEqual(
        expect.objectContaining({
          userId: 1,
        })
      );
    });
  });

  describe('Tests de chiffrement', () => {
    it('doit gérer les erreurs de déchiffrement', async () => {
      // @ts-expect-error Mock type incompatibility
      mockSaga.findByPk = jest.fn().mockResolvedValue(mockSagaData);
      // @ts-expect-error Mock type incompatibility
      mockEncryptionService.decryptRowData = jest.fn().mockImplementation(() => {
        throw new Error('Erreur de déchiffrement');
      });

      await expect(SagaService.getSagaById(1)).rejects.toThrow('Erreur de déchiffrement');
    });

    it('doit gérer les erreurs de chiffrement lors de la création', async () => {
      const inputData: SagaInput = {
        titre: 'Test',
        auteur: 'Test',
        userId: 1,
      };

      // @ts-expect-error Mock type incompatibility
      mockEncryptionService.encryptRowData = jest.fn().mockImplementation(() => {
        throw new Error('Erreur de chiffrement');
      });

      await expect(SagaService.createSaga(inputData)).rejects.toThrow('Erreur de chiffrement');
    });
  });
}); 