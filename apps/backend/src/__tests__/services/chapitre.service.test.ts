import { describe, it, expect, beforeEach, jest, beforeAll } from '@jest/globals';
import { ChapitreService, ChapitreInput, ChapitreOutput } from '../../services/chapitre.service.js';
import { Chapitre } from '../../models/index.js';
import { EncryptionService } from '../../services/encryption.service.js';
import { SlugUtil } from '../../utils/slug.util.js';

// Mock des dépendances
jest.mock('../../models/index.js');
jest.mock('../../services/encryption.service.js');
jest.mock('../../utils/slug.util.js');

const mockChapitre = Chapitre as any;
const mockEncryptionService = EncryptionService as any;
const mockSlugUtil = SlugUtil as any;

describe('ChapitreService', () => {
  const mockChapitreData = {
    id: 1,
    uuid: 'test-uuid-123',
    titre: 'titre_chiffré',
    slug: 'slug_chiffré',
    numero: 1,
    storyId: 1,
    iv: 'test-iv',
    tag: 'test-tag',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDecryptedData = {
    titre: 'Premier Chapitre',
    slug: 'premier-chapitre'
  };

  const mockEncryptedData = {
    encryptedData: {
      titre: 'titre_chiffré',
      slug: 'slug_chiffré'
    },
    iv: 'test-iv',
    tag: 'test-tag'
  };

  beforeAll(() => {
    mockSlugUtil.generateSlug = (jest.fn() as any).mockReturnValue('premier-chapitre');
    mockEncryptionService.decryptRowData = (jest.fn() as any).mockReturnValue(mockDecryptedData);
    mockEncryptionService.encryptRowData = (jest.fn() as any).mockReturnValue(mockEncryptedData);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllChapitres', () => {
    it('doit récupérer tous les chapitres avec données déchiffrées', async () => {
      // Mock des données
      mockChapitre.findAll = (jest.fn() as any).mockResolvedValue([mockChapitreData]);

      // Exécution
      const result = await ChapitreService.getAllChapitres();

      // Vérifications
      expect(mockChapitre.findAll).toHaveBeenCalledWith({
        order: [['numero', 'ASC']],
      });
      expect(mockEncryptionService.decryptRowData).toHaveBeenCalledWith(
        { titre: 'titre_chiffré', slug: 'slug_chiffré' },
        'test-uuid-123',
        'test-iv',
        'test-tag'
      );
      expect(result).toEqual([
        expect.objectContaining({
          id: 1,
          uuid: 'test-uuid-123',
          titre: 'Premier Chapitre',
          slug: 'premier-chapitre',
          numero: 1,
          storyId: 1,
        })
      ]);
    });

    it('doit retourner un tableau vide si aucun chapitre', async () => {
      mockChapitre.findAll = (jest.fn() as any).mockResolvedValue([]);

      const result = await ChapitreService.getAllChapitres();

      expect(result).toEqual([]);
    });
  });

  describe('getChapitreById', () => {
    it('doit récupérer un chapitre par ID avec données déchiffrées', async () => {
      mockChapitre.findByPk = (jest.fn() as any).mockResolvedValue(mockChapitreData);

      const result = await ChapitreService.getChapitreById(1);

      expect(mockChapitre.findByPk).toHaveBeenCalledWith(1);
      expect(mockEncryptionService.decryptRowData).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          titre: 'Premier Chapitre',
          slug: 'premier-chapitre',
        })
      );
    });

    it('doit retourner null si chapitre non trouvé', async () => {
      mockChapitre.findByPk = (jest.fn() as any).mockResolvedValue(null);

      const result = await ChapitreService.getChapitreById(999);

      expect(result).toBeNull();
      expect(mockEncryptionService.decryptRowData).not.toHaveBeenCalled();
    });
  });

  describe('getChapitreByUuid', () => {
    it('doit récupérer un chapitre par UUID', async () => {
      mockChapitre.findOne = (jest.fn() as any).mockResolvedValue(mockChapitreData);

      const result = await ChapitreService.getChapitreByUuid('test-uuid-123');

      expect(mockChapitre.findOne).toHaveBeenCalledWith({ where: { uuid: 'test-uuid-123' } });
      expect(result).toEqual(
        expect.objectContaining({
          uuid: 'test-uuid-123',
          titre: 'Premier Chapitre',
        })
      );
    });

    it('doit retourner null si UUID non trouvé', async () => {
      mockChapitre.findOne = (jest.fn() as any).mockResolvedValue(null);

      const result = await ChapitreService.getChapitreByUuid('inexistant');

      expect(result).toBeNull();
    });
  });

  describe('getChapitreBySlug', () => {
    it('doit récupérer un chapitre par slug', async () => {
      mockChapitre.findAll = (jest.fn() as any).mockResolvedValue([mockChapitreData]);

      const result = await ChapitreService.getChapitreBySlug('premier-chapitre');

      expect(mockChapitre.findAll).toHaveBeenCalled();
      expect(mockEncryptionService.decryptRowData).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          slug: 'premier-chapitre',
        })
      );
    });

    it('doit retourner null si slug non trouvé', async () => {
      mockChapitre.findAll = (jest.fn() as any).mockResolvedValue([]);

      const result = await ChapitreService.getChapitreBySlug('inexistant');

      expect(result).toBeNull();
    });
  });

  describe('getChapitresByStoryId', () => {
    it('doit récupérer tous les chapitres d\'une story', async () => {
      mockChapitre.findAll = (jest.fn() as any).mockResolvedValue([mockChapitreData]);

      const result = await ChapitreService.getChapitresByStoryId(1);

      expect(mockChapitre.findAll).toHaveBeenCalledWith({
        where: { storyId: 1 },
        order: [['numero', 'ASC']],
      });
      expect(result).toEqual([
        expect.objectContaining({
          storyId: 1,
        })
      ]);
    });
  });

  describe('createChapitre', () => {
    it('doit créer un nouveau chapitre avec données chiffrées', async () => {
      const inputData: ChapitreInput = {
        titre: 'Premier Chapitre',
        numero: 1,
        storyId: 1,
      };

      const mockCreatedChapitre = {
        ...mockChapitreData,
        update: (jest.fn() as any).mockResolvedValue(mockChapitreData),
      };

      mockChapitre.create = (jest.fn() as any).mockResolvedValue(mockCreatedChapitre);

      const result = await ChapitreService.createChapitre(inputData);

      expect(mockSlugUtil.generateSlug).toHaveBeenCalledWith('Premier Chapitre');
      expect(mockEncryptionService.encryptRowData).toHaveBeenCalledWith(
        { titre: 'Premier Chapitre', slug: 'premier-chapitre' },
        expect.any(String)
      );
      expect(mockChapitre.create).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          titre: 'Premier Chapitre',
          numero: 1,
          storyId: 1,
        })
      );
    });

    it('doit gérer les erreurs de création', async () => {
      const inputData: ChapitreInput = {
        titre: 'Test',
        numero: 1,
        storyId: 1,
      };

      mockChapitre.create = (jest.fn() as any).mockRejectedValue(new Error('Erreur DB'));

      await expect(ChapitreService.createChapitre(inputData)).rejects.toThrow('Erreur DB');
    });
  });

  describe('updateChapitre', () => {
    it('doit mettre à jour un chapitre existant', async () => {
      const updateData = { titre: 'Titre Modifié' };
      
      const mockUpdatedChapitre = {
        ...mockChapitreData,
        update: (jest.fn() as any).mockResolvedValue(mockChapitreData),
      };

      mockChapitre.findByPk = (jest.fn() as any).mockResolvedValue(mockUpdatedChapitre);

      const result = await ChapitreService.updateChapitre(1, updateData);

      expect(mockChapitre.findByPk).toHaveBeenCalledWith(1);
      expect(mockSlugUtil.generateSlug).toHaveBeenCalledWith('Titre Modifié');
      expect(mockEncryptionService.encryptRowData).toHaveBeenCalled();
      expect(mockUpdatedChapitre.update).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          titre: 'Titre Modifié',
        })
      );
    });

    it('doit retourner null si chapitre à modifier non trouvé', async () => {
      mockChapitre.findByPk = (jest.fn() as any).mockResolvedValue(null);

      const result = await ChapitreService.updateChapitre(999, { titre: 'Test' });

      expect(result).toBeNull();
    });
  });

  describe('deleteChapitre', () => {
    it('doit supprimer un chapitre existant', async () => {
      const mockChapitreToDelete = {
        ...mockChapitreData,
        destroy: (jest.fn() as any).mockResolvedValue(true),
      };

      mockChapitre.findByPk = (jest.fn() as any).mockResolvedValue(mockChapitreToDelete);

      const result = await ChapitreService.deleteChapitre(1);

      expect(mockChapitre.findByPk).toHaveBeenCalledWith(1);
      expect(mockChapitreToDelete.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('doit retourner false si chapitre à supprimer non trouvé', async () => {
      mockChapitre.findByPk = (jest.fn() as any).mockResolvedValue(null);

      const result = await ChapitreService.deleteChapitre(999);

      expect(result).toBe(false);
    });
  });

  describe('getChapitreByIdOrUuidOrSlug', () => {
    it('doit récupérer un chapitre par ID numérique', async () => {
      mockChapitre.findByPk = (jest.fn() as any).mockResolvedValue(mockChapitreData);

      const result = await ChapitreService.getChapitreByIdOrUuidOrSlug(1);

      expect(mockChapitre.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
        })
      );
    });

    it('doit récupérer un chapitre par UUID string', async () => {
      mockChapitre.findOne = (jest.fn() as any).mockResolvedValue(mockChapitreData);

      // Utilise un UUID valide qui matche la regex
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const result = await ChapitreService.getChapitreByIdOrUuidOrSlug(validUuid);

      expect(mockChapitre.findOne).toHaveBeenCalledWith({ where: { uuid: validUuid } });
      expect(result).toEqual(
        expect.objectContaining({
          uuid: 'test-uuid-123',
        })
      );
    });

    it('doit essayer de récupérer par slug si ce n\'est pas un UUID', async () => {
      mockChapitre.findAll = (jest.fn() as any).mockResolvedValue([mockChapitreData]);
      
      // Mock le déchiffrement pour retourner le slug recherché
      mockEncryptionService.decryptRowData = (jest.fn() as any).mockReturnValue({
        titre: 'Premier Chapitre',
        slug: 'mon-slug', // Le slug recherché
      });

      const result = await ChapitreService.getChapitreByIdOrUuidOrSlug('mon-slug');

      expect(mockChapitre.findAll).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          slug: 'mon-slug',
        })
      );
    });
  });

  describe('Tests de chiffrement', () => {
    it('doit gérer les erreurs de déchiffrement', async () => {
      mockChapitre.findByPk = (jest.fn() as any).mockResolvedValue(mockChapitreData);
      mockEncryptionService.decryptRowData = (jest.fn() as any).mockImplementation(() => {
        throw new Error('Erreur de déchiffrement');
      });

      await expect(ChapitreService.getChapitreById(1)).rejects.toThrow('Erreur de déchiffrement');
    });

    it('doit gérer les erreurs de chiffrement lors de la création', async () => {
      const inputData: ChapitreInput = {
        titre: 'Test',
        numero: 1,
        storyId: 1,
      };

      mockEncryptionService.encryptRowData = (jest.fn() as any).mockImplementation(() => {
        throw new Error('Erreur de chiffrement');
      });

      await expect(ChapitreService.createChapitre(inputData)).rejects.toThrow('Erreur de chiffrement');
    });
  });
}); 