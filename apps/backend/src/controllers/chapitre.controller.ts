import { Request, Response } from 'express';
import { ChapitreService } from '../services/chapitre.service.js';

export class ChapitreController {
  // GET /api/chapitres
  public static async getAllChapitres(req: Request, res: Response) {
    try {
      const chapitres = await ChapitreService.getAllChapitres();
      res.json(chapitres);
    } catch (error) {
      console.error('Erreur lors de la récupération des chapitres:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // GET /api/chapitres/:id
  public static async getChapitreById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        return res.status(400).json({ error: 'ID invalide' });
      }
      
      const chapitre = await ChapitreService.getChapitreById(numericId);
      
      if (!chapitre) {
        return res.status(404).json({ error: 'Chapitre non trouvé' });
      }
      
      res.json(chapitre);
    } catch (error) {
      console.error('Erreur lors de la récupération du chapitre:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // GET /api/chapitres/uuid/:uuid
  public static async getChapitreByUuid(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const chapitre = await ChapitreService.getChapitreByUuid(uuid);
      
      if (!chapitre) {
        return res.status(404).json({ error: 'Chapitre non trouvé' });
      }
      
      res.json(chapitre);
    } catch (error) {
      console.error('Erreur lors de la récupération du chapitre:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
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
        return res.status(404).json({ error: 'Chapitre non trouvé' });
      }
      
      res.json(chapitre);
    } catch (error) {
      console.error('Erreur lors de la récupération du chapitre:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // GET /api/stories/:storyId/chapitres - Récupère les chapitres d'une story par ID
  public static async getChapitresByStoryId(req: Request, res: Response) {
    try {
      const { storyId } = req.params;
      const numericStoryId = parseInt(storyId, 10);
      
      if (isNaN(numericStoryId)) {
        return res.status(400).json({ error: 'ID de story invalide' });
      }
      
      const chapitres = await ChapitreService.getChapitresByStoryId(numericStoryId);
      res.json(chapitres);
    } catch (error) {
      console.error('Erreur lors de la récupération des chapitres de la story:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // POST /api/chapitres
  public static async createChapitre(req: Request, res: Response) {
    try {
      const { titre, numero, storyId } = req.body;
      
      if (!titre || !numero || !storyId) {
        return res.status(400).json({ error: 'Titre, numéro et storyId sont requis' });
      }
      
      const numericStoryId = parseInt(storyId, 10);
      if (isNaN(numericStoryId)) {
        return res.status(400).json({ error: 'storyId doit être un nombre' });
      }
      
      const chapitre = await ChapitreService.createChapitre({ 
        titre, 
        numero, 
        storyId: numericStoryId
      });
      res.status(201).json(chapitre);
    } catch (error) {
      console.error('Erreur lors de la création du chapitre:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // PUT /api/chapitres/:id
  public static async updateChapitre(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        return res.status(400).json({ error: 'ID invalide' });
      }
      
      const { titre, numero, storyId } = req.body;
      
      let numericStoryId: number | undefined;
      if (storyId !== undefined) {
        numericStoryId = parseInt(storyId, 10);
        if (isNaN(numericStoryId)) {
          return res.status(400).json({ error: 'storyId doit être un nombre' });
        }
      }
      
      const chapitre = await ChapitreService.updateChapitre(numericId, { 
        titre, 
        numero, 
        storyId: numericStoryId
      });
      
      if (!chapitre) {
        return res.status(404).json({ error: 'Chapitre non trouvé' });
      }
      
      res.json(chapitre);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du chapitre:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // DELETE /api/chapitres/:id
  public static async deleteChapitre(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        return res.status(400).json({ error: 'ID invalide' });
      }
      
      const success = await ChapitreService.deleteChapitre(numericId);
      
      if (!success) {
        return res.status(404).json({ error: 'Chapitre non trouvé' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Erreur lors de la suppression du chapitre:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }
} 