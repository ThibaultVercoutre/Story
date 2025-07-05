import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserService, LoginCredentials, UserInput } from '../services/user.service.js';

export class AuthController {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this-in-production';
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

  // Vérifier que la clé JWT est définie
  private static validateJWTSecret(): void {
    console.log('🔍 JWT_SECRET value:', process.env.JWT_SECRET ? 'DEFINED' : 'UNDEFINED');
    console.log('🔍 Final JWT_SECRET:', AuthController.JWT_SECRET ? 'DEFINED' : 'UNDEFINED');
    
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️  WARNING: JWT_SECRET not found in environment variables! Using fallback key.');
      console.log('📝 Please create a .env file with JWT_SECRET variable.');
    }
  }

  // Inscription
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      // Vérifier la configuration JWT
      AuthController.validateJWTSecret();
      
      const { email, nom, password } = req.body;

      // Validation des données
      if (!email || !nom || !password) {
        res.status(400).json({
          message: 'Tous les champs sont requis (email, nom, password)'
        });
        return;
      }

      // Vérifier si l'email existe déjà
      const existingUser = await UserService.emailExists(email);
      if (existingUser) {
        res.status(409).json({
          message: 'Un utilisateur avec cet email existe déjà'
        });
        return;
      }

      // Créer l'utilisateur
      const userData: UserInput = { email, nom, password };
      const user = await UserService.createUser(userData);

      // Générer le token JWT
      const token = jwt.sign(
        { userId: user.id, uuid: user.uuid },
        AuthController.JWT_SECRET,
        { expiresIn: AuthController.JWT_EXPIRES_IN } as SignOptions
      );

      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        token,
        user: {
          id: user.id,
          uuid: user.uuid,
          email: user.email,
          nom: user.nom
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({
        message: 'Erreur interne du serveur'
      });
    }
  }

  // Connexion
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      // Vérifier la configuration JWT
      AuthController.validateJWTSecret();
      
      const { email, password } = req.body;

      // Validation des données
      if (!email || !password) {
        res.status(400).json({
          message: 'Email et mot de passe requis'
        });
        return;
      }

      // Authentifier l'utilisateur
      const credentials: LoginCredentials = { email, password };
      const user = await UserService.authenticateUser(credentials);

      if (!user) {
        res.status(401).json({
          message: 'Email ou mot de passe incorrect'
        });
        return;
      }

      // Générer le token JWT
      const token = jwt.sign(
        { userId: user.id, uuid: user.uuid },
        AuthController.JWT_SECRET,
        { expiresIn: AuthController.JWT_EXPIRES_IN } as SignOptions
      );

      res.json({
        message: 'Connexion réussie',
        token,
        user: {
          id: user.id,
          uuid: user.uuid,
          email: user.email,
          nom: user.nom
        }
      });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({
        message: 'Erreur interne du serveur'
      });
    }
  }

  // Récupérer les informations de l'utilisateur connecté
  public static async getUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      const user = await UserService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          message: 'Utilisateur non trouvé'
        });
        return;
      }

      res.json({
        user: {
          id: user.id,
          uuid: user.uuid,
          email: user.email,
          nom: user.nom
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      res.status(500).json({
        message: 'Erreur interne du serveur'
      });
    }
  }

  // Déconnexion (côté client principalement)
  public static async logout(req: Request, res: Response): Promise<void> {
    try {
      // Pour l'instant, la déconnexion est gérée côté client
      // On pourrait ajouter une blacklist de tokens ici si nécessaire
      res.json({
        message: 'Déconnexion réussie'
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      res.status(500).json({
        message: 'Erreur interne du serveur'
      });
    }
  }

  // Middleware pour vérifier le token JWT
  public static authenticateToken(req: Request, res: Response, next: Function): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        message: 'Token d\'accès requis'
      });
      return;
    }

    jwt.verify(token, AuthController.JWT_SECRET, (err: any, user: any) => {
      if (err) {
        res.status(403).json({
          message: 'Token invalide'
        });
        return;
      }

      (req as any).user = user;
      next();
    });
  }
} 