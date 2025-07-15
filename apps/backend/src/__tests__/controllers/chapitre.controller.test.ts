import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { ChapitreController } from '../../controllers/chapitre.controller.js';
import { ChapitreService } from '../../services/chapitre.service.js';
import { ResponseUtil } from '../../utils/response.util.js';

// Mock des dépendances
jest.mock('../../services/chapitre.service.js');
jest.mock('../../utils/response.util.js');

const mockChapitreService = ChapitreService as jest.MockedClass<typeof ChapitreService>;
const mockResponseUtil = ResponseUtil as jest.MockedClass<typeof ResponseUtil>;

describe('ChapitreController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  const mockChapitreOutput = {
    id: 1,
    uuid: 'test-uuid-123',
    titre: 'Premier Chapitre',
    slug: 'premier-chapitre',
    numero: 1,
    storyId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      params: {},
      body: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis() as never,
      json: jest.fn() as never,
    };

    // Mock des méthodes ResponseUtil
    mockResponseUtil.success = jest.fn();
    mockResponseUtil.created = jest.fn();
    mockResponseUtil.error = jest.fn();
    mockResponseUtil.notFound = jest.fn();
    mockResponseUtil.handleError = jest.fn();
  });

  describe('getAllChapitres', () => {
    it('doit récupérer tous les chapitres avec succès', async () => {
      const mockChapitres = [mockChapitreOutput];
      mockChapitreService.getAllChapitres = (jest.fn() as any).mockResolvedValue(mockChapitres);

      await ChapitreController.getAllChapitres(mockRequest as Request, mockResponse as Response);

      expect(mockChapitreService.getAllChapitres).toHaveBeenCalled();
      expect(mockResponseUtil.success).toHaveBeenCalledWith(
        mockResponse,
        mockChapitres,
        'Chapitres récupérés avec succès'
      );
    });

    it('doit gérer les erreurs lors de la récupération', async () => {
      const mockError = new Error('Erreur DB');
      mockChapitreService.getAllChapitres = (jest.fn() as any).mockRejectedValue(mockError);

      await ChapitreController.getAllChapitres(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.handleError).toHaveBeenCalledWith(
        mockResponse,
        mockError,
        'la récupération des chapitres'
      );
    });
  });

  describe('getChapitreById', () => {
    it('doit récupérer un chapitre par ID valide', async () => {
      mockRequest.params = { id: '1' };
      mockChapitreService.getChapitreById = (jest.fn() as any).mockResolvedValue(mockChapitreOutput);

      await ChapitreController.getChapitreById(mockRequest as Request, mockResponse as Response);

      expect(mockChapitreService.getChapitreById).toHaveBeenCalledWith(1);
      expect(mockResponseUtil.success).toHaveBeenCalledWith(
        mockResponse,
        mockChapitreOutput,
        'Chapitre récupéré avec succès'
      );
    });

    it('doit retourner une erreur pour ID invalide', async () => {
      mockRequest.params = { id: 'invalid' };

      await ChapitreController.getChapitreById(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse,
        'ID invalide',
        400
      );
    });

    it('doit retourner 404 si chapitre non trouvé', async () => {
      mockRequest.params = { id: '999' };
      mockChapitreService.getChapitreById = (jest.fn() as any).mockResolvedValue(null);

      await ChapitreController.getChapitreById(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.notFound).toHaveBeenCalledWith(
        mockResponse,
        'Chapitre non trouvé'
      );
    });
  });

  describe('getChapitreByUuid', () => {
    it('doit récupérer un chapitre par UUID', async () => {
      mockRequest.params = { uuid: 'test-uuid-123' };
      mockChapitreService.getChapitreByUuid = (jest.fn() as any).mockResolvedValue(mockChapitreOutput);

      await ChapitreController.getChapitreByUuid(mockRequest as Request, mockResponse as Response);

      expect(mockChapitreService.getChapitreByUuid).toHaveBeenCalledWith('test-uuid-123');
      expect(mockResponseUtil.success).toHaveBeenCalledWith(
        mockResponse,
        mockChapitreOutput,
        'Chapitre récupéré avec succès'
      );
    });

    it('doit retourner 404 si UUID non trouvé', async () => {
      mockRequest.params = { uuid: 'inexistant' };
      mockChapitreService.getChapitreByUuid = (jest.fn() as any).mockResolvedValue(null);

      await ChapitreController.getChapitreByUuid(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.notFound).toHaveBeenCalledWith(
        mockResponse,
        'Chapitre non trouvé'
      );
    });
  });

  describe('getChapitreByIdOrUuidOrSlug', () => {
    it('doit récupérer un chapitre par ID numérique', async () => {
      mockRequest.params = { identifier: '1' };
      mockChapitreService.getChapitreByIdOrUuidOrSlug = (jest.fn() as any).mockResolvedValue(mockChapitreOutput);

      await ChapitreController.getChapitreByIdOrUuidOrSlug(mockRequest as Request, mockResponse as Response);

      expect(mockChapitreService.getChapitreByIdOrUuidOrSlug).toHaveBeenCalledWith(1);
      expect(mockResponseUtil.success).toHaveBeenCalled();
    });

    it('doit récupérer un chapitre par identifier string', async () => {
      mockRequest.params = { identifier: 'test-uuid-123' };
      mockChapitreService.getChapitreByIdOrUuidOrSlug = (jest.fn() as any).mockResolvedValue(mockChapitreOutput);

      await ChapitreController.getChapitreByIdOrUuidOrSlug(mockRequest as Request, mockResponse as Response);

      expect(mockChapitreService.getChapitreByIdOrUuidOrSlug).toHaveBeenCalledWith('test-uuid-123');
    });
  });

  describe('getChapitresByStoryId', () => {
    it('doit récupérer les chapitres d\'une story', async () => {
      mockRequest.params = { storyId: '1' };
      const mockChapitres = [mockChapitreOutput];
      mockChapitreService.getChapitresByStoryId = (jest.fn() as any).mockResolvedValue(mockChapitres);

      await ChapitreController.getChapitresByStoryId(mockRequest as Request, mockResponse as Response);

      expect(mockChapitreService.getChapitresByStoryId).toHaveBeenCalledWith(1);
      expect(mockResponseUtil.success).toHaveBeenCalledWith(
        mockResponse,
        mockChapitres,
        'Chapitres de la story récupérés avec succès'
      );
    });

    it('doit retourner une erreur pour storyId invalide', async () => {
      mockRequest.params = { storyId: 'invalid' };

      await ChapitreController.getChapitresByStoryId(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse,
        'ID de story invalide',
        400
      );
    });
  });

  describe('createChapitre', () => {
    it('doit créer un nouveau chapitre avec succès', async () => {
      mockRequest.body = {
        titre: 'Premier Chapitre',
        numero: 1,
        storyId: 1,
      };
      mockChapitreService.createChapitre = (jest.fn() as any).mockResolvedValue(mockChapitreOutput);

      await ChapitreController.createChapitre(mockRequest as Request, mockResponse as Response);

      expect(mockChapitreService.createChapitre).toHaveBeenCalledWith({
        titre: 'Premier Chapitre',
        numero: 1,
        storyId: 1,
      });
      expect(mockResponseUtil.created).toHaveBeenCalledWith(
        mockResponse,
        mockChapitreOutput,
        'Chapitre créé avec succès'
      );
    });

    it('doit retourner une erreur pour données manquantes', async () => {
      mockRequest.body = { titre: 'Test' }; // manque numero et storyId

      await ChapitreController.createChapitre(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse,
        'Titre, numéro et storyId sont requis',
        400
      );
    });

    it('doit retourner une erreur pour storyId invalide', async () => {
      mockRequest.body = {
        titre: 'Test',
        numero: 1,
        storyId: 'invalid',
      };

      await ChapitreController.createChapitre(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse,
        'storyId doit être un nombre',
        400
      );
    });
  });

  describe('updateChapitre', () => {
    it('doit mettre à jour un chapitre avec succès', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { titre: 'Titre Modifié' };
      mockChapitreService.updateChapitre = (jest.fn() as any).mockResolvedValue(mockChapitreOutput);

      await ChapitreController.updateChapitre(mockRequest as Request, mockResponse as Response);

      expect(mockChapitreService.updateChapitre).toHaveBeenCalledWith(1, {
        titre: 'Titre Modifié',
        numero: undefined,
        storyId: undefined,
      });
      expect(mockResponseUtil.success).toHaveBeenCalledWith(
        mockResponse,
        mockChapitreOutput,
        'Chapitre mis à jour avec succès'
      );
    });

    it('doit retourner 404 si chapitre non trouvé', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { titre: 'Test' };
      mockChapitreService.updateChapitre = (jest.fn() as any).mockResolvedValue(null);

      await ChapitreController.updateChapitre(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.notFound).toHaveBeenCalledWith(
        mockResponse,
        'Chapitre non trouvé'
      );
    });
  });

  describe('deleteChapitre', () => {
    it('doit supprimer un chapitre avec succès', async () => {
      mockRequest.params = { id: '1' };
      mockChapitreService.deleteChapitre = (jest.fn() as any).mockResolvedValue(true);

      await ChapitreController.deleteChapitre(mockRequest as Request, mockResponse as Response);

      expect(mockChapitreService.deleteChapitre).toHaveBeenCalledWith(1);
      expect(mockResponseUtil.success).toHaveBeenCalledWith(
        mockResponse,
        null,
        'Chapitre supprimé avec succès'
      );
    });

    it('doit retourner 404 si chapitre non trouvé', async () => {
      mockRequest.params = { id: '999' };
      mockChapitreService.deleteChapitre = (jest.fn() as any).mockResolvedValue(false);

      await ChapitreController.deleteChapitre(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.notFound).toHaveBeenCalledWith(
        mockResponse,
        'Chapitre non trouvé'
      );
    });
  });
}); 