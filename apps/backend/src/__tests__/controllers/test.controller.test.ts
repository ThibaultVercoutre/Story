import { Request, Response } from 'express';
import { TestController } from '../../controllers/test.controller.js';
import { TestService } from '../../services/test.service.js';
import { ResponseUtil } from '../../utils/response.util.js';

// Mock des dépendances
jest.mock('../../services/test.service.js');
jest.mock('../../utils/response.util.js');

const MockedTestService = TestService as jest.Mocked<typeof TestService>;
const MockedResponseUtil = ResponseUtil as jest.Mocked<typeof ResponseUtil>;

describe('TestController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      query: {},
      params: {},
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis() as never,
      json: jest.fn() as never,
    };
    
    // Mock console pour éviter le spam dans les tests
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('getAllUsersWithFullData', () => {
    const mockResult = {
      data: [],
      stats: {
        totalUsers: 5,
        totalSagas: 10,
        totalStories: 8,
        totalChapitres: 15,
        totalMorceauxTexte: 45,
        executionTimeSeconds: 2.5
      },
      performance: {
        queryTime: 120,
        decryptionTime: 800,
        decryptionOperationsActual: 50,
        decryptionErrors: 0
      }
    };

    beforeEach(() => {
      MockedTestService.getAllUsersWithFullData.mockResolvedValue(mockResult);
    });

    it('devrait récupérer les données avec les paramètres par défaut', async () => {
      await TestController.getAllUsersWithFullData(mockReq as Request, mockRes as Response);

      expect(MockedTestService.getAllUsersWithFullData).toHaveBeenCalledWith({
        limit: 5,
        offset: 0,
        maxSagas: 3,
        maxStories: 2,
        maxChapitres: 2,
        maxMorceaux: 10
      });
      expect(MockedResponseUtil.success).toHaveBeenCalledWith(
        mockRes,
        mockResult,
        expect.stringContaining('Test terminé en')
      );
    });

    it('devrait utiliser les paramètres de query personnalisés', async () => {
      mockReq.query = {
        limit: '10',
        offset: '5',
        maxSagas: '5',
        maxStories: '3',
        maxChapitres: '3',
        maxMorceaux: '20'
      };

      await TestController.getAllUsersWithFullData(mockReq as Request, mockRes as Response);

      expect(MockedTestService.getAllUsersWithFullData).toHaveBeenCalledWith({
        limit: 10,
        offset: 5,
        maxSagas: 5,
        maxStories: 3,
        maxChapitres: 3,
        maxMorceaux: 20
      });
    });

    it('devrait retourner une erreur si la limite dépasse 50', async () => {
      mockReq.query = { limit: '100' };

      await TestController.getAllUsersWithFullData(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.error).toHaveBeenCalledWith(
        mockRes,
        'Limite maximum: 50 utilisateurs pour éviter les dépassements mémoire',
        400
      );
      expect(MockedTestService.getAllUsersWithFullData).not.toHaveBeenCalled();
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      MockedTestService.getAllUsersWithFullData.mockRejectedValue(error);

      await TestController.getAllUsersWithFullData(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.handleError).toHaveBeenCalledWith(
        mockRes,
        error,
        'le test de performance complet'
      );
    });
  });

  describe('getAllUsersFullDataDangerous', () => {
    const mockResult = {
      data: [],
      stats: {
        totalUsers: 100,
        totalSagas: 200,
        totalStories: 150,
        totalChapitres: 300,
        totalMorceauxTexte: 1000,
        executionTimeSeconds: 10.5
      },
      performance: {
        queryTime: 2000,
        decryptionTime: 8000,
        decryptionOperationsActual: 500,
        decryptionErrors: 2
      }
    };

    beforeEach(() => {
      MockedTestService.getAllUsersFullDataDangerous.mockResolvedValue(mockResult);
    });

    it('devrait exécuter le test dangereux', async () => {
      await TestController.getAllUsersFullDataDangerous(mockReq as Request, mockRes as Response);

      expect(MockedTestService.getAllUsersFullDataDangerous).toHaveBeenCalled();
      expect(MockedResponseUtil.success).toHaveBeenCalledWith(
        mockRes,
        mockResult,
        expect.stringContaining('Test DANGEREUX terminé en')
      );
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Memory overflow');
      MockedTestService.getAllUsersFullDataDangerous.mockRejectedValue(error);

      await TestController.getAllUsersFullDataDangerous(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.handleError).toHaveBeenCalledWith(
        mockRes,
        error,
        'le test de performance dangereux'
      );
    });
  });

  describe('getPerformanceStats', () => {
    const mockResult = {
      stats: {
        totalUsers: 25,
        totalSagas: 50,
        totalStories: 40,
        totalChapitres: 80,
        totalMorceauxTexte: 200,
        totalRecords: 395,
        executionTimeSeconds: 0.5
      }
    };

    beforeEach(() => {
      MockedTestService.getPerformanceStats.mockResolvedValue(mockResult);
    });

    it('devrait récupérer les statistiques de performance', async () => {
      await TestController.getPerformanceStats(mockReq as Request, mockRes as Response);

      expect(MockedTestService.getPerformanceStats).toHaveBeenCalled();
      expect(MockedResponseUtil.success).toHaveBeenCalledWith(
        mockRes,
        mockResult,
        'Statistiques récupérées en 0.5s - 395 enregistrements au total'
      );
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Stats error');
      MockedTestService.getPerformanceStats.mockRejectedValue(error);

      await TestController.getPerformanceStats(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.handleError).toHaveBeenCalledWith(
        mockRes,
        error,
        'la récupération des statistiques'
      );
    });
  });

  describe('getTestSample', () => {
    const mockResult = {
      data: [],
      performance: {
        totalTime: 150,
        queryTime: 50,
        decryptionTime: 100,
        decryptionOperationsActual: 10,
        decryptionErrors: 0,
        averageTimePerUser: 15,
        averageDecryptionPerUser: 10
      }
    };

    beforeEach(() => {
      MockedTestService.getTestSample.mockResolvedValue(mockResult);
    });

    it('devrait utiliser la limite par défaut de 10', async () => {
      await TestController.getTestSample(mockReq as Request, mockRes as Response);

      expect(MockedTestService.getTestSample).toHaveBeenCalledWith(10);
      expect(MockedResponseUtil.success).toHaveBeenCalledWith(
        mockRes,
        mockResult,
        expect.stringContaining('Test d\'échantillon terminé en')
      );
    });

    it('devrait utiliser la limite du paramètre', async () => {
      mockReq.params = { limit: '25' };

      await TestController.getTestSample(mockReq as Request, mockRes as Response);

      expect(MockedTestService.getTestSample).toHaveBeenCalledWith(25);
    });

    it('devrait utiliser la limite de query si pas de paramètre', async () => {
      mockReq.query = { limit: '15' };

      await TestController.getTestSample(mockReq as Request, mockRes as Response);

      expect(MockedTestService.getTestSample).toHaveBeenCalledWith(15);
    });

    it('devrait retourner une erreur pour une limite invalide (trop grande)', async () => {
      mockReq.params = { limit: '150' };

      await TestController.getTestSample(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.error).toHaveBeenCalledWith(
        mockRes,
        'La limite doit être un nombre entre 1 et 100',
        400
      );
      expect(MockedTestService.getTestSample).not.toHaveBeenCalled();
    });

    it('devrait utiliser la valeur par défaut pour limite zéro', async () => {
      mockReq.params = { limit: '0' };
      mockReq.query = {};

      await TestController.getTestSample(mockReq as Request, mockRes as Response);

      // Avec parseInt('0') || 10, la valeur devient 10
      expect(MockedTestService.getTestSample).toHaveBeenCalledWith(10);
      expect(MockedResponseUtil.success).toHaveBeenCalled();
    });

    it('devrait utiliser la valeur par défaut pour limite non numérique', async () => {
      mockReq.params = { limit: 'abc' };
      mockReq.query = {};

      await TestController.getTestSample(mockReq as Request, mockRes as Response);

      // Avec parseInt('abc') || 10, la valeur devient 10
      expect(MockedTestService.getTestSample).toHaveBeenCalledWith(10);
      expect(MockedResponseUtil.success).toHaveBeenCalled();
    });

    it('devrait retourner une erreur pour une limite négative', async () => {
      mockReq.params = { limit: '-5' };
      mockReq.query = {};

      await TestController.getTestSample(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.error).toHaveBeenCalledWith(
        mockRes,
        'La limite doit être un nombre entre 1 et 100',
        400
      );
      expect(MockedTestService.getTestSample).not.toHaveBeenCalled();
    });

    it('devrait gérer les erreurs du service', async () => {
      const error = new Error('Sample error');
      MockedTestService.getTestSample.mockRejectedValue(error);

      await TestController.getTestSample(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.handleError).toHaveBeenCalledWith(
        mockRes,
        error,
        'le test d\'échantillon'
      );
    });
  });

  describe('getHealthCheck', () => {
    const mockStatsResult = {
      stats: {
        totalRecords: 500,
        executionTimeSeconds: 0.1
      }
    };

    beforeEach(() => {
      MockedTestService.getPerformanceStats.mockResolvedValue(mockStatsResult);
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(1000) // startTime
        .mockReturnValueOnce(1150); // endTime
    });

    it('devrait retourner un statut healthy', async () => {
      await TestController.getHealthCheck(mockReq as Request, mockRes as Response);

      expect(MockedTestService.getPerformanceStats).toHaveBeenCalled();
      expect(MockedResponseUtil.success).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({
          status: 'healthy',
          database: 'connected',
          responseTime: '150ms',
          totalRecords: 500,
          ready: true
        }),
        'Système opérationnel - 500 enregistrements disponibles'
      );
    });

    it('devrait gérer les erreurs et retourner unhealthy', async () => {
      const error = new Error('Database connection failed');
      MockedTestService.getPerformanceStats.mockRejectedValue(error);

      await TestController.getHealthCheck(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.error).toHaveBeenCalledWith(
        mockRes,
        'Système indisponible',
        503,
        expect.objectContaining({
          status: 'unhealthy',
          database: 'disconnected',
          error: 'Database connection failed',
          ready: false
        })
      );
    });
  });

  describe('getTestInfo', () => {
    it('devrait retourner les informations sur les tests', async () => {
      await TestController.getTestInfo(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.success).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({
          availableTests: expect.any(Array),
          examples: expect.any(Array),
          recommendations: expect.any(Array),
          performanceMetrics: expect.any(Array)
        }),
        'Informations sur les tests de performance disponibles'
      );
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Info error');
      MockedResponseUtil.success.mockImplementation(() => {
        throw error;
      });

      await TestController.getTestInfo(mockReq as Request, mockRes as Response);

      expect(MockedResponseUtil.handleError).toHaveBeenCalledWith(
        mockRes,
        error,
        'la récupération des informations de test'
      );
    });
  });
});