import { Request, Response } from 'express';
import { MorceauTexteService } from '../services/morceauTexte.service.js';
import { TypeMorceauTexte } from '../models/morceauTexte.model.js';
import { ResponseUtil } from '../utils/response.util.js';

export class MorceauTexteController {
  // GET /api/chapitres/:chapitreId/morceaux-texte - Par ID de chapitre
  public static async getMorceauxTexteByChapitreId(req: Request, res: Response) {
    try {
      const { chapitreId } = req.params;
      const numericChapitreId = parseInt(chapitreId, 10);
      
      if (isNaN(numericChapitreId)) {
        ResponseUtil.error(res, 'ID de chapitre invalide', 400);
        return;
      }
      
      const morceaux = await MorceauTexteService.getMorceauxTexteByChapitreId(numericChapitreId);
      ResponseUtil.success(res, morceaux, 'Morceaux de texte récupérés avec succès');
    } catch (error) {
      console.error('Erreur lors de la récupération des morceaux de texte:', error);
      ResponseUtil.handleError(res, error, 'la récupération des morceaux de texte');
    }
  }

  // GET /api/morceaux-texte/:id
  public static async getMorceauTexteById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        ResponseUtil.error(res, 'ID invalide', 400);
        return;
      }
      
      const morceau = await MorceauTexteService.getMorceauTexteById(numericId);
      
      if (!morceau) {
        ResponseUtil.notFound(res, 'Morceau de texte non trouvé');
        return;
      }
      
      ResponseUtil.success(res, morceau, 'Morceau de texte récupéré avec succès');
    } catch (error) {
      console.error('Erreur lors de la récupération du morceau de texte:', error);
      ResponseUtil.handleError(res, error, 'la récupération du morceau de texte');
    }
  }

  // GET /api/morceaux-texte/uuid/:uuid
  public static async getMorceauTexteByUuid(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const morceau = await MorceauTexteService.getMorceauTexteByUuid(uuid);
      
      if (!morceau) {
        ResponseUtil.notFound(res, 'Morceau de texte non trouvé');
        return;
      }
      
      ResponseUtil.success(res, morceau, 'Morceau de texte récupéré avec succès');
    } catch (error) {
      console.error('Erreur lors de la récupération du morceau de texte:', error);
      ResponseUtil.handleError(res, error, 'la récupération du morceau de texte');
    }
  }

  // POST /api/morceaux-texte
  public static async createMorceauTexte(req: Request, res: Response) {
    try {
      const { chapitreId, type, contenu, ordre } = req.body;
      
      if (!chapitreId || !type || !contenu || ordre === undefined || ordre === null) {
        ResponseUtil.error(res, 'ChapitreId, type, contenu et ordre sont requis', 400);
        return;
      }
      
      const numericChapitreId = parseInt(chapitreId, 10);
      if (isNaN(numericChapitreId)) {
        ResponseUtil.error(res, 'chapitreId doit être un nombre', 400);
        return;
      }
      
      if (!Object.values(TypeMorceauTexte).includes(type)) {
        ResponseUtil.error(res, 'Type invalide. Types acceptés: paragraphe, citation, dialogue', 400);
        return;
      }
      
      const morceau = await MorceauTexteService.createMorceauTexte({
        chapitreId: numericChapitreId,
        type,
        contenu,
        ordre
      });
      
      ResponseUtil.created(res, morceau, 'Morceau de texte créé avec succès');
    } catch (error) {
      console.error('Erreur lors de la création du morceau de texte:', error);
      ResponseUtil.handleError(res, error, 'la création du morceau de texte');
    }
  }

  // PUT /api/morceaux-texte/:id
  public static async updateMorceauTexte(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        ResponseUtil.error(res, 'ID invalide', 400);
        return;
      }
      
      const { chapitreId, type, contenu, ordre } = req.body;
      
      let numericChapitreId: number | undefined;
      if (chapitreId !== undefined) {
        numericChapitreId = parseInt(chapitreId, 10);
        if (isNaN(numericChapitreId)) {
          ResponseUtil.error(res, 'chapitreId doit être un nombre', 400);
          return;
        }
      }
      
      if (type && !Object.values(TypeMorceauTexte).includes(type)) {
        ResponseUtil.error(res, 'Type invalide. Types acceptés: paragraphe, citation, dialogue', 400);
        return;
      }
      
      const morceau = await MorceauTexteService.updateMorceauTexte(numericId, {
        chapitreId: numericChapitreId,
        type,
        contenu,
        ordre
      });
      
      if (!morceau) {
        ResponseUtil.notFound(res, 'Morceau de texte non trouvé');
        return;
      }
      
      ResponseUtil.success(res, morceau, 'Morceau de texte mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du morceau de texte:', error);
      ResponseUtil.handleError(res, error, 'la mise à jour du morceau de texte');
    }
  }

  // DELETE /api/morceaux-texte/:id
  public static async deleteMorceauTexte(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        ResponseUtil.error(res, 'ID invalide', 400);
        return;
      }
      
      const success = await MorceauTexteService.deleteMorceauTexte(numericId);
      
      if (!success) {
        ResponseUtil.notFound(res, 'Morceau de texte non trouvé');
        return;
      }
      
      ResponseUtil.success(res, null, 'Morceau de texte supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du morceau de texte:', error);
      ResponseUtil.handleError(res, error, 'la suppression du morceau de texte');
    }
  }
} 