import { beforeEach, afterAll } from '@jest/globals';
import dotenv from 'dotenv';

// Charger les variables d'environnement pour les tests
dotenv.config({ path: '.env.test' });

// Configuration par défaut pour les tests
if (!process.env.MASTER_KEY) {
  process.env.MASTER_KEY = 'test-master-key-for-encryption-service-testing-only';
}

// Configuration de la base de données de test
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_NAME = process.env.DB_NAME || 'story_test';
process.env.DB_USER = process.env.DB_USER || 'test_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test_password';

// Configuration JWT pour les tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Mock console.log pour les tests si nécessaire
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  // Réinitialiser les mocks si nécessaire
  jest.clearAllMocks();
});

afterAll(() => {
  // Restaurer les fonctions console originales
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
}); 