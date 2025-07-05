import { Request, Response } from 'express';
import { SagaService } from '../services/saga.service.js';

export class SagaController {
  // Récupérer toutes les sagas
  public static async getAllSagas(req: Request, res: Response): Promise<void> {
    try {
      const sagas = await SagaService.getAllSagas();
      res.status(200).json({
        success: true,
        data: sagas,
        message: 'Sagas récupérées avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des sagas:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des sagas'
      });
    }
  }

  // Récupérer une saga par ID
  public static async getSagaById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID invalide'
        });
        return;
      }

      const saga = await SagaService.getSagaById(id);
      
      if (!saga) {
        res.status(404).json({
          success: false,
          message: 'Saga non trouvée'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: saga,
        message: 'Saga récupérée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la saga:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la saga'
      });
    }
  }

  // Récupérer une saga par UUID
  public static async getSagaByUuid(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;
      
      const saga = await SagaService.getSagaByUuid(uuid);
      
      if (!saga) {
        res.status(404).json({
          success: false,
          message: 'Saga non trouvée'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: saga,
        message: 'Saga récupérée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la saga:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la saga'
      });
    }
  }

  // Récupérer une saga par slug
  public static async getSagaBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      
      const saga = await SagaService.getSagaBySlug(slug);
      
      if (!saga) {
        res.status(404).json({
          success: false,
          message: 'Saga non trouvée'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: saga,
        message: 'Saga récupérée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la saga:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la saga'
      });
    }
  }

  // Récupérer une saga par ID, UUID ou slug
  public static async getSagaByIdOrUuidOrSlug(req: Request, res: Response): Promise<void> {
    try {
      const { identifier } = req.params;
      
      // Essayer de convertir en nombre
      const numericId = parseInt(identifier);
      const searchValue = isNaN(numericId) ? identifier : numericId;
      
      const saga = await SagaService.getSagaByIdOrUuidOrSlug(searchValue);
      
      if (!saga) {
        res.status(404).json({
          success: false,
          message: 'Saga non trouvée'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: saga,
        message: 'Saga récupérée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la saga:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la saga'
      });
    }
  }

  // Récupérer les sagas par auteur
  public static async getSagasByAuteur(req: Request, res: Response): Promise<void> {
    try {
      const { auteur } = req.params;
      
      const sagas = await SagaService.getSagasByAuteur(auteur);
      
      res.status(200).json({
        success: true,
        data: sagas,
        message: `Sagas de l'auteur ${auteur} récupérées avec succès`
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des sagas par auteur:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des sagas par auteur'
      });
    }
  }

  // Récupérer les sagas par statut
  public static async getSagasByStatut(req: Request, res: Response): Promise<void> {
    try {
      const { statut } = req.params;
      
      if (!['brouillon', 'en_cours', 'terminee', 'publiee'].includes(statut)) {
        res.status(400).json({
          success: false,
          message: 'Statut invalide'
        });
        return;
      }
      
      const sagas = await SagaService.getSagasByStatut(statut as 'brouillon' | 'en_cours' | 'terminee' | 'publiee');
      
      res.status(200).json({
        success: true,
        data: sagas,
        message: `Sagas avec le statut ${statut} récupérées avec succès`
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des sagas par statut:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des sagas par statut'
      });
    }
  }

  // Créer une nouvelle saga
  public static async createSaga(req: Request, res: Response): Promise<void> {
    try {
      const { titre, description, auteur, statut } = req.body;
      
      // Validation des données requises
      if (!titre || !auteur) {
        res.status(400).json({
          success: false,
          message: 'Le titre et l\'auteur sont requis'
        });
        return;
      }

      // Validation du statut si fourni
      if (statut && !['brouillon', 'en_cours', 'terminee', 'publiee'].includes(statut)) {
        res.status(400).json({
          success: false,
          message: 'Statut invalide'
        });
        return;
      }

      const sagaData = {
        titre,
        description,
        auteur,
        statut: statut || 'brouillon'
      };

      const saga = await SagaService.createSaga(sagaData);

      res.status(201).json({
        success: true,
        data: saga,
        message: 'Saga créée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la création de la saga:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la saga'
      });
    }
  }

  // Mettre à jour une saga
  public static async updateSaga(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID invalide'
        });
        return;
      }

      const { titre, description, auteur, statut } = req.body;

      // Validation du statut si fourni
      if (statut && !['brouillon', 'en_cours', 'terminee', 'publiee'].includes(statut)) {
        res.status(400).json({
          success: false,
          message: 'Statut invalide'
        });
        return;
      }

      const updateData: any = {};
      if (titre) updateData.titre = titre;
      if (description !== undefined) updateData.description = description;
      if (auteur) updateData.auteur = auteur;
      if (statut) updateData.statut = statut;

      const saga = await SagaService.updateSaga(id, updateData);

      if (!saga) {
        res.status(404).json({
          success: false,
          message: 'Saga non trouvée'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: saga,
        message: 'Saga mise à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la saga:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la saga'
      });
    }
  }

  // Supprimer une saga
  public static async deleteSaga(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID invalide'
        });
        return;
      }

      const deleted = await SagaService.deleteSaga(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Saga non trouvée'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Saga supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la saga:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de la saga'
      });
    }
  }
} 