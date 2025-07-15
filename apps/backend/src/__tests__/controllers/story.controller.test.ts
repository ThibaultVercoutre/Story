import { Request, Response } from 'express';
import { StoryController } from '../../controllers/story.controller.js';
import { StoryService } from '../../services/story.service.js';
import { ResponseUtil } from '../../utils/response.util.js';
import { ValidationUtil } from '../../utils/validation.util.js';

// Mock des dépendances
jest.mock('../../services/story.service.js');
jest.mock('../../utils/response.util.js');
jest.mock('../../utils/validation.util.js');

const MockedStoryService = StoryService as jest.Mocked<typeof StoryService>;
const MockedResponseUtil = ResponseUtil as jest.Mocked<typeof ResponseUtil>;
const MockedValidationUtil = ValidationUtil as jest.Mocked<typeof ValidationUtil>;

describe('StoryController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      body: {},
      params: {},
      query: {},
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis() as never,
      json: jest.fn() as never,
    };
  });

  describe('getAllStories', () => {
    const mockStories = [
      {
        id: 1,
        uuid: 'story-uuid-1',
        titre: 'Story 1',
        slug: 'story-1',
        description: 'Description 1',
        auteur: 'Author 1',
        statut: 'publiee' as const,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        uuid: 'story-uuid-2',
        titre: 'Story 2',
        slug: 'story-2',
        description: 'Description 2',
        auteur: 'Author 2',
        statut: 'brouillon' as const,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    beforeEach(() => {
      MockedStoryService.getAllStories.mockResolvedValue(mockStories);
    });

    it('devrait retourner toutes les histoires', async () => {
      await StoryController.getAllStories(mockReq as Request, mockRes as Response);

      expect(MockedStoryService.getAllStories).toHaveBeenCalled();
      expect(MockedResponseUtil.success).toHaveBeenCalledWith(
        mockRes,
        mockStories,
        'Histoires récupérées avec succès'
      );
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      MockedStoryService.getAllStories.mockRejectedValue(error);

      await StoryController.getAllStories(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.handleError).toHaveBeenCalledWith(
        mockRes,
        error,
        'la récupération des histoires'
      );
    });
  });

  describe('getStoryById', () => {
    const mockStory = {
      id: 1,
      uuid: 'story-uuid-1',
      titre: 'Story 1',
      slug: 'story-1',
      description: 'Description 1',
      auteur: 'Author 1',
      statut: 'publiee' as const,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockReq.params = { id: '1' };
      MockedValidationUtil.validateId.mockReturnValue({
        isValid: true,
        errors: {},
      });
      MockedStoryService.getStoryById.mockResolvedValue(mockStory);
    });

    it('devrait retourner une histoire par ID', async () => {
      await StoryController.getStoryById(mockReq as Request, mockRes as Response);

      expect(MockedValidationUtil.validateId).toHaveBeenCalledWith('1');
      expect(MockedStoryService.getStoryById).toHaveBeenCalledWith(1);
      expect(MockedResponseUtil.success).toHaveBeenCalledWith(
        mockRes,
        mockStory,
        'Histoire récupérée avec succès'
      );
    });

    it('devrait retourner une erreur de validation', async () => {
      MockedValidationUtil.validateId.mockReturnValue({
        isValid: false,
        errors: { id: 'ID invalide' },
      });

      await StoryController.getStoryById(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.validationError).toHaveBeenCalledWith(
        mockRes,
        { id: 'ID invalide' }
      );
    });

    it('devrait retourner une erreur si l\'histoire n\'existe pas', async () => {
      MockedStoryService.getStoryById.mockResolvedValue(null);

      await StoryController.getStoryById(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.notFound).toHaveBeenCalledWith(
        mockRes,
        'Histoire non trouvée'
      );
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      MockedStoryService.getStoryById.mockRejectedValue(error);

      await StoryController.getStoryById(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.handleError).toHaveBeenCalledWith(
        mockRes,
        error,
        'la récupération de l\'histoire'
      );
    });
  });

  describe('createStory', () => {
    const validStoryData = {
      titre: 'New Story',
      description: 'A new story',
      auteur: 'Author',
      statut: 'brouillon',
      userId: 1,
    };

    const mockCreatedStory = {
      id: 1,
      uuid: 'story-uuid-1',
      titre: 'New Story',
      slug: 'new-story',
      description: 'A new story',
      auteur: 'Author',
      statut: 'brouillon' as const,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockReq.body = validStoryData;
      (mockReq as any).user = { userId: 1 };
      MockedValidationUtil.validateStoryData.mockReturnValue({
        isValid: true,
        errors: {},
      });
      MockedStoryService.createStory.mockResolvedValue(mockCreatedStory);
    });

    it('devrait créer une histoire avec succès', async () => {
      await StoryController.createStory(mockReq as Request, mockRes as Response);

      expect(MockedValidationUtil.validateStoryData).toHaveBeenCalledWith({
        titre: validStoryData.titre,
        auteur: validStoryData.auteur,
        userId: 1,
      });
      expect(MockedStoryService.createStory).toHaveBeenCalledWith({
        ...validStoryData,
        userId: 1,
      });
      expect(MockedResponseUtil.created).toHaveBeenCalledWith(
        mockRes,
        mockCreatedStory,
        'Histoire créée avec succès'
      );
    });

    it('devrait retourner une erreur de validation', async () => {
      MockedValidationUtil.validateStoryData.mockReturnValue({
        isValid: false,
        errors: { titre: 'Titre requis' },
      });

      await StoryController.createStory(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.validationError).toHaveBeenCalledWith(
        mockRes,
        { titre: 'Titre requis' }
      );
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      MockedStoryService.createStory.mockRejectedValue(error);

      await StoryController.createStory(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.handleError).toHaveBeenCalledWith(
        mockRes,
        error,
        'la création de l\'histoire'
      );
    });
  });

  describe('updateStory', () => {
    const updateData = {
      titre: 'Updated Story',
      description: 'Updated description',
    };

    const mockUpdatedStory = {
      id: 1,
      uuid: 'story-uuid-1',
      titre: 'Updated Story',
      slug: 'updated-story',
      description: 'Updated description',
      auteur: 'Author',
      statut: 'brouillon' as const,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockReq.params = { id: '1' };
      mockReq.body = updateData;
      MockedValidationUtil.validateId.mockReturnValue({
        isValid: true,
        errors: {},
      });
      MockedStoryService.updateStory.mockResolvedValue(mockUpdatedStory);
    });

    it('devrait mettre à jour une histoire avec succès', async () => {
      await StoryController.updateStory(mockReq as Request, mockRes as Response);

      expect(MockedValidationUtil.validateId).toHaveBeenCalledWith('1');
      expect(MockedStoryService.updateStory).toHaveBeenCalledWith(1, updateData);
      expect(MockedResponseUtil.success).toHaveBeenCalledWith(
        mockRes,
        mockUpdatedStory,
        'Histoire mise à jour avec succès'
      );
    });

    it('devrait retourner une erreur de validation', async () => {
      MockedValidationUtil.validateId.mockReturnValue({
        isValid: false,
        errors: { id: 'ID invalide' },
      });

      await StoryController.updateStory(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.validationError).toHaveBeenCalledWith(
        mockRes,
        { id: 'ID invalide' }
      );
    });

    it('devrait retourner une erreur si l\'histoire n\'existe pas', async () => {
      MockedStoryService.updateStory.mockResolvedValue(null);

      await StoryController.updateStory(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.notFound).toHaveBeenCalledWith(
        mockRes,
        'Histoire non trouvée'
      );
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      MockedStoryService.updateStory.mockRejectedValue(error);

      await StoryController.updateStory(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.handleError).toHaveBeenCalledWith(
        mockRes,
        error,
        'la mise à jour de l\'histoire'
      );
    });
  });

  describe('deleteStory', () => {
    beforeEach(() => {
      mockReq.params = { id: '1' };
      MockedValidationUtil.validateId.mockReturnValue({
        isValid: true,
        errors: {},
      });
      MockedStoryService.deleteStory.mockResolvedValue(true);
    });

    it('devrait supprimer une histoire avec succès', async () => {
      await StoryController.deleteStory(mockReq as Request, mockRes as Response);

      expect(MockedValidationUtil.validateId).toHaveBeenCalledWith('1');
      expect(MockedStoryService.deleteStory).toHaveBeenCalledWith(1);
      expect(MockedResponseUtil.success).toHaveBeenCalledWith(
        mockRes,
        null,
        'Histoire supprimée avec succès'
      );
    });

    it('devrait retourner une erreur de validation', async () => {
      MockedValidationUtil.validateId.mockReturnValue({
        isValid: false,
        errors: { id: 'ID invalide' },
      });

      await StoryController.deleteStory(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.validationError).toHaveBeenCalledWith(
        mockRes,
        { id: 'ID invalide' }
      );
    });

    it('devrait retourner une erreur si l\'histoire n\'existe pas', async () => {
      MockedStoryService.deleteStory.mockResolvedValue(false);

      await StoryController.deleteStory(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.notFound).toHaveBeenCalledWith(
        mockRes,
        'Histoire non trouvée'
      );
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      MockedStoryService.deleteStory.mockRejectedValue(error);

      await StoryController.deleteStory(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.handleError).toHaveBeenCalledWith(
        mockRes,
        error,
        'la suppression de l\'histoire'
      );
    });
  });

  describe('getStoryByUuid', () => {
    const mockStory = {
      id: 1,
      uuid: 'story-uuid-1',
      titre: 'Story 1',
      slug: 'story-1',
      description: 'Description 1',
      auteur: 'Author 1',
      statut: 'publiee' as const,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockReq.params = { uuid: 'story-uuid-1' };
      MockedStoryService.getStoryByUuid.mockResolvedValue(mockStory);
    });

    it('devrait retourner une histoire par UUID', async () => {
      await StoryController.getStoryByUuid(mockReq as Request, mockRes as Response);

      expect(MockedStoryService.getStoryByUuid).toHaveBeenCalledWith('story-uuid-1');
      expect(MockedResponseUtil.success).toHaveBeenCalledWith(
        mockRes,
        mockStory,
        'Histoire récupérée avec succès'
      );
    });

    it('devrait retourner une erreur si l\'histoire n\'existe pas', async () => {
      MockedStoryService.getStoryByUuid.mockResolvedValue(null);

      await StoryController.getStoryByUuid(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.notFound).toHaveBeenCalledWith(
        mockRes,
        'Histoire non trouvée'
      );
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      MockedStoryService.getStoryByUuid.mockRejectedValue(error);

      await StoryController.getStoryByUuid(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.handleError).toHaveBeenCalledWith(
        mockRes,
        error,
        'la récupération de l\'histoire'
      );
    });
  });

  describe('getStoryByIdOrUuidOrSlug', () => {
    const mockStory = {
      id: 1,
      uuid: 'story-uuid-1',
      titre: 'Story 1',
      slug: 'story-1',
      description: 'Description 1',
      auteur: 'Author 1',
      statut: 'publiee' as const,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      MockedStoryService.getStoryByIdOrUuidOrSlug.mockResolvedValue(mockStory);
    });

    it('devrait retourner une histoire par ID numérique', async () => {
      mockReq.params = { identifier: '1' };
      
      await StoryController.getStoryByIdOrUuidOrSlug(mockReq as Request, mockRes as Response);

      expect(MockedStoryService.getStoryByIdOrUuidOrSlug).toHaveBeenCalledWith(1);
      expect(MockedResponseUtil.success).toHaveBeenCalledWith(
        mockRes,
        mockStory,
        'Histoire récupérée avec succès'
      );
    });

    it('devrait retourner une histoire par UUID ou slug', async () => {
      mockReq.params = { identifier: 'story-uuid-1' };
      
      await StoryController.getStoryByIdOrUuidOrSlug(mockReq as Request, mockRes as Response);

      expect(MockedStoryService.getStoryByIdOrUuidOrSlug).toHaveBeenCalledWith('story-uuid-1');
      expect(MockedResponseUtil.success).toHaveBeenCalledWith(
        mockRes,
        mockStory,
        'Histoire récupérée avec succès'
      );
    });

    it('devrait retourner une erreur si l\'histoire n\'existe pas', async () => {
      mockReq.params = { identifier: 'inexistant' };
      MockedStoryService.getStoryByIdOrUuidOrSlug.mockResolvedValue(null);

      await StoryController.getStoryByIdOrUuidOrSlug(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.notFound).toHaveBeenCalledWith(
        mockRes,
        'Histoire non trouvée'
      );
    });
  });

  describe('getStoriesByAuteur', () => {
    const mockStories = [
      {
        id: 1,
        uuid: 'story-uuid-1',
        titre: 'Story 1',
        slug: 'story-1',
        description: 'Description 1',
        auteur: 'Author Test',
        statut: 'publiee' as const,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    beforeEach(() => {
      mockReq.params = { auteur: 'Author Test' };
      MockedStoryService.getStoriesByAuteur.mockResolvedValue(mockStories);
    });

    it('devrait retourner les histoires par auteur', async () => {
      await StoryController.getStoriesByAuteur(mockReq as Request, mockRes as Response);

      expect(MockedStoryService.getStoriesByAuteur).toHaveBeenCalledWith('Author Test');
      expect(MockedResponseUtil.success).toHaveBeenCalledWith(
        mockRes,
        mockStories,
        'Stories de l\'auteur Author Test récupérées avec succès'
      );
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      MockedStoryService.getStoriesByAuteur.mockRejectedValue(error);

      await StoryController.getStoriesByAuteur(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.handleError).toHaveBeenCalledWith(
        mockRes,
        error,
        'la récupération des stories par auteur'
      );
    });
  });

  describe('getStoriesByStatut', () => {
    const mockStories = [
      {
        id: 1,
        uuid: 'story-uuid-1',
        titre: 'Story 1',
        slug: 'story-1',
        description: 'Description 1',
        auteur: 'Author Test',
        statut: 'publiee' as const,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    beforeEach(() => {
      MockedStoryService.getStoriesByStatut.mockResolvedValue(mockStories);
    });

    it('devrait retourner les histoires par statut valide', async () => {
      mockReq.params = { statut: 'publiee' };
      
      await StoryController.getStoriesByStatut(mockReq as Request, mockRes as Response);

      expect(MockedStoryService.getStoriesByStatut).toHaveBeenCalledWith('publiee');
      expect(MockedResponseUtil.success).toHaveBeenCalledWith(
        mockRes,
        mockStories,
        'Stories avec le statut publiee récupérées avec succès'
      );
    });

    it('devrait retourner une erreur pour un statut invalide', async () => {
      mockReq.params = { statut: 'statut_invalide' };
      
      await StoryController.getStoriesByStatut(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.error).toHaveBeenCalledWith(
        mockRes,
        'Statut invalide',
        400
      );
    });

    it('devrait gérer les erreurs', async () => {
      mockReq.params = { statut: 'brouillon' };
      const error = new Error('Database error');
      MockedStoryService.getStoriesByStatut.mockRejectedValue(error);

      await StoryController.getStoriesByStatut(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.handleError).toHaveBeenCalledWith(
        mockRes,
        error,
        'la récupération des stories par statut'
      );
    });
  });

  describe('getStoriesByUserId', () => {
    const mockStories = [
      {
        id: 1,
        uuid: 'story-uuid-1',
        titre: 'Story 1',
        slug: 'story-1',
        description: 'Description 1',
        auteur: 'Author Test',
        statut: 'publiee' as const,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    beforeEach(() => {
      mockReq.params = { userId: '1' };
      MockedValidationUtil.validateId.mockReturnValue({
        isValid: true,
        errors: {},
      });
      MockedStoryService.getStoriesByUserId.mockResolvedValue(mockStories);
    });

    it('devrait retourner les histoires par userId', async () => {
      await StoryController.getStoriesByUserId(mockReq as Request, mockRes as Response);

      expect(MockedValidationUtil.validateId).toHaveBeenCalledWith('1');
      expect(MockedStoryService.getStoriesByUserId).toHaveBeenCalledWith(1);
      expect(MockedResponseUtil.success).toHaveBeenCalledWith(
        mockRes,
        mockStories,
        'Stories de l\'utilisateur récupérées avec succès'
      );
    });

    it('devrait retourner une erreur de validation', async () => {
      MockedValidationUtil.validateId.mockReturnValue({
        isValid: false,
        errors: { userId: 'ID utilisateur invalide' },
      });

      await StoryController.getStoriesByUserId(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.validationError).toHaveBeenCalledWith(
        mockRes,
        { userId: 'ID utilisateur invalide' }
      );
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      MockedStoryService.getStoriesByUserId.mockRejectedValue(error);

      await StoryController.getStoriesByUserId(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.handleError).toHaveBeenCalledWith(
        mockRes,
        error,
        'la récupération des stories par utilisateur'
      );
    });
  });
}); 