import { Request, Response } from 'express';
import { TestService } from '../services/test.service.js';
import { ResponseUtil } from '../utils/response.util.js';

export class TestController {
  /**
   * GET /api/test/users-full
   * GET /api/test/users-full?limit=10&offset=0&maxSagas=5&maxStories=3&maxChapitres=2&maxMorceaux=15
   * Récupère tous les users avec toutes leurs données imbriquées
   * Route de test de performance pour le déchiffrement
   */
  public static async getAllUsersWithFullData(req: Request, res: Response): Promise<void> {
    try {
      // Récupérer les paramètres de query
      const limit = parseInt(req.query.limit as string) || 5;
      const offset = parseInt(req.query.offset as string) || 0;
      const maxSagas = parseInt(req.query.maxSagas as string) || 3;
      const maxStories = parseInt(req.query.maxStories as string) || 2;
      const maxChapitres = parseInt(req.query.maxChapitres as string) || 2;
      const maxMorceaux = parseInt(req.query.maxMorceaux as string) || 10;

      // Validation des limites
      if (limit > 50) {
        ResponseUtil.error(res, 'Limite maximum: 50 utilisateurs pour éviter les dépassements mémoire', 400);
        return;
      }

      console.log('🚀 Démarrage du test de performance avec limites...');
      
      const result = await TestService.getAllUsersWithFullData({
        limit,
        offset,
        maxSagas,
        maxStories,
        maxChapitres,
        maxMorceaux
      });
      
      console.log('✅ Test de performance terminé:', {
        users: result.stats.totalUsers,
        sagas: result.stats.totalSagas,
        stories: result.stats.totalStories,
        chapitres: result.stats.totalChapitres,
        morceauxTexte: result.stats.totalMorceauxTexte,
        tempsTotal: `${result.stats.executionTimeSeconds}s`,
        tempsRequête: `${result.performance.queryTime}ms`,
        tempsDéchiffrement: `${result.performance.decryptionTime}ms`,
        opérationsDéchiffrement: result.performance.decryptionOperationsActual,
        erreursDéchiffrement: result.performance.decryptionErrors
      });
      
      ResponseUtil.success(res, result, 
        `Test terminé en ${result.stats.executionTimeSeconds}s (SQL: ${result.performance.queryTime}ms, Déchiffrement: ${result.performance.decryptionTime}ms) - ${result.performance.decryptionOperationsActual} opérations de déchiffrement effectuées`
      );
    } catch (error) {
      console.error('❌ Erreur lors du test de performance:', error);
      ResponseUtil.handleError(res, error, 'le test de performance complet');
    }
  }

  /**
   * GET /api/test/users-full-dangerous
   * ⚠️ ROUTE DANGEREUSE - Récupère VRAIMENT toutes les données sans limite
   * À utiliser seulement sur des bases de données de test avec peu de données
   */
  public static async getAllUsersFullDataDangerous(req: Request, res: Response): Promise<void> {
    try {
      console.log('⚠️ 🚀 DÉMARRAGE DU TEST DANGEREUX - TOUTES LES DONNÉES SANS LIMITE!');
      
      const result = await TestService.getAllUsersFullDataDangerous();
      
      console.log('✅ Test dangereux terminé:', {
        users: result.stats.totalUsers,
        sagas: result.stats.totalSagas,
        stories: result.stats.totalStories,
        chapitres: result.stats.totalChapitres,
        morceauxTexte: result.stats.totalMorceauxTexte,
        tempsTotal: `${result.stats.executionTimeSeconds}s`,
        tempsRequête: `${result.performance.queryTime}ms`,
        tempsDéchiffrement: `${result.performance.decryptionTime}ms`,
        opérationsDéchiffrement: result.performance.decryptionOperationsActual,
        erreursDéchiffrement: result.performance.decryptionErrors
      });
      
      ResponseUtil.success(res, result, 
        `⚠️ Test DANGEREUX terminé en ${result.stats.executionTimeSeconds}s (SQL: ${result.performance.queryTime}ms, Déchiffrement: ${result.performance.decryptionTime}ms) - ${result.performance.decryptionOperationsActual} opérations de déchiffrement SANS LIMITE`
      );
    } catch (error) {
      console.error('❌ Erreur lors du test dangereux:', error);
      ResponseUtil.handleError(res, error, 'le test de performance dangereux');
    }
  }

