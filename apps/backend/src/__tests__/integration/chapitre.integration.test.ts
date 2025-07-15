import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { DatabaseTestUtils } from '../setup-integration.js';
import { ChapitreController } from '../../controllers/chapitre.controller.js';
import { Chapitre, Story, User, Saga } from '../../models/index.js';

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json());

// Routes pour les tests d'intégration
app.post('/api/chapitres', ChapitreController.createChapitre);
app.get('/api/chapitres', ChapitreController.getAllChapitres);
app.get('/api/chapitres/:id', ChapitreController.getChapitreById);
app.put('/api/chapitres/:id', ChapitreController.updateChapitre);
app.delete('/api/chapitres/:id', ChapitreController.deleteChapitre);
app.get('/api/chapitres/story/:storyId', ChapitreController.getChapitresByStoryId);

xdescribe('Tests d\'intégration - Chapitre', () => {
  let testUser: any;
  let testSaga: any;
  let testStory: any;
  let testChapitre: any;

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
    testChapitre = testData.testChapitre;
  });

  describe('POST /api/chapitres', () => {
    it('doit créer un nouveau chapitre avec succès', async () => {
      const newChapitreData = {
        titre: 'Nouveau Chapitre',
        numero: 2,
        storyId: testStory.id,
      };

      const response = await request(app)
        .post('/api/chapitres')
        .send(newChapitreData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.titre).toBe('Nouveau Chapitre');
      expect(response.body.data.numero).toBe(2);

      // Vérifier que le chapitre a été créé en base de données
      const createdChapitre = await Chapitre.findByPk(response.body.data.id);
      expect(createdChapitre).toBeDefined();
      expect(createdChapitre?.numero).toBe(2);
    });

    it('doit échouer avec des données invalides', async () => {
      const invalidChapitreData = {
        titre: '', // Titre vide
        numero: 'invalid', // Numéro invalide
        storyId: testStory.id,
      };

      const response = await request(app)
        .post('/api/chapitres')
        .send(invalidChapitreData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('doit échouer avec une story inexistante', async () => {
      const chapitreData = {
        titre: 'Chapitre Test',
        numero: 1,
        storyId: 999999, // Story inexistante
      };

      const response = await request(app)
        .post('/api/chapitres')
        .send(chapitreData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/chapitres', () => {
    it('doit récupérer tous les chapitres', async () => {
      const response = await request(app)
        .get('/api/chapitres')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/chapitres/:id', () => {
    it('doit récupérer un chapitre par ID', async () => {
      const response = await request(app)
        .get(`/api/chapitres/${testChapitre.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(testChapitre.id);
      expect(response.body.data.titre).toBe(testChapitre.titre);
    });

    it('doit retourner 404 pour un chapitre inexistant', async () => {
      const response = await request(app)
        .get('/api/chapitres/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/chapitres/:id', () => {
    it('doit mettre à jour un chapitre existant', async () => {
      const updatedData = {
        titre: 'Titre de Chapitre Modifié',
        numero: 5,
      };

      const response = await request(app)
        .put(`/api/chapitres/${testChapitre.id}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.titre).toBe('Titre de Chapitre Modifié');
      expect(response.body.data.numero).toBe(5);

      // Vérifier que le chapitre a été mis à jour en base de données
      const updatedChapitre = await Chapitre.findByPk(testChapitre.id);
      expect(updatedChapitre?.numero).toBe(5);
    });

    it('doit échouer avec des données invalides', async () => {
      const invalidUpdateData = {
        titre: '', // Titre vide
        numero: -1, // Numéro invalide
      };

      const response = await request(app)
        .put(`/api/chapitres/${testChapitre.id}`)
        .send(invalidUpdateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/chapitres/:id', () => {
    it('doit supprimer un chapitre existant', async () => {
      const response = await request(app)
        .delete(`/api/chapitres/${testChapitre.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();

      // Vérifier que le chapitre a été supprimé de la base de données
      const deletedChapitre = await Chapitre.findByPk(testChapitre.id);
      expect(deletedChapitre).toBeNull();
    });

    it('doit retourner 404 pour un chapitre inexistant', async () => {
      const response = await request(app)
        .delete('/api/chapitres/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/chapitres/story/:storyId', () => {
    it('doit récupérer les chapitres d\'une story', async () => {
      // Créer des chapitres additionnels pour la story
      await request(app)
        .post('/api/chapitres')
        .send({
          titre: 'Chapitre 2',
          numero: 2,
          storyId: testStory.id,
        })
        .expect(201);

      const response = await request(app)
        .get(`/api/chapitres/story/${testStory.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2); // 1 original + 1 créé
      expect(response.body.data[0].storyId).toBe(testStory.id);
    });

    it('doit retourner un tableau vide pour une story sans chapitres', async () => {
      // Créer une nouvelle story sans chapitres
      const createStoryResponse = await request(app)
        .post('/api/stories')
        .send({
          titre: 'Story sans chapitres',
          auteur: 'Auteur',
          statut: 'brouillon',
          userId: testUser.id,
          sagaId: testSaga.id,
        })
        .expect(201);
      
      const newStory = createStoryResponse.body.data;

      const response = await request(app)
        .get(`/api/chapitres/story/${newStory.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('Tests de chiffrement des données', () => {
    it('doit chiffrer et déchiffrer les données sensibles', async () => {
      const chapitreData = {
        titre: 'Chapitre avec caractères spéciaux éèàç',
        numero: 3,
        storyId: testStory.id,
      };

      // Créer le chapitre
      const createResponse = await request(app)
        .post('/api/chapitres')
        .send(chapitreData)
        .expect(201);

      const createdChapitreId = createResponse.body.data.id;

      // Récupérer le chapitre
      const getResponse = await request(app)
        .get(`/api/chapitres/${createdChapitreId}`)
        .expect(200);

      // Vérifier que les données ont été correctement chiffrées/déchiffrées
      expect(getResponse.body.data.titre).toBe(chapitreData.titre);
      expect(getResponse.body.data.numero).toBe(chapitreData.numero);
    });
  });

  describe('Tests de validation métier', () => {
    it('doit empêcher la création de chapitres avec des numéros dupliqués', async () => {
      const chapitreData1 = {
        titre: 'Chapitre 1',
        numero: 1,
        storyId: testStory.id,
      };

      const chapitreData2 = {
        titre: 'Chapitre 1 bis',
        numero: 1, // Même numéro
        storyId: testStory.id,
      };

      // Créer le premier chapitre
      await request(app)
        .post('/api/chapitres')
        .send(chapitreData1)
        .expect(201);

      // Essayer de créer le second avec le même numéro
      const response = await request(app)
        .post('/api/chapitres')
        .send(chapitreData2)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('doit ordonner les chapitres par numéro', async () => {
      // Créer plusieurs chapitres dans le désordre
      await request(app)
        .post('/api/chapitres')
        .send({
          titre: 'Chapitre 3',
          numero: 3,
          storyId: testStory.id,
        })
        .expect(201);

      await request(app)
        .post('/api/chapitres')
        .send({
          titre: 'Chapitre 2',
          numero: 2,
          storyId: testStory.id,
        })
        .expect(201);

      const response = await request(app)
        .get(`/api/chapitres/story/${testStory.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(3); // 1 original + 2 créés

      // Vérifier que les chapitres sont ordonnés par numéro
      const chapitres = response.body.data;
      expect(chapitres[0].numero).toBe(1);
      expect(chapitres[1].numero).toBe(2);
      expect(chapitres[2].numero).toBe(3);
    });
  });

  describe('Tests de performance', () => {
    it('doit gérer la création de multiples chapitres', async () => {
      const promises = [];
      
      for (let i = 2; i <= 10; i++) {
        const chapitreData = {
          titre: `Chapitre ${i}`,
          numero: i,
          storyId: testStory.id,
        };

        promises.push(
          request(app)
            .post('/api/chapitres')
            .send(chapitreData)
        );
      }

      const responses = await Promise.all(promises);
      
      responses.forEach((response: any) => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Vérifier que tous les chapitres ont été créés
      const allChapitres = await Chapitre.findAll();
      expect(allChapitres.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Tests de relations', () => {
    it('doit vérifier la relation avec Story', async () => {
      const response = await request(app)
        .get(`/api/chapitres/${testChapitre.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.storyId).toBe(testStory.id);
    });

    it('doit supprimer les chapitres quand la story est supprimée (cascade)', async () => {
      const chapitreId = testChapitre.id;

      // Supprimer la story
      await Story.destroy({ where: { id: testStory.id } });

      // Vérifier que le chapitre a été supprimé aussi
      const chapitre = await Chapitre.findByPk(chapitreId);
      expect(chapitre).toBeNull();
    });
  });
}); 