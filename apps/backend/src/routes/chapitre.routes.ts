import { Router } from 'express';
import { ChapitreController } from '../controllers/chapitre.controller.js';
import { MorceauTexteController } from '../controllers/morceauTexte.controller.js';

const router = Router();

// Routes pour les chapitres
router.get('/', ChapitreController.getAllChapitres);
// Routes spécifiques (doivent être avant /:id)
router.get('/uuid/:uuid', ChapitreController.getChapitreByUuid);
router.get('/identifier/:identifier', ChapitreController.getChapitreByIdOrUuidOrSlug);
router.get('/:id', ChapitreController.getChapitreById);
router.post('/', ChapitreController.createChapitre);
router.put('/:id', ChapitreController.updateChapitre);
router.delete('/:id', ChapitreController.deleteChapitre);

// Routes pour les morceaux de texte d'un chapitre
router.get('/:chapitreId/morceaux-texte', MorceauTexteController.getMorceauxTexteByChapitreId);

export default router; 