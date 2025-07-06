import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserService, LoginCredentials, UserInput } from '../services/user.service.js';
import { ResponseUtil } from '../utils/response.util.js';
import { ValidationUtil } from '../utils/validation.util.js';

export class AuthController {
  private static readonly JWT_SECRET = process.env.JWT_SECRET;
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

  // Vérifier que la clé JWT est définie
  private static validateJWTSecret(): void {
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET must be defined in environment variables for security. Please set JWT_SECRET in your .env file.');
    }
  }

  // Inscription
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      // Vérifier la configuration JWT
      AuthController.validateJWTSecret();
      
      const { email, nom, password } = req.body;

      // Validation des données
      const validation = ValidationUtil.validateRegisterData({ email, nom, password });
      if (!validation.isValid) {
        ResponseUtil.validationError(res, validation.errors);
        return;
      }

      // Vérifier si l'email existe déjà
      const existingUser = await UserService.emailExists(email);
      if (existingUser) {
        ResponseUtil.conflict(res, 'Un utilisateur avec cet email existe déjà');
        return;
      }

      // Créer l'utilisateur
      const userData: UserInput = { email, nom, password };
      const user = await UserService.createUser(userData);

      // Générer le token JWT
      const token = jwt.sign(
        { userId: user.id, uuid: user.uuid },
        AuthController.JWT_SECRET!,
        { expiresIn: AuthController.JWT_EXPIRES_IN } as SignOptions
      );

      ResponseUtil.created(res, {
        token,
        user: {
          id: user.id,
          uuid: user.uuid,
          email: user.email,
          nom: user.nom
        }
      }, 'Utilisateur créé avec succès');
    } catch (error) {
      ResponseUtil.handleError(res, error, 'l\'inscription');
    }
  }

  // Connexion
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      // Vérifier la configuration JWT
      AuthController.validateJWTSecret();
      
      const { email, password } = req.body;

      // Validation des données
      const validation = ValidationUtil.validateLoginData({ email, password });
      if (!validation.isValid) {
        ResponseUtil.validationError(res, validation.errors);
        return;
      }

      // Authentifier l'utilisateur
      const credentials: LoginCredentials = { email, password };
      const user = await UserService.authenticateUser(credentials);

      if (!user) {
        ResponseUtil.unauthorized(res, 'Email ou mot de passe incorrect');
        return;
      }

      // Générer le token JWT
      const token = jwt.sign(
        { userId: user.id, uuid: user.uuid },
        AuthController.JWT_SECRET!,
        { expiresIn: AuthController.JWT_EXPIRES_IN } as SignOptions
      );

      ResponseUtil.success(res, {
        token,
        user: {
          id: user.id,
          uuid: user.uuid,
          email: user.email,
          nom: user.nom
        }
      }, 'Connexion réussie');
    } catch (error) {
      ResponseUtil.handleError(res, error, 'la connexion');
    }
  }

  // Récupérer l'utilisateur connecté
  public static async getUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      
      const user = await UserService.getUserById(userId);
      
      if (!user) {
        ResponseUtil.notFound(res, 'Utilisateur non trouvé');
        return;
      }

      ResponseUtil.success(res, {
        user: {
          id: user.id,
          uuid: user.uuid,
          email: user.email,
          nom: user.nom
        }
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'la récupération de l\'utilisateur');
    }
  }

  // Déconnexion
  public static async logout(req: Request, res: Response): Promise<void> {
    try {
      // En fait, avec JWT, on ne peut pas vraiment "déconnecter" côté serveur
      // La déconnexion se fait côté client en supprimant le token
      ResponseUtil.success(res, null, 'Déconnexion réussie');
    } catch (error) {
      ResponseUtil.handleError(res, error, 'la déconnexion');
    }
  }

  // Middleware pour vérifier le token JWT
  public static authenticateToken(req: Request, res: Response, next: Function): void {
    try {
      AuthController.validateJWTSecret();
      
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        ResponseUtil.unauthorized(res, 'Token d\'accès requis');
        return;
      }

      jwt.verify(token, AuthController.JWT_SECRET!, (err: any, user: any) => {
        if (err) {
          ResponseUtil.forbidden(res, 'Token invalide');
          return;
        }

        (req as any).user = user;
        next();
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'la vérification du token');
    }
  }
} 