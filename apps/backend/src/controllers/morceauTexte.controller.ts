import { Request, Response } from 'express';
import { MorceauTexteService } from '../services/morceauTexte.service.js';
import { TypeMorceauTexte } from '../models/morceauTexte.model.js';

export class MorceauTexteController {
  // GET /api/chapitres/:chapitreId/morceaux-texte - Par ID de chapitre
  public static async getMorceauxTexteByChapitreId(req: Request, res: Response) {
    try {
      const { chapitreId } = req.params;
      const numericChapitreId = parseInt(chapitreId, 10);
      
      if (isNaN(numericChapitreId)) {
        return res.status(400).json({ error: 'ID de chapitre invalide' });
      }
      
      const morceaux = await MorceauTexteService.getMorceauxTexteByChapitreId(numericChapitreId);
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
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        return res.status(400).json({ error: 'ID invalide' });
      }
      
      const morceau = await MorceauTexteService.getMorceauTexteById(numericId);
      
      if (!morceau) {
        return res.status(404).json({ error: 'Morceau de texte non trouvé' });
      }
      
      res.json(morceau);
    } catch (error) {
      console.error('Erreur lors de la récupération du morceau de texte:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

  // GET /api/morceaux-texte/uuid/:uuid
  public static async getMorceauTexteByUuid(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const morceau = await MorceauTexteService.getMorceauTexteByUuid(uuid);
      
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
      
      const numericChapitreId = parseInt(chapitreId, 10);
      if (isNaN(numericChapitreId)) {
        return res.status(400).json({ error: 'chapitreId doit être un nombre' });
      }
      
      if (!Object.values(TypeMorceauTexte).includes(type)) {
        return res.status(400).json({ 
          error: 'Type invalide. Types acceptés: paragraphe, citation, dialogue' 
        });
      }
      
      const morceau = await MorceauTexteService.createMorceauTexte({
        chapitreId: numericChapitreId,
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
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        return res.status(400).json({ error: 'ID invalide' });
      }
      
      const { chapitreId, type, contenu, ordre } = req.body;
      
      let numericChapitreId: number | undefined;
      if (chapitreId !== undefined) {
        numericChapitreId = parseInt(chapitreId, 10);
        if (isNaN(numericChapitreId)) {
          return res.status(400).json({ error: 'chapitreId doit être un nombre' });
        }
      }
      
      if (type && !Object.values(TypeMorceauTexte).includes(type)) {
        return res.status(400).json({ 
          error: 'Type invalide. Types acceptés: paragraphe, citation, dialogue' 
        });
      }
      
      const morceau = await MorceauTexteService.updateMorceauTexte(numericId, {
        chapitreId: numericChapitreId,
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
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        return res.status(400).json({ error: 'ID invalide' });
      }
      
      const success = await MorceauTexteService.deleteMorceauTexte(numericId);
      
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