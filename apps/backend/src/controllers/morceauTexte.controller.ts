import { Request, Response } from 'express';
import { MorceauTexteService } from '../services/morceauTexte.service.js';
import { TypeMorceauTexte } from '../models/morceauTexte.model.js';

export class MorceauTexteController {
  // GET /api/chapitres/:chapitreId/morceaux-texte
  public static async getMorceauxTexteByChapitreId(req: Request, res: Response) {
    try {
      const { chapitreId } = req.params;
      const morceaux = await MorceauTexteService.getMorceauxTexteByChapitreId(chapitreId);
      res.json(morceaux);
    } catch (error) {
      console.error('Erreur lors de la récupération des morceaux de texte:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // GET /api/morceaux-texte/:id
  public static async getMorceauTexteById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const morceau = await MorceauTexteService.getMorceauTexteById(id);
      
      if (!morceau) {
        return res.status(404).json({ error: 'Morceau de texte non trouvé' });
      }
      
      res.json(morceau);
    } catch (error) {
      console.error('Erreur lors de la récupération du morceau de texte:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // POST /api/morceaux-texte
  public static async createMorceauTexte(req: Request, res: Response) {
    try {
      const { chapitreId, type, contenu, ordre } = req.body;
      
      if (!chapitreId || !type || !contenu || !ordre) {
        return res.status(400).json({ 
          error: 'ChapitreId, type, contenu et ordre sont requis' 
        });
      }
      
      if (!Object.values(TypeMorceauTexte).includes(type)) {
        return res.status(400).json({ 
          error: 'Type invalide. Types acceptés: paragraphe, citation, dialogue' 
        });
      }
      
      const morceau = await MorceauTexteService.createMorceauTexte({
        chapitreId,
        type,
        contenu,
        ordre
      });
      
      res.status(201).json(morceau);
    } catch (error) {
      console.error('Erreur lors de la création du morceau de texte:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // PUT /api/morceaux-texte/:id
  public static async updateMorceauTexte(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { chapitreId, type, contenu, ordre } = req.body;
      
      if (type && !Object.values(TypeMorceauTexte).includes(type)) {
        return res.status(400).json({ 
          error: 'Type invalide. Types acceptés: paragraphe, citation, dialogue' 
        });
      }
      
      const morceau = await MorceauTexteService.updateMorceauTexte(id, {
        chapitreId,
        type,
        contenu,
        ordre
      });
      
      if (!morceau) {
        return res.status(404).json({ error: 'Morceau de texte non trouvé' });
      }
      
      res.json(morceau);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du morceau de texte:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // DELETE /api/morceaux-texte/:id
  public static async deleteMorceauTexte(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await MorceauTexteService.deleteMorceauTexte(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Morceau de texte non trouvé' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Erreur lors de la suppression du morceau de texte:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }
} 