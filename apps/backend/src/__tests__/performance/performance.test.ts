import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { DatabaseTestUtils } from '../setup-integration.js';
import { AuthController } from '../../controllers/auth.controller.js';
import { StoryController } from '../../controllers/story.controller.js';
import { ChapitreController } from '../../controllers/chapitre.controller.js';
import { MorceauTexteController } from '../../controllers/morceauTexte.controller.js';

// Configuration de l'application Express pour les tests de performance
const app = express();
app.use(express.json());

// Routes pour les tests de performance
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);
app.post('/api/stories', StoryController.createStory);
app.get('/api/stories', StoryController.getAllStories);
app.get('/api/stories/:id', StoryController.getStoryById);
app.post('/api/chapitres', ChapitreController.createChapitre);
app.get('/api/chapitres/story/:storyId', ChapitreController.getChapitresByStoryId);
app.post('/api/morceaux-texte', MorceauTexteController.createMorceauTexte);

interface PerformanceMetrics {
  min: number;
  max: number;
  avg: number;
  median: number;
  p95: number;
  p99: number;
}

class PerformanceTester {
  static calculateMetrics(times: number[]): PerformanceMetrics {
    const sorted = times.sort((a, b) => a - b);
    const len = sorted.length;
    
    return {
      min: sorted[0],
      max: sorted[len - 1],
      avg: sorted.reduce((a, b) => a + b, 0) / len,
      median: len % 2 === 0 
        ? (sorted[len / 2 - 1] + sorted[len / 2]) / 2 
        : sorted[Math.floor(len / 2)],
      p95: sorted[Math.floor(len * 0.95)],
      p99: sorted[Math.floor(len * 0.99)],
    };
  }

  static async measureOperation<T>(
    operation: () => Promise<T>,
    iterations: number = 10
  ): Promise<{ metrics: PerformanceMetrics; results: T[] }> {
    const times: number[] = [];
    const results: T[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      const result = await operation();
      const end = process.hrtime.bigint();
      
      times.push(Number(end - start) / 1e6); // Convert to milliseconds
      results.push(result);
    }

    return {
      metrics: PerformanceTester.calculateMetrics(times),
      results,
    };
  }

  static printMetrics(name: string, metrics: PerformanceMetrics): void {
    console.log(`\n📊 ${name}:`);
    console.log(`   Min: ${metrics.min.toFixed(2)}ms`);
    console.log(`   Max: ${metrics.max.toFixed(2)}ms`);
    console.log(`   Avg: ${metrics.avg.toFixed(2)}ms`);
    console.log(`   Median: ${metrics.median.toFixed(2)}ms`);
    console.log(`   P95: ${metrics.p95.toFixed(2)}ms`);
    console.log(`   P99: ${metrics.p99.toFixed(2)}ms`);
  }
}

