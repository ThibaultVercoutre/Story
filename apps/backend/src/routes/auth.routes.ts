import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authRateLimit, strictRateLimit } from '../middleware/rate-limit.middleware.js';
import { validateRegister, validateLogin } from '../middleware/validation.middleware.js';

const router = Router();

// Route d'inscription avec rate limiting strict et validation
router.post('/register', strictRateLimit, validateRegister, AuthController.register);

// Route de connexion avec rate limiting et validation
router.post('/login', authRateLimit, validateLogin, AuthController.login);

// Route de déconnexion (pas de rate limiting nécessaire)
router.post('/logout', AuthController.logout);

// Route pour récupérer l'utilisateur connecté (protégée)
router.get('/user', AuthController.authenticateToken, AuthController.getUser);

export default router; 