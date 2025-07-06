import { Router } from 'express';
import chapitreRoutes from './chapitre.routes.js';
import morceauTexteRoutes from './morceauTexte.routes.js';
import sagaRoutes from './saga.routes.js';
import storyRoutes from './story.routes.js';
import authRoutes from './auth.routes.js';
import testRoutes from './test.routes.js';
import { ChapitreController } from '../controllers/chapitre.controller.js';

const router = Router();

// Route de base pour vérifier que l'API fonctionne
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes d'authentification
router.use('/auth', authRoutes);

// Routes des sagas
router.use('/sagas', sagaRoutes);

// Routes des stories
router.use('/stories', storyRoutes);

// Routes des chapitres
router.use('/chapitres', chapitreRoutes);

// Routes des morceaux de texte
router.use('/morceaux-texte', morceauTexteRoutes);

// Routes de test de performance
router.use('/test', testRoutes);

// Routes pour les chapitres d'une story spécifique
router.get('/stories/:storyId/chapitres', ChapitreController.getChapitresByStoryId);

export default router; 