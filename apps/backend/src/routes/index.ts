import { Router } from 'express';
import chapitreRoutes from './chapitre.routes.js';
import morceauTexteRoutes from './morceauTexte.routes.js';
import storyRoutes from './story.routes.js';

const router = Router();

// Route de base pour vérifier que l'API fonctionne
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes des stories
router.use('/stories', storyRoutes);

// Routes des chapitres
router.use('/chapitres', chapitreRoutes);

// Routes des morceaux de texte
router.use('/morceaux-texte', morceauTexteRoutes);

// Route pour les chapitres d'une story spécifique
router.use('/stories/:storyId/chapitres', (req, res, next) => {
  req.params.storyId = req.params.storyId;
  next();
}, chapitreRoutes);

// Route pour les morceaux de texte d'un chapitre spécifique
router.use('/chapitres/:chapitreId/morceaux-texte', (req, res, next) => {
  req.params.chapitreId = req.params.chapitreId;
  next();
}, morceauTexteRoutes);

export default router; 