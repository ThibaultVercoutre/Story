import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthController } from '../../controllers/auth.controller.js';
import { UserService } from '../../services/user.service.js';
import { ResponseUtil } from '../../utils/response.util.js';
import { ValidationUtil } from '../../utils/validation.util.js';

// Mock des dépendances
jest.mock('../../services/user.service.js');
jest.mock('../../utils/response.util.js');
jest.mock('../../utils/validation.util.js');
jest.mock('jsonwebtoken');

const MockedUserService = UserService as jest.Mocked<typeof UserService>;
const MockedResponseUtil = ResponseUtil as jest.Mocked<typeof ResponseUtil>;
const MockedValidationUtil = ValidationUtil as jest.Mocked<typeof ValidationUtil>;
const MockedJWT = jwt as jest.Mocked<typeof jwt>;

describe('AuthController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      body: {},
      headers: {},
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    mockNext = jest.fn();
    
    // Configuration des variables d'environnement
    process.env.JWT_SECRET = 'test-jwt-secret-key';
    process.env.JWT_EXPIRES_IN = '24h';
  });

  describe('register', () => {
    const validRegisterData = {
      email: 'test@example.com',
      nom: 'Test User',
      password: 'Password123',
      confirmPassword: 'Password123',
    };

    const mockUser = {
      id: 1,
      uuid: 'test-uuid',
      email: 'test@example.com',
      nom: 'Test User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockReq.body = validRegisterData;
      MockedValidationUtil.validateRegisterData.mockReturnValue({
        isValid: true,
        errors: {},
      });
      MockedUserService.emailExists.mockResolvedValue(false);
      MockedUserService.createUser.mockResolvedValue(mockUser);
      MockedJWT.sign.mockReturnValue('test-token' as any);
    });

    it('devrait créer un utilisateur avec succès', async () => {
      await AuthController.register(mockReq as Request, mockRes as Response);

      expect(MockedValidationUtil.validateRegisterData).toHaveBeenCalledWith(validRegisterData);
      expect(MockedUserService.emailExists).toHaveBeenCalledWith(validRegisterData.email);
      expect(MockedUserService.createUser).toHaveBeenCalledWith({
        email: validRegisterData.email,
        nom: validRegisterData.nom,
        password: validRegisterData.password
      });
      expect(MockedJWT.sign).toHaveBeenCalledWith(
        { userId: mockUser.id, uuid: mockUser.uuid },
        'test-jwt-secret-key',
        { expiresIn: '24h' }
      );
      expect(MockedResponseUtil.created).toHaveBeenCalledWith(
        mockRes,
        {
          token: 'test-token',
          user: {
            id: mockUser.id,
            uuid: mockUser.uuid,
            email: mockUser.email,
            nom: mockUser.nom,
          },
        },
        'Utilisateur créé avec succès'
      );
    });

    it('devrait retourner une erreur de validation', async () => {
      MockedValidationUtil.validateRegisterData.mockReturnValue({
        isValid: false,
        errors: { email: 'Email invalide' },
      });

      await AuthController.register(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.validationError).toHaveBeenCalledWith(
        mockRes,
        { email: 'Email invalide' }
      );
    });

    it('devrait retourner une erreur si l\'email existe déjà', async () => {
      MockedUserService.emailExists.mockResolvedValue(true);

      await AuthController.register(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.conflict).toHaveBeenCalledWith(
        mockRes,
        'Un utilisateur avec cet email existe déjà'
      );
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      MockedUserService.createUser.mockRejectedValue(error);

      await AuthController.register(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.handleError).toHaveBeenCalledWith(
        mockRes,
        error,
        'l\'inscription'
      );
    });


  });

  describe('login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'Password123',
    };

    const mockUser = {
      id: 1,
      uuid: 'test-uuid',
      email: 'test@example.com',
      nom: 'Test User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockReq.body = validLoginData;
      MockedValidationUtil.validateLoginData.mockReturnValue({
        isValid: true,
        errors: {},
      });
      MockedUserService.authenticateUser.mockResolvedValue(mockUser);
      MockedJWT.sign.mockReturnValue('test-token' as any);
    });

    it('devrait connecter un utilisateur avec succès', async () => {
      await AuthController.login(mockReq as Request, mockRes as Response);

      expect(MockedValidationUtil.validateLoginData).toHaveBeenCalledWith(validLoginData);
      expect(MockedUserService.authenticateUser).toHaveBeenCalledWith(validLoginData);
      expect(MockedJWT.sign).toHaveBeenCalledWith(
        { userId: mockUser.id, uuid: mockUser.uuid },
        'test-jwt-secret-key',
        { expiresIn: '24h' }
      );
      expect(MockedResponseUtil.success).toHaveBeenCalledWith(
        mockRes,
        {
          token: 'test-token',
          user: {
            id: mockUser.id,
            uuid: mockUser.uuid,
            email: mockUser.email,
            nom: mockUser.nom,
          },
        },
        'Connexion réussie'
      );
    });

    it('devrait retourner une erreur de validation', async () => {
      MockedValidationUtil.validateLoginData.mockReturnValue({
        isValid: false,
        errors: { email: 'Email requis' },
      });

      await AuthController.login(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.validationError).toHaveBeenCalledWith(
        mockRes,
        { email: 'Email requis' }
      );
    });

    it('devrait retourner une erreur si les identifiants sont incorrects', async () => {
      MockedUserService.authenticateUser.mockResolvedValue(null);

      await AuthController.login(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.unauthorized).toHaveBeenCalledWith(
        mockRes,
        'Email ou mot de passe incorrect'
      );
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      MockedUserService.authenticateUser.mockRejectedValue(error);

      await AuthController.login(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.handleError).toHaveBeenCalledWith(
        mockRes,
        error,
        'la connexion'
      );
    });
  });

  describe('getUser', () => {
    const mockUser = {
      id: 1,
      uuid: 'test-uuid',
      email: 'test@example.com',
      nom: 'Test User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      (mockReq as any).user = { userId: 1, uuid: 'test-uuid' };
      MockedUserService.getUserById.mockResolvedValue(mockUser);
    });

    it('devrait retourner les informations utilisateur', async () => {
      await AuthController.getUser(mockReq as Request, mockRes as Response);

      expect(MockedUserService.getUserById).toHaveBeenCalledWith(1);
      expect(MockedResponseUtil.success).toHaveBeenCalledWith(
        mockRes,
        {
          user: {
            id: mockUser.id,
            uuid: mockUser.uuid,
            email: mockUser.email,
            nom: mockUser.nom,
          },
        }
      );
    });

    it('devrait retourner une erreur si l\'utilisateur n\'existe pas', async () => {
      MockedUserService.getUserById.mockResolvedValue(null);

      await AuthController.getUser(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.notFound).toHaveBeenCalledWith(
        mockRes,
        'Utilisateur non trouvé'
      );
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      MockedUserService.getUserById.mockRejectedValue(error);

      await AuthController.getUser(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.handleError).toHaveBeenCalledWith(
        mockRes,
        error,
        'la récupération de l\'utilisateur'
      );
    });
  });

  describe('logout', () => {
    it('devrait déconnecter l\'utilisateur', async () => {
      await AuthController.logout(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.success).toHaveBeenCalledWith(
        mockRes,
        null,
        'Déconnexion réussie'
      );
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Unexpected error');
      MockedResponseUtil.success.mockImplementation(() => {
        throw error;
      });

      await AuthController.logout(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.handleError).toHaveBeenCalledWith(
        mockRes,
        error,
        'la déconnexion'
      );
    });
  });

  describe('authenticateToken', () => {
    beforeEach(() => {
      mockReq.headers = {
        authorization: 'Bearer test-token',
      };
    });

    it('devrait authentifier un token valide', () => {
      const mockUser = { userId: 1, uuid: 'test-uuid' };
      MockedJWT.verify.mockImplementation((token, secret, callback) => {
        (callback as any)(null, mockUser);
      });

      AuthController.authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      expect(MockedJWT.verify).toHaveBeenCalledWith(
        'test-token',
        'test-jwt-secret-key',
        expect.any(Function)
      );
      expect((mockReq as any).user).toBe(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('devrait retourner une erreur si aucun token n\'est fourni', () => {
      mockReq.headers = {};

      AuthController.authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      expect(MockedResponseUtil.unauthorized).toHaveBeenCalledWith(
        mockRes,
        'Token d\'accès requis'
      );
    });

    it('devrait retourner une erreur si le token est invalide', () => {
      MockedJWT.verify.mockImplementation((token, secret, callback) => {
        (callback as any)(new Error('Invalid token'), null);
      });

      AuthController.authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      expect(MockedResponseUtil.forbidden).toHaveBeenCalledWith(
        mockRes,
        'Token invalide'
      );
    });



    it('devrait gérer un header d\'autorisation mal formaté', () => {
      mockReq.headers = {
        authorization: 'InvalidFormat',
      };

      AuthController.authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      expect(MockedResponseUtil.unauthorized).toHaveBeenCalledWith(
        mockRes,
        'Token d\'accès requis'
      );
    });
  });
}); 