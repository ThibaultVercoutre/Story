import { Router } from 'express';
import { StoryController } from '../controllers/story.controller.js';

const router = Router();

// Routes pour les stories
router.get('/', StoryController.getAllStories);
router.get('/auteur/:auteur', StoryController.getStoriesByAuteur);
router.get('/statut/:statut', StoryController.getStoriesByStatut);
router.get('/:id', StoryController.getStoryById);
router.post('/', StoryController.createStory);
router.put('/:id', StoryController.updateStory);
router.delete('/:id', StoryController.deleteStory);

export default router; 