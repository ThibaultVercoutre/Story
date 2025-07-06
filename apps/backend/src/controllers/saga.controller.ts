import { Request, Response } from 'express';
import { SagaService } from '../services/saga.service.js';
import { ResponseUtil } from '../utils/response.util.js';

export class SagaController {
  // Récupérer toutes les sagas
  public static async getAllSagas(req: Request, res: Response): Promise<void> {
    try {
      const sagas = await SagaService.getAllSagas();
      ResponseUtil.success(res, sagas, 'Sagas récupérées avec succès');
    } catch (error) {
      console.error('Erreur lors de la récupération des sagas:', error);
      ResponseUtil.handleError(res, error, 'la récupération des sagas');
    }
  }

  // Récupérer une saga par ID
  public static async getSagaById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        ResponseUtil.error(res, 'ID invalide', 400);
        return;
      }

      const saga = await SagaService.getSagaById(id);
      
      if (!saga) {
        ResponseUtil.notFound(res, 'Saga non trouvée');
        return;
      }

      ResponseUtil.success(res, saga, 'Saga récupérée avec succès');
    } catch (error) {
      console.error('Erreur lors de la récupération de la saga:', error);
      ResponseUtil.handleError(res, error, 'la récupération de la saga');
    }
  }

  // Récupérer une saga par UUID
  public static async getSagaByUuid(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;
      
      const saga = await SagaService.getSagaByUuid(uuid);
      
      if (!saga) {
        ResponseUtil.notFound(res, 'Saga non trouvée');
        return;
      }

      ResponseUtil.success(res, saga, 'Saga récupérée avec succès');
    } catch (error) {
      console.error('Erreur lors de la récupération de la saga:', error);
      ResponseUtil.handleError(res, error, 'la récupération de la saga');
    }
  }

  // Récupérer une saga par slug
  public static async getSagaBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      
      const saga = await SagaService.getSagaBySlug(slug);
      
      if (!saga) {
        ResponseUtil.notFound(res, 'Saga non trouvée');
        return;
      }

      ResponseUtil.success(res, saga, 'Saga récupérée avec succès');
    } catch (error) {
      console.error('Erreur lors de la récupération de la saga:', error);
      ResponseUtil.handleError(res, error, 'la récupération de la saga');
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
        ResponseUtil.notFound(res, 'Saga non trouvée');
        return;
      }

      ResponseUtil.success(res, saga, 'Saga récupérée avec succès');
    } catch (error) {
      console.error('Erreur lors de la récupération de la saga:', error);
      ResponseUtil.handleError(res, error, 'la récupération de la saga');
    }
  }

  // Récupérer les sagas par auteur
  public static async getSagasByAuteur(req: Request, res: Response): Promise<void> {
    try {
      const { auteur } = req.params;
      
      const sagas = await SagaService.getSagasByAuteur(auteur);
      
      ResponseUtil.success(res, sagas, `Sagas de l'auteur ${auteur} récupérées avec succès`);
    } catch (error) {
      console.error('Erreur lors de la récupération des sagas par auteur:', error);
      ResponseUtil.handleError(res, error, 'la récupération des sagas par auteur');
    }
  }

  // Récupérer les sagas par userId
  public static async getSagasByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        ResponseUtil.error(res, 'ID utilisateur invalide', 400);
        return;
      }
      
      const sagas = await SagaService.getSagasByUserId(userId);
      ResponseUtil.success(res, sagas, `Sagas de l'utilisateur ${userId} récupérées avec succès`);
    } catch (error) {
      console.error('Erreur lors de la récupération des sagas par userId:', error);
      ResponseUtil.handleError(res, error, 'la récupération des sagas par userId');
    }
  }

  // Récupérer les sagas par statut
  public static async getSagasByStatut(req: Request, res: Response): Promise<void> {
    try {
      const { statut } = req.params;
      
      if (!['brouillon', 'en_cours', 'terminee', 'publiee'].includes(statut)) {
        ResponseUtil.error(res, 'Statut invalide', 400);
        return;
      }
      
      const sagas = await SagaService.getSagasByStatut(statut as 'brouillon' | 'en_cours' | 'terminee' | 'publiee');
      ResponseUtil.success(res, sagas, `Sagas avec le statut ${statut} récupérées avec succès`);
    } catch (error) {
      console.error('Erreur lors de la récupération des sagas par statut:', error);
      ResponseUtil.handleError(res, error, 'la récupération des sagas par statut');
    }
  }

  // Créer une nouvelle saga
  public static async createSaga(req: Request, res: Response): Promise<void> {
    try {
      const { titre, description, auteur, statut, userId } = req.body;
      
      if (!titre || !auteur) {
        ResponseUtil.error(res, 'Titre et auteur sont requis', 400);
        return;
      }
      
      if (statut && !['brouillon', 'en_cours', 'terminee', 'publiee'].includes(statut)) {
        ResponseUtil.error(res, 'Statut invalide', 400);
        return;
      }
      
      const saga = await SagaService.createSaga({ titre, description, auteur, statut, userId });
      ResponseUtil.created(res, saga, 'Saga créée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création de la saga:', error);
      ResponseUtil.handleError(res, error, 'la création de la saga');
    }
  }

  // Mettre à jour une saga
  public static async updateSaga(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        ResponseUtil.error(res, 'ID invalide', 400);
        return;
      }
      
      const { titre, description, auteur, statut, userId } = req.body;
      
      if (statut && !['brouillon', 'en_cours', 'terminee', 'publiee'].includes(statut)) {
        ResponseUtil.error(res, 'Statut invalide', 400);
        return;
      }
      
      const saga = await SagaService.updateSaga(id, { titre, description, auteur, statut, userId });
      
      if (!saga) {
        ResponseUtil.notFound(res, 'Saga non trouvée');
        return;
      }
      
      ResponseUtil.success(res, saga, 'Saga mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la saga:', error);
      ResponseUtil.handleError(res, error, 'la mise à jour de la saga');
    }
  }

  // Supprimer une saga
  public static async deleteSaga(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        ResponseUtil.error(res, 'ID invalide', 400);
        return;
      }
      
      const success = await SagaService.deleteSaga(id);
      
      if (!success) {
        ResponseUtil.notFound(res, 'Saga non trouvée');
        return;
      }
      
      ResponseUtil.success(res, null, 'Saga supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la saga:', error);
      ResponseUtil.handleError(res, error, 'la suppression de la saga');
    }
  }
} 