import { Request, Response } from 'express';
import { StoryService } from '../services/story.service.js';

export class StoryController {
  // GET /api/stories
  public static async getAllStories(req: Request, res: Response) {
    try {
      const stories = await StoryService.getAllStories();
      res.json(stories);
    } catch (error) {
      console.error('Erreur lors de la récupération des stories:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // GET /api/stories/:id
  public static async getStoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        return res.status(400).json({ error: 'ID invalide' });
      }
      
      const story = await StoryService.getStoryById(numericId);
      
      if (!story) {
        return res.status(404).json({ error: 'Story non trouvée' });
      }
      
      res.json(story);
    } catch (error) {
      console.error('Erreur lors de la récupération de la story:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // GET /api/stories/uuid/:uuid
  public static async getStoryByUuid(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const story = await StoryService.getStoryByUuid(uuid);
      
      if (!story) {
        return res.status(404).json({ error: 'Story non trouvée' });
      }
      
      res.json(story);
    } catch (error) {
      console.error('Erreur lors de la récupération de la story:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // GET /api/stories/identifier/:identifier - Récupère par ID, UUID ou slug
  public static async getStoryByIdOrUuidOrSlug(req: Request, res: Response) {
    try {
      const { identifier } = req.params;
      
      // Essayer de convertir en nombre si possible
      const numericId = parseInt(identifier, 10);
      const searchIdentifier = isNaN(numericId) ? identifier : numericId;
      
      const story = await StoryService.getStoryByIdOrUuidOrSlug(searchIdentifier);
      
      if (!story) {
        return res.status(404).json({ error: 'Story non trouvée' });
      }
      
      res.json(story);
    } catch (error) {
      console.error('Erreur lors de la récupération de la story:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // GET /api/stories/auteur/:auteur
  public static async getStoriesByAuteur(req: Request, res: Response) {
    try {
      const { auteur } = req.params;
      const stories = await StoryService.getStoriesByAuteur(auteur);
      res.json(stories);
    } catch (error) {
      console.error('Erreur lors de la récupération des stories par auteur:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // GET /api/stories/statut/:statut
  public static async getStoriesByStatut(req: Request, res: Response) {
    try {
      const { statut } = req.params;
      
      if (!['brouillon', 'en_cours', 'terminee', 'publiee'].includes(statut)) {
        return res.status(400).json({ error: 'Statut invalide' });
      }
      
      const stories = await StoryService.getStoriesByStatut(statut as 'brouillon' | 'en_cours' | 'terminee' | 'publiee');
      res.json(stories);
    } catch (error) {
      console.error('Erreur lors de la récupération des stories par statut:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // POST /api/stories
  public static async createStory(req: Request, res: Response) {
    try {
      const { titre, description, auteur, statut } = req.body;
      
      if (!titre || !auteur) {
        return res.status(400).json({ error: 'Titre et auteur sont requis' });
      }
      
      if (statut && !['brouillon', 'en_cours', 'terminee', 'publiee'].includes(statut)) {
        return res.status(400).json({ error: 'Statut invalide' });
      }
      
      const story = await StoryService.createStory({ titre, description, auteur, statut });
      res.status(201).json(story);
    } catch (error) {
      console.error('Erreur lors de la création de la story:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // PUT /api/stories/:id
  public static async updateStory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        return res.status(400).json({ error: 'ID invalide' });
      }
      
      const { titre, description, auteur, statut } = req.body;
      
      if (statut && !['brouillon', 'en_cours', 'terminee', 'publiee'].includes(statut)) {
        return res.status(400).json({ error: 'Statut invalide' });
      }
      
      const story = await StoryService.updateStory(numericId, { titre, description, auteur, statut });
      
      if (!story) {
        return res.status(404).json({ error: 'Story non trouvée' });
      }
      
      res.json(story);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la story:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // DELETE /api/stories/:id
  public static async deleteStory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        return res.status(400).json({ error: 'ID invalide' });
      }
      
      const success = await StoryService.deleteStory(numericId);
      
      if (!success) {
        return res.status(404).json({ error: 'Story non trouvée' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Erreur lors de la suppression de la story:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }
} 