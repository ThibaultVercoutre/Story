import { Router } from 'express';
import { TestController } from '../controllers/test.controller.js';
import { generalRateLimit, strictRateLimit } from '../middleware/rate-limit.middleware.js';

const router = Router();

/**
 * Routes de test de performance
 * Utilisées pour tester les performances de déchiffrement et les requêtes complexes
 */

// Route d'information - toujours accessible
router.get('/info', TestController.getTestInfo);

// Route de santé - avec limitation légère
router.get('/health', generalRateLimit, TestController.getHealthCheck);

// Routes de statistiques - rapides mais limitées
router.get('/stats', generalRateLimit, TestController.getPerformanceStats);

// Routes d'échantillons - avec limitation standard
router.get('/sample', generalRateLimit, TestController.getTestSample);
router.get('/sample/:limit', generalRateLimit, TestController.getTestSample);

// Route de test complet - avec limitation stricte pour éviter la surcharge
router.get('/users-full', TestController.getAllUsersWithFullData);

// Route de test DANGEREUX - vraiment toutes les données sans limite
router.get('/users-full-dangerous', TestController.getAllUsersFullDataDangerous);

export default router; 