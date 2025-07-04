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
      const chapitre = await ChapitreService.getChapitreById(id);
      
      if (!chapitre) {
        return res.status(404).json({ error: 'Chapitre non trouvé' });
      }
      
      res.json(chapitre);
    } catch (error) {
      console.error('Erreur lors de la récupération du chapitre:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // POST /api/chapitres
  public static async createChapitre(req: Request, res: Response) {
    try {
      const { titre, numero } = req.body;
      
      if (!titre || !numero) {
        return res.status(400).json({ error: 'Titre et numéro sont requis' });
      }
      
      const chapitre = await ChapitreService.createChapitre({ titre, numero });
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
      const { titre, numero } = req.body;
      
      const chapitre = await ChapitreService.updateChapitre(id, { titre, numero });
      
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
      const success = await ChapitreService.deleteChapitre(id);
      
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