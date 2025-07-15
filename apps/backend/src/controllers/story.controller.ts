import { Request, Response } from 'express';
import { StoryService } from '../services/story.service.js';
import { ResponseUtil } from '../utils/response.util.js';
import { ValidationUtil } from '../utils/validation.util.js';

export class StoryController {
  // GET /api/stories
  public static async getAllStories(req: Request, res: Response) {
    try {
      const stories = await StoryService.getAllStories();
      ResponseUtil.success(res, stories, 'Histoires récupérées avec succès');
    } catch (error) {
      console.error('Erreur lors de la récupération des stories:', error);
      ResponseUtil.handleError(res, error, 'la récupération des histoires');
    }
  }

  // GET /api/stories/:id
  public static async getStoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Validation de l'ID
      const idValidation = ValidationUtil.validateId(id);
      if (!idValidation.isValid) {
        ResponseUtil.validationError(res, idValidation.errors);
        return;
      }
      
      const numericId = parseInt(id, 10);
      
      const story = await StoryService.getStoryById(numericId);
      
      if (!story) {
        ResponseUtil.notFound(res, 'Histoire non trouvée');
        return;
      }
      
      ResponseUtil.success(res, story, 'Histoire récupérée avec succès');
    } catch (error) {
      console.error('Erreur lors de la récupération de la story:', error);
      ResponseUtil.handleError(res, error, 'la récupération de l\'histoire');
    }
  }

  // GET /api/stories/uuid/:uuid
  public static async getStoryByUuid(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const story = await StoryService.getStoryByUuid(uuid);
      
      if (!story) {
        ResponseUtil.notFound(res, 'Histoire non trouvée');
        return;
      }
      
      ResponseUtil.success(res, story, 'Histoire récupérée avec succès');
    } catch (error) {
      console.error('Erreur lors de la récupération de la story:', error);
      ResponseUtil.handleError(res, error, 'la récupération de l\'histoire');
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
        ResponseUtil.notFound(res, 'Histoire non trouvée');
        return;
      }
      
      ResponseUtil.success(res, story, 'Histoire récupérée avec succès');
    } catch (error) {
      console.error('Erreur lors de la récupération de la story:', error);
      ResponseUtil.handleError(res, error, 'la récupération de l\'histoire');
    }
  }

  // GET /api/stories/auteur/:auteur
  public static async getStoriesByAuteur(req: Request, res: Response) {
    try {
      const { auteur } = req.params;
      const stories = await StoryService.getStoriesByAuteur(auteur);
      ResponseUtil.success(res, stories, `Stories de l'auteur ${auteur} récupérées avec succès`);
    } catch (error) {
      console.error('Erreur lors de la récupération des stories par auteur:', error);
      ResponseUtil.handleError(res, error, 'la récupération des stories par auteur');
    }
  }

  // GET /api/stories/statut/:statut
  public static async getStoriesByStatut(req: Request, res: Response) {
    try {
      const { statut } = req.params;
      
      if (!['brouillon', 'en_cours', 'terminee', 'publiee'].includes(statut)) {
        ResponseUtil.error(res, 'Statut invalide', 400);
        return;
      }
      
      const stories = await StoryService.getStoriesByStatut(statut as 'brouillon' | 'en_cours' | 'terminee' | 'publiee');
      ResponseUtil.success(res, stories, `Stories avec le statut ${statut} récupérées avec succès`);
    } catch (error) {
      console.error('Erreur lors de la récupération des stories par statut:', error);
      ResponseUtil.handleError(res, error, 'la récupération des stories par statut');
    }
  }

  // POST /api/stories
  public static async createStory(req: Request, res: Response) {
    try {
      const { titre, description, auteur, statut, userId, sagaId } = req.body;
      
      // Validation des données
      const validationResult = ValidationUtil.validateStoryData({ titre, auteur, userId });
      if (!validationResult.isValid) {
        ResponseUtil.validationError(res, validationResult.errors);
        return;
      }
      
      if (statut && !['brouillon', 'en_cours', 'terminee', 'publiee'].includes(statut)) {
        ResponseUtil.error(res, 'Statut invalide', 400);
        return;
      }
      
      const story = await StoryService.createStory({ titre, description, auteur, statut, userId, sagaId });
      ResponseUtil.created(res, story, 'Histoire créée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création de la story:', error);
      ResponseUtil.handleError(res, error, 'la création de l\'histoire');
    }
  }

  // PUT /api/stories/:id
  public static async updateStory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Validation de l'ID
      const idValidation = ValidationUtil.validateId(id);
      if (!idValidation.isValid) {
        ResponseUtil.validationError(res, idValidation.errors);
        return;
      }
      
      const numericId = parseInt(id, 10);
      
      const { titre, description, auteur, statut, userId, sagaId } = req.body;
      
      if (statut && !['brouillon', 'en_cours', 'terminee', 'publiee'].includes(statut)) {
        ResponseUtil.error(res, 'Statut invalide', 400);
        return;
      }
      
      const story = await StoryService.updateStory(numericId, { titre, description, auteur, statut, userId, sagaId });
      
      if (!story) {
        ResponseUtil.notFound(res, 'Histoire non trouvée');
        return;
      }
      
      ResponseUtil.success(res, story, 'Histoire mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la story:', error);
      ResponseUtil.handleError(res, error, 'la mise à jour de l\'histoire');
    }
  }

  // DELETE /api/stories/:id
  public static async deleteStory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Validation de l'ID
      const idValidation = ValidationUtil.validateId(id);
      if (!idValidation.isValid) {
        ResponseUtil.validationError(res, idValidation.errors);
        return;
      }
      
      const numericId = parseInt(id, 10);
      
      const success = await StoryService.deleteStory(numericId);
      
      if (!success) {
        ResponseUtil.notFound(res, 'Histoire non trouvée');
        return;
      }
      
      ResponseUtil.success(res, null, 'Histoire supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la story:', error);
      ResponseUtil.handleError(res, error, 'la suppression de l\'histoire');
    }
  }

  // GET /api/stories/user/:userId
  public static async getStoriesByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      // Validation de l'ID utilisateur
      const idValidation = ValidationUtil.validateId(userId);
      if (!idValidation.isValid) {
        ResponseUtil.validationError(res, idValidation.errors);
        return;
      }
      
      const numericUserId = parseInt(userId, 10);
      const stories = await StoryService.getStoriesByUserId(numericUserId);
      
      ResponseUtil.success(res, stories, `Stories de l'utilisateur récupérées avec succès`);
    } catch (error) {
      console.error('Erreur lors de la récupération des stories par utilisateur:', error);
      ResponseUtil.handleError(res, error, 'la récupération des stories par utilisateur');
    }
  }
} 