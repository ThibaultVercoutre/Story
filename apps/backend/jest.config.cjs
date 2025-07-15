// Définir les variables d'environnement pour les tests
process.env.NODE_ENV = 'test';
process.env.MASTER_KEY = 'test-master-key-for-encryption-very-secure-123456789';
process.env.JWT_SECRET = 'test-jwt-secret-key';

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
      isolatedModules: true,
      diagnostics: {
        ignoreCodes: [2345, 2322, 2353, 2554, 2559, 2769]
      }
    },
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testMatch: [
    '<rootDir>/src/__tests__/**/*.test.ts',
    '<rootDir>/src/__tests__/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/scripts/**',
    '!src/index.ts',
    '!src/config/**',
    '!src/models/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
    'cobertura'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    },
    // Seuils spécifiques par dossier
    './src/services/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/controllers/': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/utils/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/middleware/': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  // Configuration pour les tests d'intégration
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  // Timeout plus long pour les tests d'intégration
  testTimeout: 30000,
  // Configuration pour les rapports détaillés
  verbose: true,
  // Affichage des tests lents
  slowTestThreshold: 5,
  // Configuration pour les tests en parallèle
  maxWorkers: '50%',
  // Cache pour améliorer les performances
  cache: true,
  cacheDirectory: '.jest-cache'
}; 