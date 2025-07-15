import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { MorceauTexteController } from '../../controllers/morceauTexte.controller.js';
import { MorceauTexteService } from '../../services/morceauTexte.service.js';
import { TypeMorceauTexte } from '../../models/morceauTexte.model.js';
import { ResponseUtil } from '../../utils/response.util.js';

// Mock des dépendances
jest.mock('../../services/morceauTexte.service.js');
jest.mock('../../utils/response.util.js');

const mockMorceauTexteService = MorceauTexteService as any;
const mockResponseUtil = ResponseUtil as any;

describe('MorceauTexteController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  const mockMorceauTexteOutput = {
    id: 1,
    uuid: 'test-uuid-123',
    chapitreId: 1,
    type: TypeMorceauTexte.PARAGRAPHE,
    contenu: 'C\'était une nuit sombre et orageuse...',
    ordre: 1,
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
      status: (jest.fn() as any).mockReturnThis(),
      json: jest.fn() as any,
    };

    // Mock des méthodes ResponseUtil
    mockResponseUtil.success = jest.fn() as any;
    mockResponseUtil.created = jest.fn() as any;
    mockResponseUtil.error = jest.fn() as any;
    mockResponseUtil.notFound = jest.fn() as any;
    mockResponseUtil.handleError = jest.fn() as any;
  });

  describe('getMorceauxTexteByChapitreId', () => {
    it('doit récupérer les morceaux de texte d\'un chapitre', async () => {
      mockRequest.params = { chapitreId: '1' };
      const mockMorceaux = [mockMorceauTexteOutput];
      mockMorceauTexteService.getMorceauxTexteByChapitreId = (jest.fn() as any).mockResolvedValue(mockMorceaux);

      await MorceauTexteController.getMorceauxTexteByChapitreId(mockRequest as Request, mockResponse as Response);

      expect(mockMorceauTexteService.getMorceauxTexteByChapitreId).toHaveBeenCalledWith(1);
      expect(mockResponseUtil.success).toHaveBeenCalledWith(
        mockResponse,
        mockMorceaux,
        'Morceaux de texte récupérés avec succès'
      );
    });

    it('doit retourner une erreur pour chapitreId invalide', async () => {
      mockRequest.params = { chapitreId: 'invalid' };

      await MorceauTexteController.getMorceauxTexteByChapitreId(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse,
        'ID de chapitre invalide',
        400
      );
    });
  });

  describe('getMorceauTexteById', () => {
    it('doit récupérer un morceau de texte par ID', async () => {
      mockRequest.params = { id: '1' };
      mockMorceauTexteService.getMorceauTexteById = (jest.fn() as any).mockResolvedValue(mockMorceauTexteOutput);

      await MorceauTexteController.getMorceauTexteById(mockRequest as Request, mockResponse as Response);

      expect(mockMorceauTexteService.getMorceauTexteById).toHaveBeenCalledWith(1);
      expect(mockResponseUtil.success).toHaveBeenCalledWith(
        mockResponse,
        mockMorceauTexteOutput,
        'Morceau de texte récupéré avec succès'
      );
    });

    it('doit retourner 404 si morceau non trouvé', async () => {
      mockRequest.params = { id: '999' };
      mockMorceauTexteService.getMorceauTexteById = (jest.fn() as any).mockResolvedValue(null);

      await MorceauTexteController.getMorceauTexteById(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.notFound).toHaveBeenCalledWith(
        mockResponse,
        'Morceau de texte non trouvé'
      );
    });
  });

  describe('getMorceauTexteByUuid', () => {
    it('doit récupérer un morceau de texte par UUID', async () => {
      mockRequest.params = { uuid: 'test-uuid-123' };
      mockMorceauTexteService.getMorceauTexteByUuid = (jest.fn() as any).mockResolvedValue(mockMorceauTexteOutput);

      await MorceauTexteController.getMorceauTexteByUuid(mockRequest as Request, mockResponse as Response);

      expect(mockMorceauTexteService.getMorceauTexteByUuid).toHaveBeenCalledWith('test-uuid-123');
      expect(mockResponseUtil.success).toHaveBeenCalledWith(
        mockResponse,
        mockMorceauTexteOutput,
        'Morceau de texte récupéré avec succès'
      );
    });
  });

  describe('createMorceauTexte', () => {
    it('doit créer un nouveau morceau de texte avec succès', async () => {
      mockRequest.body = {
        chapitreId: 1,
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: 'Nouveau contenu',
        ordre: 1,
      };
      mockMorceauTexteService.createMorceauTexte = (jest.fn() as any).mockResolvedValue(mockMorceauTexteOutput);

      await MorceauTexteController.createMorceauTexte(mockRequest as Request, mockResponse as Response);

      expect(mockMorceauTexteService.createMorceauTexte).toHaveBeenCalledWith({
        chapitreId: 1,
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: 'Nouveau contenu',
        ordre: 1,
      });
      expect(mockResponseUtil.created).toHaveBeenCalledWith(
        mockResponse,
        mockMorceauTexteOutput,
        'Morceau de texte créé avec succès'
      );
    });

    it('doit retourner une erreur pour données manquantes', async () => {
      mockRequest.body = { chapitreId: 1, type: TypeMorceauTexte.PARAGRAPHE }; // manque contenu et ordre

      await MorceauTexteController.createMorceauTexte(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse,
        'ChapitreId, type, contenu et ordre sont requis',
        400
      );
    });

    it('doit retourner une erreur pour chapitreId invalide', async () => {
      mockRequest.body = {
        chapitreId: 'invalid',
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: 'Test',
        ordre: 1,
      };

      await MorceauTexteController.createMorceauTexte(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse,
        'chapitreId doit être un nombre',
        400
      );
    });

    it('doit retourner une erreur pour type invalide', async () => {
      mockRequest.body = {
        chapitreId: 1,
        type: 'type_invalide',
        contenu: 'Test',
        ordre: 1,
      };

      await MorceauTexteController.createMorceauTexte(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse,
        'Type invalide. Types acceptés: paragraphe, citation, dialogue',
        400
      );
    });
  });

  describe('Tests des différents types de morceaux', () => {
    const typesValides = [
      TypeMorceauTexte.PARAGRAPHE,
      TypeMorceauTexte.CITATION,
      TypeMorceauTexte.DIALOGUE,
    ];

    typesValides.forEach(type => {
      it(`doit accepter le type ${type}`, async () => {
        mockRequest.body = {
          chapitreId: 1,
          type,
          contenu: 'Test content',
          ordre: 1,
        };
        mockMorceauTexteService.createMorceauTexte = (jest.fn() as any).mockResolvedValue(mockMorceauTexteOutput);

        await MorceauTexteController.createMorceauTexte(mockRequest as Request, mockResponse as Response);

        expect(mockMorceauTexteService.createMorceauTexte).toHaveBeenCalledWith({
          chapitreId: 1,
          type,
          contenu: 'Test content',
          ordre: 1,
        });
      });
    });
  });

  describe('updateMorceauTexte', () => {
    it('doit mettre à jour un morceau de texte avec succès', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { contenu: 'Contenu modifié' };
      mockMorceauTexteService.updateMorceauTexte = (jest.fn() as any).mockResolvedValue(mockMorceauTexteOutput);

      await MorceauTexteController.updateMorceauTexte(mockRequest as Request, mockResponse as Response);

      expect(mockMorceauTexteService.updateMorceauTexte).toHaveBeenCalledWith(1, {
        chapitreId: undefined,
        type: undefined,
        contenu: 'Contenu modifié',
        ordre: undefined,
      });
      expect(mockResponseUtil.success).toHaveBeenCalledWith(
        mockResponse,
        mockMorceauTexteOutput,
        'Morceau de texte mis à jour avec succès'
      );
    });

    it('doit retourner 404 si morceau non trouvé', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { contenu: 'Test' };
      mockMorceauTexteService.updateMorceauTexte = (jest.fn() as any).mockResolvedValue(null);

      await MorceauTexteController.updateMorceauTexte(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.notFound).toHaveBeenCalledWith(
        mockResponse,
        'Morceau de texte non trouvé'
      );
    });

    it('doit retourner une erreur pour type invalide lors de la mise à jour', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { type: 'type_invalide' };

      await MorceauTexteController.updateMorceauTexte(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse,
        'Type invalide. Types acceptés: paragraphe, citation, dialogue',
        400
      );
    });
  });

  describe('deleteMorceauTexte', () => {
    it('doit supprimer un morceau de texte avec succès', async () => {
      mockRequest.params = { id: '1' };
      mockMorceauTexteService.deleteMorceauTexte = (jest.fn() as any).mockResolvedValue(true);

      await MorceauTexteController.deleteMorceauTexte(mockRequest as Request, mockResponse as Response);

      expect(mockMorceauTexteService.deleteMorceauTexte).toHaveBeenCalledWith(1);
      expect(mockResponseUtil.success).toHaveBeenCalledWith(
        mockResponse,
        null,
        'Morceau de texte supprimé avec succès'
      );
    });

    it('doit retourner 404 si morceau non trouvé', async () => {
      mockRequest.params = { id: '999' };
      mockMorceauTexteService.deleteMorceauTexte = (jest.fn() as any).mockResolvedValue(false);

      await MorceauTexteController.deleteMorceauTexte(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.notFound).toHaveBeenCalledWith(
        mockResponse,
        'Morceau de texte non trouvé'
      );
    });
  });

  describe('Gestion des erreurs', () => {
    it('doit gérer les erreurs de service', async () => {
      mockRequest.params = { id: '1' };
      const mockError = new Error('Erreur de service');
      mockMorceauTexteService.getMorceauTexteById = (jest.fn() as any).mockRejectedValue(mockError);

      await MorceauTexteController.getMorceauTexteById(mockRequest as Request, mockResponse as Response);

      expect(mockResponseUtil.handleError).toHaveBeenCalledWith(
        mockResponse,
        mockError,
        'la récupération du morceau de texte'
      );
    });
  });
}); 