  /**
   * GET /api/test/stats
   * Récupère uniquement les statistiques sans les données
   * Pour un aperçu rapide des performances
   */
  public static async getPerformanceStats(req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 Récupération des statistiques de performance...');
      
      const result = await TestService.getPerformanceStats();
      
      console.log('✅ Statistiques récupérées:', result.stats);
      
      ResponseUtil.success(res, result, 
        `Statistiques récupérées en ${result.stats.executionTimeSeconds}s - ${result.stats.totalRecords} enregistrements au total`
      );
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      ResponseUtil.handleError(res, error, 'la récupération des statistiques');
    }
  }

  /**
   * GET /api/test/sample
   * GET /api/test/sample/:limit
   * Test de déchiffrement sur un échantillon limité
   * Pour tester les performances sans surcharger le système
   */
  public static async getTestSample(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.params.limit) || parseInt(req.query.limit as string) || 10;
      
      if (isNaN(limit) || limit < 1 || limit > 100) {
        ResponseUtil.error(res, 'La limite doit être un nombre entre 1 et 100', 400);
        return;
      }
      
      console.log(`🔬 Démarrage du test sur échantillon de ${limit} utilisateurs...`);
      
      const result = await TestService.getTestSample(limit);
      
      console.log('✅ Test d\'échantillon terminé:', {
        utilisateurs: result.data.length,
        tempsTotal: `${result.performance.totalTime}ms`,
        tempsRequête: `${result.performance.queryTime}ms`,
        tempsDéchiffrement: `${result.performance.decryptionTime}ms`,
        opérationsDéchiffrement: result.performance.decryptionOperationsActual,
        erreursDéchiffrement: result.performance.decryptionErrors,
        moyenneParUser: `${result.performance.averageTimePerUser}ms`,
        moyenneDéchiffrementParUser: `${result.performance.averageDecryptionPerUser}ms`
      });
      
      ResponseUtil.success(res, result, 
        `Test d'échantillon terminé en ${result.performance.totalTime}ms (SQL: ${result.performance.queryTime}ms, Déchiffrement: ${result.performance.decryptionTime}ms) - ${result.performance.decryptionOperationsActual} opérations de déchiffrement sur ${result.data.length} utilisateurs`
      );
    } catch (error) {
      console.error('❌ Erreur lors du test d\'échantillon:', error);
      ResponseUtil.handleError(res, error, 'le test d\'échantillon');
    }
  }

  /**
   * GET /api/test/health
   * Vérification de l'état du système avant les tests
   */
  public static async getHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Test de connectivité basique
      const result = await TestService.getPerformanceStats();
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const healthInfo = {
        status: 'healthy',
        database: 'connected',
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
        totalRecords: result.stats.totalRecords,
        ready: true
      };
      
      ResponseUtil.success(res, healthInfo, 
        `Système opérationnel - ${result.stats.totalRecords} enregistrements disponibles`
      );
    } catch (error) {
      console.error('❌ Problème de santé du système:', error);
      
      const healthInfo = {
        status: 'unhealthy',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
        error: (error as any).message,
        ready: false
      };
      
      ResponseUtil.error(res, 'Système indisponible', 503, healthInfo as any);
    }
  }

  /**
   * GET /api/test/info
   * Informations sur les tests disponibles
   */
  public static async getTestInfo(req: Request, res: Response): Promise<void> {
    try {
      const testInfo = {
        availableTests: [
          {
            endpoint: '/api/test/users-full',
            description: 'Test de performance avec limites de sécurité',
            defaultLimits: 'Par défaut: 5 users, 3 sagas, 2 stories, 2 chapitres, 10 morceaux',
            parameters: 'limit, offset, maxSagas, maxStories, maxChapitres, maxMorceaux',
            maxLimit: '50 utilisateurs maximum',
            recommended: '✅ Sécurisé - Recommandé',
            method: 'GET'
          },
          {
            endpoint: '/api/test/users-full-dangerous',
            description: '⚠️ Test DANGEREUX - récupère TOUTES les données sans limite',
            warning: '🚨 PEUT CRASHER NODE.JS - Utiliser seulement sur BDD de test',
            memoryRisk: 'Risque élevé de dépassement mémoire',
            method: 'GET'
          },
          {
            endpoint: '/api/test/stats',
            description: 'Statistiques rapides - compte les enregistrements sans les récupérer',
            performance: '⚡ Très rapide',
            method: 'GET'
          },
          {
            endpoint: '/api/test/sample/:limit',
            description: 'Test sur échantillon - récupère un nombre limité d\'utilisateurs',
            parameters: 'limit: nombre entre 1 et 100 (défaut: 10)',
            recommended: '✅ Recommandé pour les tests',
            method: 'GET'
          },
          {
            endpoint: '/api/test/health',
            description: 'Vérification de l\'état du système',
            purpose: '🏥 Diagnostic système',
            method: 'GET'
          }
        ],
        examples: [
          'GET /api/test/users-full?limit=10&maxSagas=5&maxStories=3',
          'GET /api/test/users-full?offset=10&limit=5',
          'GET /api/test/sample/20',
          'GET /api/test/stats'
        ],
        recommendations: [
          'Commencez par /api/test/health pour vérifier l\'état',
          'Utilisez /api/test/stats pour voir le volume de données',
          'Testez avec /api/test/sample/5 avant le test complet',
          'Utilisez /api/test/users-full avec des limites raisonnables',
          '⚠️ ÉVITEZ /api/test/users-full-dangerous sauf sur une BDD de test'
        ],
        performanceMetrics: [
          'Temps total d\'exécution (ms et secondes)',
          'Temps de requête SQL séparé du déchiffrement',
          'Temps de déchiffrement pur (AES-GCM)',
          'Nombre d\'enregistrements récupérés',
          'Opérations de déchiffrement réellement effectuées',
          'Erreurs de déchiffrement détectées',
          'Temps moyen par enregistrement',
          'Temps moyen de déchiffrement par enregistrement'
        ]
      };
      
      ResponseUtil.success(res, testInfo, 'Informations sur les tests de performance disponibles');
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des informations:', error);
      ResponseUtil.handleError(res, error, 'la récupération des informations de test');
    }
  }
} 