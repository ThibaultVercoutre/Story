import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import {
  validate,
  validateParams,
  validateQuery,
  validateRegister,
  validateLogin,
  validateSaga,
  validateStory,
  validateChapitre,
  validateId,
  validateUUID,
  validateStatut,
  validatePartialUpdate
} from '../../middleware/validation.middleware.js';
import { ResponseUtil } from '../../utils/response.util.js';
import { ValidationUtil, ValidationResult } from '../../utils/validation.util.js';

// Mock des dépendances
jest.mock('../../utils/response.util.js');
jest.mock('../../utils/validation.util.js');

const mockResponseUtil = ResponseUtil as jest.MockedClass<typeof ResponseUtil>;
const mockValidationUtil = ValidationUtil as jest.MockedClass<typeof ValidationUtil>;

xdescribe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeAll(() => {
    // Configuration des mocks de base avant que les middlewares soient créés
    mockValidationUtil.validateRegisterData = jest.fn().mockReturnValue({ isValid: true, errors: {} }) as never;
    mockValidationUtil.validateLoginData = jest.fn().mockReturnValue({ isValid: true, errors: {} }) as never;
    mockValidationUtil.validateSagaData = jest.fn().mockReturnValue({ isValid: true, errors: {} }) as never;
    mockValidationUtil.validateStoryData = jest.fn().mockReturnValue({ isValid: true, errors: {} }) as never;
    mockValidationUtil.validateChapitreData = jest.fn().mockReturnValue({ isValid: true, errors: {} }) as never;
    mockValidationUtil.validateId = jest.fn().mockReturnValue({ isValid: true, errors: {} }) as never;
    mockValidationUtil.validateUUID = jest.fn().mockReturnValue(true) as never;
    mockValidationUtil.validateStatut = jest.fn().mockReturnValue(true) as never;
  });

  beforeEach(() => {
    // Reset seulement les compteurs d'appels, pas les implémentations
    jest.clearAllMocks();
    
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis() as never,
      json: jest.fn() as never,
    };

    mockNext = jest.fn();
    
    // Mock des méthodes ResponseUtil
    mockResponseUtil.validationError = jest.fn() as never;
  });

  describe('validate (middleware générique)', () => {
    it('doit appeler next() si la validation réussit', () => {
      const mockValidationFn = jest.fn().mockReturnValue({
        isValid: true,
        errors: {}
      }) as never;

      const middleware = validate(mockValidationFn);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockValidationFn).toHaveBeenCalledWith(mockRequest.body);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponseUtil.validationError).not.toHaveBeenCalled();
    });

    it('doit retourner une erreur si la validation échoue', () => {
      const mockErrors = { email: 'Email invalide' };
      const mockValidationFn = jest.fn().mockReturnValue({
        isValid: false,
        errors: mockErrors
      }) as never;

      const middleware = validate(mockValidationFn);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockValidationFn).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponseUtil.validationError).toHaveBeenCalledWith(mockResponse, mockErrors);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateParams', () => {
    it('doit valider les paramètres d\'URL', () => {
      const mockValidationFn = jest.fn().mockReturnValue({
        isValid: true,
        errors: {}
      }) as never;

      mockRequest.params = { id: '123' };

      const middleware = validateParams(mockValidationFn);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockValidationFn).toHaveBeenCalledWith(mockRequest.params);
      expect(mockNext).toHaveBeenCalled();
    });

    it('doit retourner une erreur pour des paramètres invalides', () => {
      const mockErrors = { id: 'ID invalide' };
      const mockValidationFn = jest.fn().mockReturnValue({
        isValid: false,
        errors: mockErrors
      }) as never;

      mockRequest.params = { id: 'invalid' };

      const middleware = validateParams(mockValidationFn);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponseUtil.validationError).toHaveBeenCalledWith(mockResponse, mockErrors);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateQuery', () => {
    it('doit valider les paramètres de requête', () => {
      const mockValidationFn = jest.fn().mockReturnValue({
        isValid: true,
        errors: {}
      }) as never;

      mockRequest.query = { page: '1', limit: '10' };

      const middleware = validateQuery(mockValidationFn);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockValidationFn).toHaveBeenCalledWith(mockRequest.query);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateRegister', () => {
    it('doit utiliser ValidationUtil.validateRegisterData', () => {
      mockValidationUtil.validateRegisterData = jest.fn().mockReturnValue({
        isValid: true,
        errors: {}
      }) as never;

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      validateRegister(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockValidationUtil.validateRegisterData).toHaveBeenCalledWith(mockRequest.body);
      expect(mockNext).toHaveBeenCalled();
    });

    it('doit retourner une erreur pour des données d\'inscription invalides', () => {
      const mockErrors = { email: 'Email invalide' };
      mockValidationUtil.validateRegisterData = jest.fn().mockReturnValue({
        isValid: false,
        errors: mockErrors
      }) as never;

      mockRequest.body = { email: 'invalid' };

      validateRegister(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponseUtil.validationError).toHaveBeenCalledWith(mockResponse, mockErrors);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateLogin', () => {
    it('doit utiliser ValidationUtil.validateLoginData', () => {
      mockValidationUtil.validateLoginData = jest.fn().mockReturnValue({
        isValid: true,
        errors: {}
      }) as never;

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      validateLogin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockValidationUtil.validateLoginData).toHaveBeenCalledWith(mockRequest.body);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateSaga', () => {
    it('doit utiliser ValidationUtil.validateSagaData', () => {
      mockValidationUtil.validateSagaData = jest.fn().mockReturnValue({
        isValid: true,
        errors: {}
      }) as never;

      mockRequest.body = {
        titre: 'Ma Saga',
        auteur: 'Auteur'
      };

      validateSaga(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockValidationUtil.validateSagaData).toHaveBeenCalledWith(mockRequest.body);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateStory', () => {
    it('doit utiliser ValidationUtil.validateStoryData', () => {
      mockValidationUtil.validateStoryData = jest.fn().mockReturnValue({
        isValid: true,
        errors: {}
      }) as never;

      mockRequest.body = {
        titre: 'Ma Story',
        auteur: 'Auteur'
      };

      validateStory(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockValidationUtil.validateStoryData).toHaveBeenCalledWith(mockRequest.body);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateChapitre', () => {
    it('doit utiliser ValidationUtil.validateChapitreData', () => {
      mockValidationUtil.validateChapitreData = jest.fn().mockReturnValue({
        isValid: true,
        errors: {}
      }) as never;

      mockRequest.body = {
        titre: 'Mon Chapitre',
        numero: 1,
        storyId: 1
      };

      validateChapitre(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockValidationUtil.validateChapitreData).toHaveBeenCalledWith(mockRequest.body);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateId', () => {
    it('doit valider un ID valide', () => {
      mockValidationUtil.validateId = jest.fn().mockReturnValue({
        isValid: true,
        errors: {}
      }) as never;

      mockRequest.params = { id: '123' };

      validateId(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockValidationUtil.validateId).toHaveBeenCalledWith('123');
      expect(mockNext).toHaveBeenCalled();
    });

    it('doit retourner une erreur pour un ID invalide', () => {
      const mockErrors = { id: 'ID invalide' };
      mockValidationUtil.validateId = jest.fn().mockReturnValue({
        isValid: false,
        errors: mockErrors
      }) as never;

      mockRequest.params = { id: 'invalid' };

      validateId(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponseUtil.validationError).toHaveBeenCalledWith(mockResponse, mockErrors);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateUUID', () => {
    it('doit valider un UUID valide', () => {
      mockValidationUtil.validateUUID = jest.fn().mockReturnValue(true) as never;

      mockRequest.params = { uuid: '123e4567-e89b-12d3-a456-426614174000' };

      validateUUID(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockValidationUtil.validateUUID).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(mockNext).toHaveBeenCalled();
    });

    it('doit retourner une erreur pour un UUID invalide', () => {
      mockValidationUtil.validateUUID = jest.fn().mockReturnValue(false) as never;

      mockRequest.params = { uuid: 'invalid-uuid' };

      validateUUID(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponseUtil.validationError).toHaveBeenCalledWith(
        mockResponse,
        { uuid: 'Format UUID invalide' }
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('doit retourner une erreur si UUID manquant', () => {
      mockRequest.params = {};

      validateUUID(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponseUtil.validationError).toHaveBeenCalledWith(
        mockResponse,
        { uuid: 'UUID requis' }
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateStatut', () => {
    it('doit valider un statut valide', () => {
      mockValidationUtil.validateStatut = jest.fn().mockReturnValue(true) as never;

      mockRequest.params = { statut: 'brouillon' };

      validateStatut(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockValidationUtil.validateStatut).toHaveBeenCalledWith('brouillon');
      expect(mockNext).toHaveBeenCalled();
    });

    it('doit retourner une erreur pour un statut invalide', () => {
      mockValidationUtil.validateStatut = jest.fn().mockReturnValue(false) as never;

      mockRequest.params = { statut: 'statut_invalide' };

      validateStatut(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponseUtil.validationError).toHaveBeenCalledWith(
        mockResponse,
        { statut: 'Statut invalide. Valeurs acceptées: brouillon, en_cours, terminee, publiee' }
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('doit retourner une erreur si statut manquant', () => {
      mockRequest.params = {};

      validateStatut(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponseUtil.validationError).toHaveBeenCalledWith(
        mockResponse,
        { statut: 'Statut requis' }
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validatePartialUpdate', () => {
    it('doit valider une mise à jour partielle valide', () => {
      const mockValidationFn = jest.fn().mockReturnValue({
        isValid: true,
        errors: {}
      }) as never;

      mockRequest.body = { titre: 'Nouveau titre' };

      const middleware = validatePartialUpdate(mockValidationFn);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockValidationFn).toHaveBeenCalledWith(mockRequest.body);
      expect(mockNext).toHaveBeenCalled();
    });

    it('doit retourner une erreur pour un body vide', () => {
      const mockValidationFn = jest.fn() as never;

      mockRequest.body = {};

      const middleware = validatePartialUpdate(mockValidationFn);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponseUtil.validationError).toHaveBeenCalledWith(
        mockResponse,
        { update: 'Aucune donnée à mettre à jour' }
      );
      expect(mockValidationFn).not.toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('doit retourner une erreur si la validation échoue', () => {
      const mockErrors = { titre: 'Titre invalide' };
      const mockValidationFn = jest.fn().mockReturnValue({
        isValid: false,
        errors: mockErrors
      }) as never;

      mockRequest.body = { titre: '' };

      const middleware = validatePartialUpdate(mockValidationFn);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponseUtil.validationError).toHaveBeenCalledWith(mockResponse, mockErrors);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Tests d\'intégration des validations', () => {
    it('doit enchaîner plusieurs validations', () => {
      mockValidationUtil.validateRegisterData = jest.fn().mockReturnValue({
        isValid: true,
        errors: {}
      }) as never;

      mockValidationUtil.validateId = jest.fn().mockReturnValue({
        isValid: true,
        errors: {}
      }) as never;

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      mockRequest.params = { id: '123' };

      // Simuler l'enchaînement de validations
      validateRegister(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Reset next mock
      mockNext.mockClear();

      validateId(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });
}); 