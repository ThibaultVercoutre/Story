# Tests Unitaires Backend

Ce projet inclut une suite complète de tests unitaires pour tous les composants du backend.

## Structure des Tests

```
src/__tests__/
├── setup.ts                    # Configuration globale des tests
├── types/
│   └── jest.d.ts               # Types Jest
├── services/
│   ├── encryption.service.test.ts
│   ├── user.service.test.ts
│   └── story.service.test.ts
├── utils/
│   ├── slug.util.test.ts
│   ├── response.util.test.ts
│   └── validation.util.test.ts
└── controllers/
    ├── auth.controller.test.ts
    └── story.controller.test.ts
```

## Installation des Dépendances

```bash
npm install
```

## Exécution des Tests

### Exécuter tous les tests
```bash
npm test
```

### Exécuter les tests en mode watch
```bash
npm run test:watch
```

### Générer un rapport de couverture
```bash
npm run test:coverage
```

## Configuration

Les tests utilisent un environnement isolé avec :
- Variables d'environnement spécifiques aux tests (`.env.test`)
- Mocks pour toutes les dépendances externes
- Configuration Jest optimisée pour TypeScript et ESM

## Types de Tests

### 1. Tests de Services
- **EncryptionService** : Tests de chiffrement/déchiffrement
- **UserService** : Tests de gestion des utilisateurs
- **StoryService** : Tests de gestion des histoires

### 2. Tests d'Utilitaires
- **SlugUtil** : Tests de génération de slugs
- **ResponseUtil** : Tests de réponses API standardisées
- **ValidationUtil** : Tests de validation des données

### 3. Tests de Contrôleurs
- **AuthController** : Tests d'authentification
- **StoryController** : Tests de gestion des histoires

## Couverture de Code

La configuration Jest inclut la collecte automatique de couverture pour :
- Tous les fichiers dans `src/`
- Exclusion des fichiers de configuration et modèles
- Rapports en format text, lcov et html

## Bonnes Pratiques

### Organisation des Tests
- Un fichier de test par fichier source
- Groupement logique avec `describe()`
- Tests spécifiques avec `it()`

### Mocking
- Tous les services externes sont mockés
- Les modèles de base de données sont mockés
- Les utilitaires tiers (JWT, bcrypt) sont mockés

### Assertions
- Tests de succès ET d'erreur pour chaque fonction
- Vérification des appels aux dépendances
- Validation des valeurs de retour

## Exemples de Tests

### Test de Service
```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('devrait créer un utilisateur avec succès', async () => {
      // Arrange
      const userData = { email: 'test@test.com', nom: 'Test', password: 'Pass123' };
      
      // Act
      const result = await UserService.createUser(userData);
      
      // Assert
      expect(result).toBeDefined();
      expect(MockedEncryptionService.encryptRowData).toHaveBeenCalled();
    });
  });
});
```

### Test de Contrôleur
```typescript
describe('AuthController', () => {
  describe('register', () => {
    it('devrait créer un utilisateur avec succès', async () => {
      // Arrange
      mockReq.body = validUserData;
      
      // Act
      await AuthController.register(mockReq as Request, mockRes as Response);
      
      // Assert
      expect(MockedResponseUtil.created).toHaveBeenCalled();
    });
  });
});
```

## Debug des Tests

Pour déboguer un test spécifique :
```bash
# Exécuter un seul fichier de test
npm test -- encryption.service.test.ts

# Exécuter avec plus de détails
npm test -- --verbose

# Exécuter un test spécifique
npm test -- --testNamePattern="should encrypt data correctly"
```

## Variables d'Environnement de Test

Le fichier `.env.test` contient toutes les variables nécessaires pour les tests. Ne modifiez pas ces valeurs sauf si nécessaire pour votre configuration locale. 