import { StoryService, StoryInput } from '../../services/story.service.js';
import { EncryptionService } from '../../services/encryption.service.js';
import { SlugUtil } from '../../utils/slug.util.js';
import Story from '../../models/story.model.js';

// Mock des dépendances
jest.mock('../../models/story.model.js');
jest.mock('../../services/encryption.service.js');
jest.mock('../../utils/slug.util.js');

const MockedStory = Story as jest.Mocked<typeof Story>;
const MockedEncryptionService = EncryptionService as jest.Mocked<typeof EncryptionService>;
const MockedSlugUtil = SlugUtil as jest.Mocked<typeof SlugUtil>;

describe('StoryService', () => {
  const mockStoryData: StoryInput = {
    titre: 'Test Story',
    description: 'Une histoire de test',
    auteur: 'Test Author',
    statut: 'brouillon',
    userId: 1,
    sagaId: 1,
  };

  const mockEncryptedData = {
    encryptedData: {
      titre: 'encrypted-titre',
      slug: 'encrypted-slug',
      description: 'encrypted-description',
      auteur: 'encrypted-auteur',
    },
    iv: 'mock-iv',
    tag: 'mock-tag',
  };

  const mockStoryModel = {
    id: 1,
    uuid: 'test-uuid-123',
    titre: 'encrypted-titre',
    slug: 'encrypted-slug',
    description: 'encrypted-description',
    auteur: 'encrypted-auteur',
    statut: 'brouillon' as const,
    userId: 1,
    sagaId: 1,
    iv: 'mock-iv',
    tag: 'mock-tag',
    createdAt: new Date(),
    updatedAt: new Date(),
    update: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MASTER_KEY = 'test-master-key';
    
    // Setup des mocks par défaut
    MockedSlugUtil.generateSlug.mockReturnValue('test-story-slug');
    MockedEncryptionService.encryptRowData.mockReturnValue(mockEncryptedData);
          MockedEncryptionService.decryptRowData.mockReturnValue({
        titre: mockStoryData.titre,
        slug: 'test-story-slug',
        description: mockStoryData.description || '',
        auteur: mockStoryData.auteur,
      });
  });

  describe('createStory', () => {
    beforeEach(() => {
      MockedStory.create.mockResolvedValue(mockStoryModel as any);
    });

    it('devrait créer une histoire avec succès', async () => {
      const result = await StoryService.createStory(mockStoryData);

      expect(MockedSlugUtil.generateSlug).toHaveBeenCalledWith(mockStoryData.titre);
      expect(MockedEncryptionService.encryptRowData).toHaveBeenCalledWith(
        expect.objectContaining({
          titre: mockStoryData.titre,
          slug: 'test-story-slug',
          description: mockStoryData.description,
          auteur: mockStoryData.auteur,
        }),
        expect.any(String)
      );
      expect(MockedStory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          uuid: expect.any(String),
          titre: mockEncryptedData.encryptedData.titre,
          slug: mockEncryptedData.encryptedData.slug,
          description: mockEncryptedData.encryptedData.description,
          auteur: mockEncryptedData.encryptedData.auteur,
          statut: mockStoryData.statut,
          userId: mockStoryData.userId,
          sagaId: mockStoryData.sagaId,
          iv: mockEncryptedData.iv,
          tag: mockEncryptedData.tag,
        })
      );

      expect(result).toEqual({
        id: mockStoryModel.id,
        uuid: mockStoryModel.uuid,
        titre: mockStoryData.titre,
        slug: 'test-story-slug',
        description: mockStoryData.description,
        auteur: mockStoryData.auteur,
        statut: mockStoryModel.statut,
        userId: mockStoryModel.userId,
        sagaId: mockStoryModel.sagaId,
        createdAt: mockStoryModel.createdAt,
        updatedAt: mockStoryModel.updatedAt,
      });
    });

    it('devrait utiliser "Auteur Inconnu" si l\'auteur n\'est pas fourni', async () => {
      const storyWithoutAuteur = { ...mockStoryData };
      delete (storyWithoutAuteur as any).auteur;
      
      await StoryService.createStory(storyWithoutAuteur as StoryInput);

      expect(MockedEncryptionService.encryptRowData).toHaveBeenCalledWith(
        expect.objectContaining({
          auteur: 'Auteur Inconnu',
        }),
        expect.any(String)
      );
    });

    it('devrait générer un UUID unique pour chaque histoire', async () => {
      await StoryService.createStory(mockStoryData);
      await StoryService.createStory(mockStoryData);

      expect(MockedStory.create).toHaveBeenCalledTimes(2);
      const firstCall = MockedStory.create.mock.calls[0]?.[0];
      const secondCall = MockedStory.create.mock.calls[1]?.[0];
      
      expect(firstCall?.uuid).not.toBe(secondCall?.uuid);
    });
  });

  describe('getAllStories', () => {
    beforeEach(() => {
      MockedStory.findAll.mockResolvedValue([mockStoryModel] as any);
    });

    it('devrait retourner toutes les histoires avec les données déchiffrées', async () => {
      const result = await StoryService.getAllStories();

      expect(MockedStory.findAll).toHaveBeenCalledWith({
        order: [['createdAt', 'DESC']],
      });
      expect(MockedEncryptionService.decryptRowData).toHaveBeenCalledWith(
        expect.objectContaining({
          titre: mockStoryModel.titre,
          slug: mockStoryModel.slug,
          description: mockStoryModel.description,
          auteur: mockStoryModel.auteur,
        }),
        mockStoryModel.uuid,
        mockStoryModel.iv,
        mockStoryModel.tag
      );

      expect(result).toEqual([{
        id: mockStoryModel.id,
        uuid: mockStoryModel.uuid,
        titre: mockStoryData.titre,
        slug: 'test-story-slug',
        description: mockStoryData.description,
        auteur: mockStoryData.auteur,
        statut: mockStoryModel.statut,
        userId: mockStoryModel.userId,
        sagaId: mockStoryModel.sagaId,
        createdAt: mockStoryModel.createdAt,
        updatedAt: mockStoryModel.updatedAt,
      }]);
    });

    it('devrait retourner un tableau vide si aucune histoire n\'existe', async () => {
      MockedStory.findAll.mockResolvedValue([]);

      const result = await StoryService.getAllStories();

      expect(result).toEqual([]);
    });
  });

  describe('getStoryById', () => {
    it('devrait retourner une histoire par ID', async () => {
      MockedStory.findByPk.mockResolvedValue(mockStoryModel as any);

      const result = await StoryService.getStoryById(1);

      expect(MockedStory.findByPk).toHaveBeenCalledWith(1);
      expect(MockedEncryptionService.decryptRowData).toHaveBeenCalledWith(
        expect.objectContaining({
          titre: mockStoryModel.titre,
          slug: mockStoryModel.slug,
          description: mockStoryModel.description,
          auteur: mockStoryModel.auteur,
        }),
        mockStoryModel.uuid,
        mockStoryModel.iv,
        mockStoryModel.tag
      );

      expect(result).toEqual({
        id: mockStoryModel.id,
        uuid: mockStoryModel.uuid,
        titre: mockStoryData.titre,
        slug: 'test-story-slug',
        description: mockStoryData.description,
        auteur: mockStoryData.auteur,
        statut: mockStoryModel.statut,
        userId: mockStoryModel.userId,
        sagaId: mockStoryModel.sagaId,
        createdAt: mockStoryModel.createdAt,
        updatedAt: mockStoryModel.updatedAt,
      });
    });

    it('devrait retourner null si l\'histoire n\'existe pas', async () => {
      MockedStory.findByPk.mockResolvedValue(null);

      const result = await StoryService.getStoryById(999);

      expect(result).toBeNull();
    });
  });

  describe('getStoryByUuid', () => {
    it('devrait retourner une histoire par UUID', async () => {
      MockedStory.findOne.mockResolvedValue(mockStoryModel as any);

      const result = await StoryService.getStoryByUuid('test-uuid-123');

      expect(MockedStory.findOne).toHaveBeenCalledWith({
        where: { uuid: 'test-uuid-123' },
      });
      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockStoryModel.id);
    });

    it('devrait retourner null si l\'histoire n\'existe pas', async () => {
      MockedStory.findOne.mockResolvedValue(null);

      const result = await StoryService.getStoryByUuid('non-existent-uuid');

      expect(result).toBeNull();
    });
  });

  describe('getStoriesByAuteur', () => {
    beforeEach(() => {
      MockedStory.findAll.mockResolvedValue([mockStoryModel] as any);
    });

    it('devrait retourner les histoires d\'un auteur spécifique', async () => {
      const result = await StoryService.getStoriesByAuteur('Test Author');

      expect(MockedStory.findAll).toHaveBeenCalledWith({
        where: { auteur: 'Test Author' },
        order: [['createdAt', 'DESC']],
      });
      expect(MockedEncryptionService.decryptRowData).toHaveBeenCalled();

      expect(result).toHaveLength(1);
      expect(result[0].auteur).toBe(mockStoryData.auteur);
    });

    it('devrait retourner un tableau vide si aucune histoire n\'est trouvée pour l\'auteur', async () => {
      MockedStory.findAll.mockResolvedValue([]);

      const result = await StoryService.getStoriesByAuteur('Test Author');

      expect(result).toEqual([]);
    });
  });

  describe('getStoriesByStatut', () => {
    beforeEach(() => {
      MockedStory.findAll.mockResolvedValue([mockStoryModel] as any);
    });

    it('devrait retourner les histoires avec un statut spécifique', async () => {
      const result = await StoryService.getStoriesByStatut('brouillon');

      expect(MockedStory.findAll).toHaveBeenCalledWith({
        where: { statut: 'brouillon' },
        order: [['createdAt', 'DESC']],
      });

      expect(result).toHaveLength(1);
      expect(result[0].statut).toBe('brouillon');
    });
  });

  describe('updateStory', () => {
    beforeEach(() => {
      MockedStory.findByPk.mockResolvedValue(mockStoryModel as any);
      mockStoryModel.update.mockResolvedValue(undefined);
    });

    it('devrait mettre à jour une histoire avec succès', async () => {
      const updateData = {
        titre: 'Updated Story',
        description: 'Updated description',
        statut: 'en_cours' as const,
      };

      const result = await StoryService.updateStory(1, updateData);

      expect(MockedStory.findByPk).toHaveBeenCalledWith(1);
      expect(MockedSlugUtil.generateSlug).toHaveBeenCalledWith(updateData.titre);
      expect(MockedEncryptionService.encryptRowData).toHaveBeenCalledWith(
        expect.objectContaining({
          titre: updateData.titre,
          slug: 'test-story-slug',
          description: updateData.description,
        }),
        mockStoryModel.uuid
      );
      expect(mockStoryModel.update).toHaveBeenCalledWith({
        titre: mockEncryptedData.encryptedData.titre,
        slug: mockEncryptedData.encryptedData.slug,
        description: mockEncryptedData.encryptedData.description,
        auteur: mockEncryptedData.encryptedData.auteur,
        statut: updateData.statut,
        sagaId: 1,
        iv: mockEncryptedData.iv,
        tag: mockEncryptedData.tag,
      });

      expect(result).not.toBeNull();
    });

    it('devrait retourner null si l\'histoire n\'existe pas', async () => {
      MockedStory.findByPk.mockResolvedValue(null);

      const result = await StoryService.updateStory(999, { titre: 'Updated Story' });

      expect(result).toBeNull();
    });

    it('devrait préserver les champs non modifiés', async () => {
      const updateData = { titre: 'Updated Story' };

      await StoryService.updateStory(1, updateData);

      expect(MockedEncryptionService.encryptRowData).toHaveBeenCalledWith(
        expect.objectContaining({
          titre: updateData.titre,
          // Les autres champs doivent être préservés
          description: mockStoryData.description || '',
          auteur: mockStoryData.auteur,
        }),
        mockStoryModel.uuid
      );
    });
  });

  describe('deleteStory', () => {
    beforeEach(() => {
      MockedStory.findByPk.mockResolvedValue(mockStoryModel as any);
    });

    it('devrait supprimer une histoire avec succès', async () => {
      const mockDestroy = jest.fn().mockResolvedValue(undefined);
      const storyWithDestroy = { ...mockStoryModel, destroy: mockDestroy };
      MockedStory.findByPk.mockResolvedValue(storyWithDestroy as any);

      const result = await StoryService.deleteStory(1);

      expect(MockedStory.findByPk).toHaveBeenCalledWith(1);
      expect(mockDestroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('devrait retourner false si l\'histoire n\'existe pas', async () => {
      MockedStory.findByPk.mockResolvedValue(null);

      const result = await StoryService.deleteStory(999);

      expect(result).toBe(false);
    });
  });

  describe('getStoryByIdOrUuidOrSlug', () => {
    it('devrait retourner une histoire par ID numérique', async () => {
      MockedStory.findByPk.mockResolvedValue(mockStoryModel as any);

      const result = await StoryService.getStoryByIdOrUuidOrSlug(1);

      expect(MockedStory.findByPk).toHaveBeenCalledWith(1);
      expect(result).not.toBeNull();
    });

    it('devrait retourner une histoire par UUID', async () => {
      MockedStory.findOne.mockResolvedValue(mockStoryModel as any);

      const result = await StoryService.getStoryByIdOrUuidOrSlug('b3c2e2e0-e3c9-42ca-8612-ec27e99ee47d');

      expect(MockedStory.findOne).toHaveBeenCalledWith({
        where: { uuid: 'b3c2e2e0-e3c9-42ca-8612-ec27e99ee47d' },
      });
      expect(result).not.toBeNull();
    });

    it('devrait chercher par slug si UUID échoue', async () => {
      // Pour un slug (qui ne ressemble pas à un UUID), on va directement dans findAll
      MockedStory.findAll.mockResolvedValue([mockStoryModel] as any);
      
      // Mock du déchiffrement pour retourner le bon slug
      MockedEncryptionService.decryptRowData.mockReturnValue({
        titre: mockStoryData.titre,
        slug: 'test-slug', // Le slug recherché
        description: mockStoryData.description || '',
        auteur: mockStoryData.auteur,
      });

      const result = await StoryService.getStoryByIdOrUuidOrSlug('test-slug');

      expect(MockedStory.findAll).toHaveBeenCalled();
      expect(result).not.toBeNull();
    });
  });
}); 