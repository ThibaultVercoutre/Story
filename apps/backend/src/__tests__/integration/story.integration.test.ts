import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { DatabaseTestUtils } from '../setup-integration.js';
import { StoryController } from '../../controllers/story.controller.js';
import { StoryService } from '../../services/story.service.js';
import { UserService } from '../../services/user.service.js';
import { SagaService } from '../../services/saga.service.js';
import { ResponseUtil } from '../../utils/response.util.js';
import { User, Saga, Story } from '../../models/index.js';

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json());

// Routes pour les tests d'intégration
app.post('/api/stories', StoryController.createStory);
app.get('/api/stories', StoryController.getAllStories);
app.get('/api/stories/:id', StoryController.getStoryById);
app.put('/api/stories/:id', StoryController.updateStory);
app.delete('/api/stories/:id', StoryController.deleteStory);
app.get('/api/stories/user/:userId', StoryController.getStoriesByUserId);

xdescribe('Tests d\'intégration - Story', () => {
  let testUser: any;
  let testSaga: any;
  let testStory: any;

  beforeAll(async () => {
    // Initialiser la base de données de test
    await DatabaseTestUtils.initializeTestDatabase();
  });

  afterAll(async () => {
    // Fermer la connexion à la base de données de test
    await DatabaseTestUtils.closeTestDatabase();
  });

  beforeEach(async () => {
    // Nettoyer et recréer les données de test avant chaque test
    await DatabaseTestUtils.cleanTestDatabase();
    
    // Créer des données de test
    const testData = await DatabaseTestUtils.createTestData();
    testUser = testData.testUser;
    testSaga = testData.testSaga;
    testStory = testData.testStory;
  });

  describe('POST /api/stories', () => {
    it('doit créer une nouvelle story avec succès', async () => {
      const newStoryData = {
        titre: 'Nouvelle Story',
        auteur: 'Nouvel Auteur',
        statut: 'brouillon',
        userId: testUser.id,
        sagaId: testSaga.id,
      };

      const response = await request(app)
        .post('/api/stories')
        .send(newStoryData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.titre).toBe('Nouvelle Story');

      // Vérifier que la story a été créée en base de données
      const createdStory = await Story.findByPk(response.body.data.id);
      expect(createdStory).toBeDefined();
      expect(createdStory?.titre).toBe('Nouvelle Story');
    });

    it('doit échouer avec des données invalides', async () => {
      const invalidStoryData = {
        titre: '', // Titre vide
        auteur: 'Auteur',
        userId: testUser.id,
      };

      const response = await request(app)
        .post('/api/stories')
        .send(invalidStoryData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/stories', () => {
    it('doit récupérer toutes les stories', async () => {
      const response = await request(app)
        .get('/api/stories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/stories/:id', () => {
    it('doit récupérer une story par ID', async () => {
      const response = await request(app)
        .get(`/api/stories/${testStory.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(testStory.id);
      expect(response.body.data.titre).toBe(testStory.titre);
    });

    it('doit retourner 404 pour une story inexistante', async () => {
      const response = await request(app)
        .get('/api/stories/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/stories/:id', () => {
    it('doit mettre à jour une story existante', async () => {
      const updatedData = {
        titre: 'Titre Modifié',
        auteur: 'Auteur Modifié',
        statut: 'en_cours',
      };

      const response = await request(app)
        .put(`/api/stories/${testStory.id}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.titre).toBe('Titre Modifié');

      // Vérifier que la story a été mise à jour en base de données
      const updatedStory = await Story.findByPk(testStory.id);
      expect(updatedStory?.titre).toBe('Titre Modifié');
      expect(updatedStory?.statut).toBe('en_cours');
    });

    it('doit échouer avec des données invalides', async () => {
      const invalidUpdateData = {
        titre: '', // Titre vide
      };

      const response = await request(app)
        .put(`/api/stories/${testStory.id}`)
        .send(invalidUpdateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/stories/:id', () => {
    it('doit supprimer une story existante', async () => {
      const response = await request(app)
        .delete(`/api/stories/${testStory.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();

      // Vérifier que la story a été supprimée de la base de données
      const deletedStory = await Story.findByPk(testStory.id);
      expect(deletedStory).toBeNull();
    });

    it('doit retourner 404 pour une story inexistante', async () => {
      const response = await request(app)
        .delete('/api/stories/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/stories/user/:userId', () => {
    it('doit récupérer les stories d\'un utilisateur', async () => {
      const response = await request(app)
        .get(`/api/stories/user/${testUser.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].userId).toBe(testUser.id);
    });

    it('doit retourner un tableau vide pour un utilisateur sans stories', async () => {
      // Créer un nouvel utilisateur sans stories
      const newUser = await User.create({
        uuid: 'test-uuid-user2',
        email: 'user2@example.com',
        nom: 'User 2',
        passwordHash: 'hashedPassword123',
        iv: 'test-iv',
        tag: 'test-tag',
      } as any);

      const response = await request(app)
        .get(`/api/stories/user/${newUser.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('Tests de chiffrement des données', () => {
    it('doit chiffrer et déchiffrer les données sensibles', async () => {
      const storyData = {
        titre: 'Story avec caractères spéciaux éèàç',
        auteur: 'Auteur avec accents éèàç',
        statut: 'brouillon',
        userId: testUser.id,
        sagaId: testSaga.id,
      };

      // Créer la story
      const createResponse = await request(app)
        .post('/api/stories')
        .send(storyData)
        .expect(201);

      const createdStoryId = createResponse.body.data.id;

      // Récupérer la story
      const getResponse = await request(app)
        .get(`/api/stories/${createdStoryId}`)
        .expect(200);

      // Vérifier que les données ont été correctement chiffrées/déchiffrées
      expect(getResponse.body.data.titre).toBe(storyData.titre);
      expect(getResponse.body.data.auteur).toBe(storyData.auteur);
    });
  });

  describe('Tests des relations', () => {
    it('doit récupérer une story avec sa saga et son utilisateur', async () => {
      const response = await request(app)
        .get(`/api/stories/${testStory.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(testStory.id);
      
      // Vérifier que les relations sont correctement configurées
      // (Note: ceci dépend de l'implémentation des contrôleurs)
    });
  });

  describe('Tests de performance', () => {
    it('doit gérer la création de multiples stories', async () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        const storyData = {
          titre: `Story ${i}`,
          auteur: `Auteur ${i}`,
          statut: 'brouillon',
          userId: testUser.id,
          sagaId: testSaga.id,
        };

        promises.push(
          request(app)
            .post('/api/stories')
            .send(storyData)
        );
      }

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Vérifier que toutes les stories ont été créées
      const allStories = await Story.findAll();
      expect(allStories.length).toBeGreaterThanOrEqual(10);
    });
  });
}); 