xdescribe('Tests de Performance', () => {
  let testUser: any;
  let testStory: any;
  let testChapitre: any;

  beforeAll(async () => {
    await DatabaseTestUtils.initializeTestDatabase();
  });

  afterAll(async () => {
    await DatabaseTestUtils.closeTestDatabase();
  });

  beforeEach(async () => {
    await DatabaseTestUtils.cleanTestDatabase();
    
    const testData = await DatabaseTestUtils.createTestData();
    testUser = testData.testUser;
    testStory = testData.testStory;
    testChapitre = testData.testChapitre;
  });

  describe('⚡ Performance des Endpoints d\'Authentification', () => {
    it('doit avoir des temps de réponse acceptables pour l\'inscription', async () => {
      const { metrics } = await PerformanceTester.measureOperation(async () => {
        const uniqueEmail = `test-${Date.now()}-${Math.random()}@example.com`;
        return request(app)
          .post('/api/auth/register')
          .send({
            email: uniqueEmail,
            nom: 'Performance Test User',
            password: 'PerformanceTest123!',
            confirmPassword: 'PerformanceTest123!',
          });
      }, 20);

      PerformanceTester.printMetrics('Inscription Utilisateur', metrics);

      // Assertions de performance
      expect(metrics.avg).toBeLessThan(500); // Moyenne < 500ms
      expect(metrics.p95).toBeLessThan(1000); // 95% < 1s
      expect(metrics.max).toBeLessThan(2000); // Maximum < 2s
    });

    it('doit avoir des temps de réponse acceptables pour la connexion', async () => {
      // Créer un utilisateur de test
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'performance@example.com',
          nom: 'Performance Test User',
          password: 'PerformanceTest123!',
          confirmPassword: 'PerformanceTest123!',
        });

      const { metrics } = await PerformanceTester.measureOperation(async () => {
        return request(app)
          .post('/api/auth/login')
          .send({
            email: 'performance@example.com',
            password: 'PerformanceTest123!',
          });
      }, 30);

      PerformanceTester.printMetrics('Connexion Utilisateur', metrics);

      expect(metrics.avg).toBeLessThan(300); // Moyenne < 300ms
      expect(metrics.p95).toBeLessThan(500); // 95% < 500ms
      expect(metrics.max).toBeLessThan(1000); // Maximum < 1s
    });
  });

  describe('🚀 Performance des Opérations CRUD', () => {
    it('doit créer des stories rapidement', async () => {
      const { metrics } = await PerformanceTester.measureOperation(async () => {
        const uniqueTitle = `Story Performance Test ${Date.now()}-${Math.random()}`;
        return request(app)
          .post('/api/stories')
          .send({
            titre: uniqueTitle,
            auteur: 'Performance Author',
            statut: 'brouillon',
            userId: testUser.id,
          });
      }, 25);

      PerformanceTester.printMetrics('Création de Story', metrics);

      expect(metrics.avg).toBeLessThan(200); // Moyenne < 200ms
      expect(metrics.p95).toBeLessThan(400); // 95% < 400ms
    });

    it('doit récupérer des stories rapidement', async () => {
      // Créer plusieurs stories pour le test
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/stories')
          .send({
            titre: `Performance Story ${i}`,
            auteur: 'Performance Author',
            statut: 'brouillon',
            userId: testUser.id,
          });
      }

      const { metrics } = await PerformanceTester.measureOperation(async () => {
        return request(app).get('/api/stories');
      }, 50);

      PerformanceTester.printMetrics('Récupération de Stories', metrics);

      expect(metrics.avg).toBeLessThan(150); // Moyenne < 150ms
      expect(metrics.p95).toBeLessThan(300); // 95% < 300ms
    });

    it('doit récupérer une story par ID rapidement', async () => {
      const { metrics } = await PerformanceTester.measureOperation(async () => {
        return request(app).get(`/api/stories/${testStory.id}`);
      }, 40);

      PerformanceTester.printMetrics('Récupération Story par ID', metrics);

      expect(metrics.avg).toBeLessThan(100); // Moyenne < 100ms
      expect(metrics.p95).toBeLessThan(200); // 95% < 200ms
    });
  });

  describe('📖 Performance des Chapitres et Morceaux de Texte', () => {
    it('doit créer des chapitres rapidement', async () => {
      const { metrics } = await PerformanceTester.measureOperation(async () => {
        const uniqueNumber = Math.floor(Math.random() * 10000);
        return request(app)
          .post('/api/chapitres')
          .send({
            titre: `Chapitre Performance ${uniqueNumber}`,
            numero: uniqueNumber,
            storyId: testStory.id,
          });
      }, 20);

      PerformanceTester.printMetrics('Création de Chapitre', metrics);

      expect(metrics.avg).toBeLessThan(200); // Moyenne < 200ms
      expect(metrics.p95).toBeLessThan(400); // 95% < 400ms
    });

    it('doit récupérer les chapitres d\'une story rapidement', async () => {
      // Créer plusieurs chapitres
      for (let i = 1; i <= 20; i++) {
        await request(app)
          .post('/api/chapitres')
          .send({
            titre: `Chapitre Performance ${i}`,
            numero: i,
            storyId: testStory.id,
          });
      }

      const { metrics } = await PerformanceTester.measureOperation(async () => {
        return request(app).get(`/api/chapitres/story/${testStory.id}`);
      }, 30);

      PerformanceTester.printMetrics('Récupération Chapitres par Story', metrics);

      expect(metrics.avg).toBeLessThan(200); // Moyenne < 200ms
      expect(metrics.p95).toBeLessThan(400); // 95% < 400ms
    });

    it('doit créer des morceaux de texte rapidement', async () => {
      const { metrics } = await PerformanceTester.measureOperation(async () => {
        const uniqueOrder = Math.floor(Math.random() * 10000);
        return request(app)
          .post('/api/morceaux-texte')
          .send({
            contenu: `Contenu de performance test très long qui contient beaucoup de texte pour simuler un vrai morceau de texte d'un chapitre avec du contenu substantiel ${uniqueOrder}`,
            type: 'TEXTE',
            ordre: uniqueOrder,
            chapitreId: testChapitre.id,
          });
      }, 15);

      PerformanceTester.printMetrics('Création de Morceau de Texte', metrics);

      expect(metrics.avg).toBeLessThan(250); // Moyenne < 250ms
      expect(metrics.p95).toBeLessThan(500); // 95% < 500ms
    });
  });

  describe('🔄 Tests de Charge et Concurrence', () => {
    it('doit gérer des requêtes concurrentes de lecture', async () => {
      const concurrentRequests = 50;
      const promises = Array(concurrentRequests).fill(null).map(() =>
        request(app).get(`/api/stories/${testStory.id}`)
      );

      const start = process.hrtime.bigint();
      const responses = await Promise.all(promises);
      const end = process.hrtime.bigint();

      const totalTime = Number(end - start) / 1e6; // Convert to milliseconds
      const avgTimePerRequest = totalTime / concurrentRequests;

      console.log(`\n🔄 Tests de Concurrence (${concurrentRequests} requêtes):`);
      console.log(`   Temps total: ${totalTime.toFixed(2)}ms`);
      console.log(`   Temps moyen par requête: ${avgTimePerRequest.toFixed(2)}ms`);
      console.log(`   Débit: ${(concurrentRequests / (totalTime / 1000)).toFixed(2)} req/s`);

      // Vérifier que toutes les requêtes ont réussi
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Performance acceptable même avec la concurrence
      expect(avgTimePerRequest).toBeLessThan(200); // Moyenne < 200ms par requête
      expect(totalTime).toBeLessThan(5000); // Total < 5s pour 50 requêtes
    });

    it('doit gérer des créations concurrentes', async () => {
      const concurrentCreations = 20;
      const promises = Array(concurrentCreations).fill(null).map((_, index) =>
        request(app)
          .post('/api/chapitres')
          .send({
            titre: `Chapitre Concurrent ${index}`,
            numero: index + 100, // Éviter les conflits
            storyId: testStory.id,
          })
      );

      const start = process.hrtime.bigint();
      const responses = await Promise.all(promises);
      const end = process.hrtime.bigint();

      const totalTime = Number(end - start) / 1e6;
      const avgTimePerRequest = totalTime / concurrentCreations;

      console.log(`\n✍️ Créations Concurrentes (${concurrentCreations} requêtes):`);
      console.log(`   Temps total: ${totalTime.toFixed(2)}ms`);
      console.log(`   Temps moyen par création: ${avgTimePerRequest.toFixed(2)}ms`);

      // Vérifier que toutes les créations ont réussi
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      expect(avgTimePerRequest).toBeLessThan(300); // Moyenne < 300ms par création
    });
  });

  describe('🔒 Performance du Chiffrement', () => {
    it('doit chiffrer et déchiffrer rapidement', async () => {
      const longText = 'Lorem ipsum '.repeat(100); // Texte long pour tester

      const { metrics } = await PerformanceTester.measureOperation(async () => {
        const uniqueTitle = `Story avec long texte ${Date.now()}-${Math.random()}`;
        return request(app)
          .post('/api/stories')
          .send({
            titre: uniqueTitle,
            auteur: longText, // Utiliser un texte long pour l'auteur
            statut: 'brouillon',
            userId: testUser.id,
          });
      }, 15);

      PerformanceTester.printMetrics('Chiffrement de Données Longues', metrics);

      expect(metrics.avg).toBeLessThan(300); // Moyenne < 300ms même avec chiffrement
      expect(metrics.p95).toBeLessThan(600); // 95% < 600ms
    });
  });

  describe('📊 Monitoring des Ressources', () => {
    it('doit monitorer l\'utilisation mémoire', async () => {
      const initialMemory = process.memoryUsage();
      
      // Créer beaucoup de données pour tester la mémoire
      const promises = Array(100).fill(null).map((_, index) =>
        request(app)
          .post('/api/stories')
          .send({
            titre: `Memory Test Story ${index}`,
            auteur: 'Memory Test Author',
            statut: 'brouillon',
            userId: testUser.id,
          })
      );

      await Promise.all(promises);

      const finalMemory = process.memoryUsage();
      const memoryIncrease = {
        rss: (finalMemory.rss - initialMemory.rss) / 1024 / 1024, // MB
        heapUsed: (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024, // MB
        heapTotal: (finalMemory.heapTotal - initialMemory.heapTotal) / 1024 / 1024, // MB
      };

      console.log('\n💾 Utilisation Mémoire:');
      console.log(`   RSS: +${memoryIncrease.rss.toFixed(2)}MB`);
      console.log(`   Heap Used: +${memoryIncrease.heapUsed.toFixed(2)}MB`);
      console.log(`   Heap Total: +${memoryIncrease.heapTotal.toFixed(2)}MB`);

      // Vérifier qu'il n'y a pas de fuite mémoire importante
      expect(memoryIncrease.heapUsed).toBeLessThan(50); // < 50MB d'augmentation
    });

    it('doit avoir des temps de GC acceptables', async () => {
      // Forcer le garbage collection si disponible
      if (global.gc) {
        const start = process.hrtime.bigint();
        global.gc();
        const end = process.hrtime.bigint();
        
        const gcTime = Number(end - start) / 1e6;
        console.log(`\n🗑️ Temps de Garbage Collection: ${gcTime.toFixed(2)}ms`);
        
        expect(gcTime).toBeLessThan(100); // GC < 100ms
      } else {
        console.log('\n🗑️ Garbage Collection non disponible (lancez avec --expose-gc)');
      }
    });
  });

  describe('📈 Benchmarks et Comparaisons', () => {
    it('doit comparer les performances selon la taille des données', async () => {
      const sizes = [10, 50, 100, 200];
      const results: { [size: number]: PerformanceMetrics } = {};

      for (const size of sizes) {
        const { metrics } = await PerformanceTester.measureOperation(async () => {
          const longContent = 'Test content '.repeat(size);
          const uniqueOrder = Math.floor(Math.random() * 10000);
          
          return request(app)
            .post('/api/morceaux-texte')
            .send({
              contenu: longContent,
              type: 'TEXTE',
              ordre: uniqueOrder,
              chapitreId: testChapitre.id,
            });
        }, 10);

        results[size] = metrics;
        PerformanceTester.printMetrics(`Contenu taille ${size}`, metrics);
      }

      // Vérifier que les performances se dégradent linéairement, pas exponentiellement
      const ratio = results[200].avg / results[10].avg;
      expect(ratio).toBeLessThan(5); // Max 5x plus lent pour 20x plus de données
    });
  });
}); 