import { ResponseUtil } from '../../utils/response.util.js';
import { Response } from 'express';

describe('ResponseUtil', () => {
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
  });

  describe('success', () => {
    it('devrait retourner une réponse de succès avec données', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'Opération réussie';
      
      ResponseUtil.success(mockRes as Response, data, message);
      
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Opération réussie',
        data: { id: 1, name: 'Test' },
      });
    });

    it('devrait retourner une réponse de succès sans données', () => {
      ResponseUtil.success(mockRes as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
      });
    });

    it('devrait retourner une réponse de succès avec un code de statut personnalisé', () => {
      const data = { id: 1 };
      
      ResponseUtil.success(mockRes as Response, data, 'Créé', 201);
      
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Créé',
        data: { id: 1 },
      });
    });

    it('devrait retourner une réponse de succès avec seulement un message', () => {
      ResponseUtil.success(mockRes as Response, undefined, 'Message seulement');
      
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Message seulement',
      });
    });
  });

  describe('error', () => {
    it('devrait retourner une réponse d\'erreur basique', () => {
      ResponseUtil.error(mockRes as Response, 'Erreur test');
      
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur test',
      });
    });

    it('devrait retourner une réponse d\'erreur avec code personnalisé', () => {
      ResponseUtil.error(mockRes as Response, 'Erreur test', 400);
      
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur test',
      });
    });

    it('devrait retourner une réponse d\'erreur avec détails', () => {
      ResponseUtil.error(mockRes as Response, 'Erreur test', 400, 'Détails de l\'erreur');
      
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur test',
        error: 'Détails de l\'erreur',
      });
    });
  });

  describe('validationError', () => {
    it('devrait retourner une réponse d\'erreur de validation', () => {
      const errors = {
        email: 'Email invalide',
        password: 'Mot de passe requis',
      };
      
      ResponseUtil.validationError(mockRes as Response, errors);
      
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Erreurs de validation',
        errors,
      });
    });

    it('devrait retourner une réponse d\'erreur de validation avec message personnalisé', () => {
      const errors = { field: 'Erreur' };
      
      ResponseUtil.validationError(mockRes as Response, errors, 'Message personnalisé');
      
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Message personnalisé',
        errors,
      });
    });
  });

  describe('notFound', () => {
    it('devrait retourner une réponse 404 avec message par défaut', () => {
      ResponseUtil.notFound(mockRes as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Ressource non trouvée',
      });
    });

    it('devrait retourner une réponse 404 avec message personnalisé', () => {
      ResponseUtil.notFound(mockRes as Response, 'Utilisateur non trouvé');
      
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    });
  });

  describe('unauthorized', () => {
    it('devrait retourner une réponse 401', () => {
      ResponseUtil.unauthorized(mockRes as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Accès non autorisé',
      });
    });
  });

  describe('forbidden', () => {
    it('devrait retourner une réponse 403', () => {
      ResponseUtil.forbidden(mockRes as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Accès interdit',
      });
    });
  });

  describe('conflict', () => {
    it('devrait retourner une réponse 409', () => {
      ResponseUtil.conflict(mockRes as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Conflit avec la ressource existante',
      });
    });
  });

  describe('created', () => {
    it('devrait retourner une réponse 201 avec données', () => {
      const data = { id: 1, name: 'Test' };
      
      ResponseUtil.created(mockRes as Response, data);
      
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Ressource créée avec succès',
        data,
      });
    });

    it('devrait retourner une réponse 201 avec message personnalisé', () => {
      const data = { id: 1 };
      
      ResponseUtil.created(mockRes as Response, data, 'Utilisateur créé');
      
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Utilisateur créé',
        data,
      });
    });
  });

  describe('handleError', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('devrait gérer les erreurs de validation', () => {
      const error = {
        name: 'ValidationError',
        errors: {
          email: 'Email invalide',
          password: 'Mot de passe requis',
        },
      };
      
      ResponseUtil.handleError(mockRes as Response, error, 'Test');
      
      expect(consoleSpy).toHaveBeenCalledWith('Erreur lors de Test:', error);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Erreurs de validation',
        errors: error.errors,
      });
    });

    it('devrait gérer les erreurs de validation Sequelize', () => {
      const error = {
        name: 'SequelizeValidationError',
        errors: [
          { path: 'email', message: 'Email invalide' },
          { path: 'password', message: 'Mot de passe requis' },
        ],
      };
      
      ResponseUtil.handleError(mockRes as Response, error);
      
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Erreurs de validation',
        errors: {
          email: 'Email invalide',
          password: 'Mot de passe requis',
        },
      });
    });

    it('devrait gérer les erreurs de contrainte unique Sequelize', () => {
      const error = {
        name: 'SequelizeUniqueConstraintError',
      };
      
      ResponseUtil.handleError(mockRes as Response, error);
      
      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Une ressource avec ces propriétés existe déjà',
      });
    });

    it('devrait gérer les erreurs génériques', () => {
      const error = new Error('Erreur générique');
      
      ResponseUtil.handleError(mockRes as Response, error);
      
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur interne du serveur',
      });
    });
  });
}); 