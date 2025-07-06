import { Router } from 'express';
import { SagaController } from '../controllers/saga.controller.js';

const router = Router();

// Récupérer toutes les sagas
router.get('/', SagaController.getAllSagas);

// Récupérer une saga par ID
router.get('/id/:id', SagaController.getSagaById);

// Récupérer une saga par UUID
router.get('/uuid/:uuid', SagaController.getSagaByUuid);

// Récupérer une saga par slug
router.get('/slug/:slug', SagaController.getSagaBySlug);

// Récupérer une saga par ID, UUID ou slug (route générique)
router.get('/find/:identifier', SagaController.getSagaByIdOrUuidOrSlug);

// Récupérer les sagas par auteur
router.get('/auteur/:auteur', SagaController.getSagasByAuteur);

// Récupérer les sagas par userId
router.get('/userId/:userId', SagaController.getSagasByUserId);

// Récupérer les sagas par statut
router.get('/statut/:statut', SagaController.getSagasByStatut);

// Créer une nouvelle saga
router.post('/', SagaController.createSaga);

// Mettre à jour une saga
router.put('/:id', SagaController.updateSaga);

// Supprimer une saga
router.delete('/:id', SagaController.deleteSaga);

export default router; 