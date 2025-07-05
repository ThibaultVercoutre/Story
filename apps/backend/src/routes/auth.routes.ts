import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';

const router = Router();

// Route d'inscription
router.post('/register', AuthController.register);

// Route de connexion
router.post('/login', AuthController.login);

// Route de déconnexion
router.post('/logout', AuthController.logout);

// Route pour récupérer l'utilisateur connecté (protégée)
router.get('/user', AuthController.authenticateToken, AuthController.getUser);

export default router; 