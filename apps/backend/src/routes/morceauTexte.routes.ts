import { Router } from 'express';
import { MorceauTexteController } from '../controllers/morceauTexte.controller.js';

const router = Router();

// Routes pour les morceaux de texte
router.get('/', MorceauTexteController.getMorceauxTexteByChapitreId); // Sera utilisé avec /api/chapitres/:chapitreId/morceaux-texte
router.get('/:id', MorceauTexteController.getMorceauTexteById);
router.post('/', MorceauTexteController.createMorceauTexte);
router.put('/:id', MorceauTexteController.updateMorceauTexte);
router.delete('/:id', MorceauTexteController.deleteMorceauTexte);

export default router; 