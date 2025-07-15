import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { SagaController } from '../../controllers/saga.controller.js';
import { SagaService } from '../../services/saga.service.js';
import { ResponseUtil } from '../../utils/response.util.js';

// Mock des dépendances
jest.mock('../../services/saga.service.js');
jest.mock('../../utils/response.util.js');

const mockSagaService = SagaService as jest.MockedClass<typeof SagaService>;
const mockResponseUtil = ResponseUtil as jest.MockedClass<typeof ResponseUtil>;

describe('SagaController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  const mockSagaOutput = {
    id: 1,
    uuid: 'test-uuid-123',
    titre: 'Ma Grande Saga',
    slug: 'ma-grande-saga',
    description: 'Une saga épique',
    auteur: 'Jean Écrivain',
    userId: 1,
    statut: 'brouillon' as const,
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

  describe('getAllSagas', () => {
    it('doit récupérer toutes les sagas avec succès', async () => {
      const mockSagas = [mockSagaOutput];
      mockSagaService.getAllSagas = (jest.fn() as any).mockResolvedValue(mockSagas);

      await SagaController.getAllSagas(mockRequest as Request, mockResponse as Response);

      expect(mockSagaService.getAllSagas).toHaveBeenCalled();
      expect(mockResponseUtil.success).toHaveBeenCalledWith(
        mockResponse,
        mockSagas,
        'Sagas récupérées avec succès'
      );
    });

    it('doit gérer les erreurs lors de la récupération', async () => {
      const mockError = new Error('Erreur DB');
      mockSagaService.getAllSagas = (jest.fn() as any).mockRejectedValue(mockError);

      await SagaController.getAllSagas(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.handleError).toHaveBeenCalledWith(
        mockResponse,
        mockError,
        'la récupération des sagas'
      );
    });
  });

  describe('getSagaById', () => {
    it('doit récupérer une saga par ID valide', async () => {
      mockRequest.params = { id: '1' };
      mockSagaService.getSagaById = (jest.fn() as any).mockResolvedValue(mockSagaOutput);

      await SagaController.getSagaById(mockRequest as Request, mockResponse as Response);

      expect(mockSagaService.getSagaById).toHaveBeenCalledWith(1);
      expect(mockResponseUtil.success).toHaveBeenCalledWith(
        mockResponse,
        mockSagaOutput,
        'Saga récupérée avec succès'
      );
    });

    it('doit retourner une erreur pour ID invalide', async () => {
      mockRequest.params = { id: 'invalid' };

      await SagaController.getSagaById(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse,
        'ID invalide',
        400
      );
    });

    it('doit retourner 404 si saga non trouvée', async () => {
      mockRequest.params = { id: '999' };
      mockSagaService.getSagaById = (jest.fn() as any).mockResolvedValue(null);

      await SagaController.getSagaById(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.notFound).toHaveBeenCalledWith(
        mockResponse,
        'Saga non trouvée'
      );
    });
  });

  describe('getSagaByUuid', () => {
    it('doit récupérer une saga par UUID', async () => {
      mockRequest.params = { uuid: 'test-uuid-123' };
      mockSagaService.getSagaByUuid = (jest.fn() as any).mockResolvedValue(mockSagaOutput);

      await SagaController.getSagaByUuid(mockRequest as Request, mockResponse as Response);

      expect(mockSagaService.getSagaByUuid).toHaveBeenCalledWith('test-uuid-123');
      expect(mockResponseUtil.success).toHaveBeenCalledWith(
        mockResponse,
        mockSagaOutput,
        'Saga récupérée avec succès'
      );
    });
  });

  describe('getSagaBySlug', () => {
    it('doit récupérer une saga par slug', async () => {
      mockRequest.params = { slug: 'ma-grande-saga' };
      mockSagaService.getSagaBySlug = (jest.fn() as any).mockResolvedValue(mockSagaOutput);

      await SagaController.getSagaBySlug(mockRequest as Request, mockResponse as Response);

      expect(mockSagaService.getSagaBySlug).toHaveBeenCalledWith('ma-grande-saga');
      expect(mockResponseUtil.success).toHaveBeenCalledWith(
        mockResponse,
        mockSagaOutput,
        'Saga récupérée avec succès'
      );
    });
  });

  describe('getSagaByIdOrUuidOrSlug', () => {
    it('doit récupérer une saga par ID numérique', async () => {
      mockRequest.params = { identifier: '1' };
      mockSagaService.getSagaByIdOrUuidOrSlug = (jest.fn() as any).mockResolvedValue(mockSagaOutput);

      await SagaController.getSagaByIdOrUuidOrSlug(mockRequest as Request, mockResponse as Response);

      expect(mockSagaService.getSagaByIdOrUuidOrSlug).toHaveBeenCalledWith(1);
      expect(mockResponseUtil.success).toHaveBeenCalled();
    });

    it('doit récupérer une saga par identifier string', async () => {
      mockRequest.params = { identifier: 'test-uuid-123' };
      mockSagaService.getSagaByIdOrUuidOrSlug = (jest.fn() as any).mockResolvedValue(mockSagaOutput);

      await SagaController.getSagaByIdOrUuidOrSlug(mockRequest as Request, mockResponse as Response);

      expect(mockSagaService.getSagaByIdOrUuidOrSlug).toHaveBeenCalledWith('test-uuid-123');
    });
  });

  describe('getSagasByAuteur', () => {
    it('doit récupérer les sagas d\'un auteur', async () => {
      mockRequest.params = { auteur: 'Jean Écrivain' };
      const mockSagas = [mockSagaOutput];
      mockSagaService.getSagasByAuteur = (jest.fn() as any).mockResolvedValue(mockSagas);

      await SagaController.getSagasByAuteur(mockRequest as Request, mockResponse as Response);

      expect(mockSagaService.getSagasByAuteur).toHaveBeenCalledWith('Jean Écrivain');
      expect(mockResponseUtil.success).toHaveBeenCalledWith(
        mockResponse,
        mockSagas,
        'Sagas de l\'auteur Jean Écrivain récupérées avec succès'
      );
    });
  });

  describe('getSagasByUserId', () => {
    it('doit récupérer les sagas d\'un utilisateur', async () => {
      mockRequest.params = { userId: '1' };
      const mockSagas = [mockSagaOutput];
      mockSagaService.getSagasByUserId = (jest.fn() as any).mockResolvedValue(mockSagas);

      await SagaController.getSagasByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockSagaService.getSagasByUserId).toHaveBeenCalledWith(1);
      expect(mockResponseUtil.success).toHaveBeenCalledWith(
        mockResponse,
        mockSagas,
        'Sagas de l\'utilisateur 1 récupérées avec succès'
      );
    });

    it('doit retourner une erreur pour userId invalide', async () => {
      mockRequest.params = { userId: 'invalid' };

      await SagaController.getSagasByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse,
        'ID utilisateur invalide',
        400
      );
    });
  });

  describe('getSagasByStatut', () => {
    const statutsValides = ['brouillon', 'en_cours', 'terminee', 'publiee'];

    statutsValides.forEach(statut => {
      it(`doit récupérer les sagas avec le statut ${statut}`, async () => {
        mockRequest.params = { statut };
        const mockSagas = [{ ...mockSagaOutput, statut }];
        mockSagaService.getSagasByStatut = (jest.fn() as any).mockResolvedValue(mockSagas);

        await SagaController.getSagasByStatut(mockRequest as Request, mockResponse as Response);

        expect(mockSagaService.getSagasByStatut).toHaveBeenCalledWith(statut);
        expect(mockResponseUtil.success).toHaveBeenCalledWith(
          mockResponse,
          mockSagas,
          `Sagas avec le statut ${statut} récupérées avec succès`
        );
      });
    });

    it('doit retourner une erreur pour statut invalide', async () => {
      mockRequest.params = { statut: 'statut_invalide' };

      await SagaController.getSagasByStatut(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse,
        'Statut invalide',
        400
      );
    });
  });

  describe('createSaga', () => {
    it('doit créer une nouvelle saga avec succès', async () => {
      mockRequest.body = {
        titre: 'Ma Grande Saga',
        description: 'Une saga épique',
        auteur: 'Jean Écrivain',
        statut: 'brouillon',
        userId: 1,
      };
      mockSagaService.createSaga = (jest.fn() as any).mockResolvedValue(mockSagaOutput);

      await SagaController.createSaga(mockRequest as Request, mockResponse as Response);

      expect(mockSagaService.createSaga).toHaveBeenCalledWith({
        titre: 'Ma Grande Saga',
        description: 'Une saga épique',
        auteur: 'Jean Écrivain',
        statut: 'brouillon',
        userId: 1,
      });
      expect(mockResponseUtil.created).toHaveBeenCalledWith(
        mockResponse,
        mockSagaOutput,
        'Saga créée avec succès'
      );
    });

    it('doit retourner une erreur pour données manquantes', async () => {
      mockRequest.body = { titre: 'Test' }; // manque auteur

      await SagaController.createSaga(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse,
        'Titre et auteur sont requis',
        400
      );
    });

    it('doit retourner une erreur pour statut invalide', async () => {
      mockRequest.body = {
        titre: 'Test',
        auteur: 'Test',
        statut: 'statut_invalide',
      };

      await SagaController.createSaga(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse,
        'Statut invalide',
        400
      );
    });
  });

  describe('updateSaga', () => {
    it('doit mettre à jour une saga avec succès', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { titre: 'Titre Modifié' };
      mockSagaService.updateSaga = (jest.fn() as any).mockResolvedValue(mockSagaOutput);

      await SagaController.updateSaga(mockRequest as Request, mockResponse as Response);

      expect(mockSagaService.updateSaga).toHaveBeenCalledWith(1, {
        titre: 'Titre Modifié',
        description: undefined,
        auteur: undefined,
        statut: undefined,
        userId: undefined,
      });
      expect(mockResponseUtil.success).toHaveBeenCalledWith(
        mockResponse,
        mockSagaOutput,
        'Saga mise à jour avec succès'
      );
    });

    it('doit retourner 404 si saga non trouvée', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { titre: 'Test' };
      mockSagaService.updateSaga = (jest.fn() as any).mockResolvedValue(null);

      await SagaController.updateSaga(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.notFound).toHaveBeenCalledWith(
        mockResponse,
        'Saga non trouvée'
      );
    });

    it('doit retourner une erreur pour statut invalide lors de la mise à jour', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { statut: 'statut_invalide' };

      await SagaController.updateSaga(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse,
        'Statut invalide',
        400
      );
    });
  });

  describe('deleteSaga', () => {
    it('doit supprimer une saga avec succès', async () => {
      mockRequest.params = { id: '1' };
      mockSagaService.deleteSaga = (jest.fn() as any).mockResolvedValue(true);

      await SagaController.deleteSaga(mockRequest as Request, mockResponse as Response);

      expect(mockSagaService.deleteSaga).toHaveBeenCalledWith(1);
      expect(mockResponseUtil.success).toHaveBeenCalledWith(
        mockResponse,
        null,
        'Saga supprimée avec succès'
      );
    });

    it('doit retourner 404 si saga non trouvée', async () => {
      mockRequest.params = { id: '999' };
      mockSagaService.deleteSaga = (jest.fn() as any).mockResolvedValue(false);

      await SagaController.deleteSaga(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.notFound).toHaveBeenCalledWith(
        mockResponse,
        'Saga non trouvée'
      );
    });
  });
}); 