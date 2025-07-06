import { Request, Response } from 'express';
import { ChapitreService } from '../services/chapitre.service.js';
import { ResponseUtil } from '../utils/response.util.js';

export class ChapitreController {
  // GET /api/chapitres
  public static async getAllChapitres(req: Request, res: Response) {
    try {
      const chapitres = await ChapitreService.getAllChapitres();
      ResponseUtil.success(res, chapitres, 'Chapitres récupérés avec succès');
    } catch (error) {
      console.error('Erreur lors de la récupération des chapitres:', error);
      ResponseUtil.handleError(res, error, 'la récupération des chapitres');
    }
  }

  // GET /api/chapitres/:id
  public static async getChapitreById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        ResponseUtil.error(res, 'ID invalide', 400);
        return;
      }
      
      const chapitre = await ChapitreService.getChapitreById(numericId);
      
      if (!chapitre) {
        ResponseUtil.notFound(res, 'Chapitre non trouvé');
        return;
      }
      
      ResponseUtil.success(res, chapitre, 'Chapitre récupéré avec succès');
    } catch (error) {
      console.error('Erreur lors de la récupération du chapitre:', error);
      ResponseUtil.handleError(res, error, 'la récupération du chapitre');
    }
  }

  // GET /api/chapitres/uuid/:uuid
  public static async getChapitreByUuid(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const chapitre = await ChapitreService.getChapitreByUuid(uuid);
      
      if (!chapitre) {
        ResponseUtil.notFound(res, 'Chapitre non trouvé');
        return;
      }
      
      ResponseUtil.success(res, chapitre, 'Chapitre récupéré avec succès');
    } catch (error) {
      console.error('Erreur lors de la récupération du chapitre:', error);
      ResponseUtil.handleError(res, error, 'la récupération du chapitre');
    }
  }

  // GET /api/chapitres/identifier/:identifier - Récupère par ID, UUID ou slug
  public static async getChapitreByIdOrUuidOrSlug(req: Request, res: Response) {
    try {
      const { identifier } = req.params;
      
      // Essayer de convertir en nombre si possible
      const numericId = parseInt(identifier, 10);
      const searchIdentifier = isNaN(numericId) ? identifier : numericId;
      
      const chapitre = await ChapitreService.getChapitreByIdOrUuidOrSlug(searchIdentifier);
      
      if (!chapitre) {
        ResponseUtil.notFound(res, 'Chapitre non trouvé');
        return;
      }
      
      ResponseUtil.success(res, chapitre, 'Chapitre récupéré avec succès');
    } catch (error) {
      console.error('Erreur lors de la récupération du chapitre:', error);
      ResponseUtil.handleError(res, error, 'la récupération du chapitre');
    }
  }

  // GET /api/stories/:storyId/chapitres - Récupère les chapitres d'une story par ID
  public static async getChapitresByStoryId(req: Request, res: Response) {
    try {
      const { storyId } = req.params;
      const numericStoryId = parseInt(storyId, 10);
      
      if (isNaN(numericStoryId)) {
        ResponseUtil.error(res, 'ID de story invalide', 400);
        return;
      }
      
      const chapitres = await ChapitreService.getChapitresByStoryId(numericStoryId);
      ResponseUtil.success(res, chapitres, 'Chapitres de la story récupérés avec succès');
    } catch (error) {
      console.error('Erreur lors de la récupération des chapitres de la story:', error);
      ResponseUtil.handleError(res, error, 'la récupération des chapitres de la story');
    }
  }

  // POST /api/chapitres
  public static async createChapitre(req: Request, res: Response) {
    try {
      const { titre, numero, storyId } = req.body;
      
      if (!titre || !numero || !storyId) {
        ResponseUtil.error(res, 'Titre, numéro et storyId sont requis', 400);
        return;
      }
      
      const numericStoryId = parseInt(storyId, 10);
      if (isNaN(numericStoryId)) {
        ResponseUtil.error(res, 'storyId doit être un nombre', 400);
        return;
      }
      
      const chapitre = await ChapitreService.createChapitre({ 
        titre, 
        numero, 
        storyId: numericStoryId
      });
      ResponseUtil.created(res, chapitre, 'Chapitre créé avec succès');
    } catch (error) {
      console.error('Erreur lors de la création du chapitre:', error);
      ResponseUtil.handleError(res, error, 'la création du chapitre');
    }
  }

  // PUT /api/chapitres/:id
  public static async updateChapitre(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        ResponseUtil.error(res, 'ID invalide', 400);
        return;
      }
      
      const { titre, numero, storyId } = req.body;
      
      let numericStoryId: number | undefined;
      if (storyId !== undefined) {
        numericStoryId = parseInt(storyId, 10);
        if (isNaN(numericStoryId)) {
          ResponseUtil.error(res, 'storyId doit être un nombre', 400);
          return;
        }
      }
      
      const chapitre = await ChapitreService.updateChapitre(numericId, { 
        titre, 
        numero, 
        storyId: numericStoryId
      });
      
      if (!chapitre) {
        ResponseUtil.notFound(res, 'Chapitre non trouvé');
        return;
      }
      
      ResponseUtil.success(res, chapitre, 'Chapitre mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du chapitre:', error);
      ResponseUtil.handleError(res, error, 'la mise à jour du chapitre');
    }
  }

  // DELETE /api/chapitres/:id
  public static async deleteChapitre(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        ResponseUtil.error(res, 'ID invalide', 400);
        return;
      }
      
      const success = await ChapitreService.deleteChapitre(numericId);
      
      if (!success) {
        ResponseUtil.notFound(res, 'Chapitre non trouvé');
        return;
      }
      
      ResponseUtil.success(res, null, 'Chapitre supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du chapitre:', error);
      ResponseUtil.handleError(res, error, 'la suppression du chapitre');
    }
  }
} 