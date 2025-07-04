import { Router } from 'express';
import { StoryController } from '../controllers/story.controller.js';

const router = Router();

// Routes pour les stories
router.get('/', StoryController.getAllStories);
// Routes spécifiques (doivent être avant /:id)
router.get('/auteur/:auteur', StoryController.getStoriesByAuteur);
router.get('/statut/:statut', StoryController.getStoriesByStatut);
router.get('/uuid/:uuid', StoryController.getStoryByUuid);
router.get('/identifier/:identifier', StoryController.getStoryByIdOrUuidOrSlug);
// Route générique (doit être en dernier)
router.get('/:id', StoryController.getStoryById);
router.post('/', StoryController.createStory);
router.put('/:id', StoryController.updateStory);
router.delete('/:id', StoryController.deleteStory);

export default router; 