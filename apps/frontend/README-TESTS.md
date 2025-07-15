# 🧪 Tests Frontend - Guide Complet

Ce guide décrit l'implémentation du système de tests pour le frontend de l'application Story.

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Configuration](#configuration)
3. [Structure des tests](#structure-des-tests)
4. [Exécution des tests](#exécution-des-tests)
5. [Couverture de code](#couverture-de-code)
6. [Bonnes pratiques](#bonnes-pratiques)
7. [Troubleshooting](#troubleshooting)

## 🎯 Vue d'ensemble

Le système de tests frontend utilise **Vitest 3.x** comme framework de test principal avec :

- **Utilitaires** : Helpers et fonctions utilitaires
- **Tests simples** : Tests unitaires basiques
- **Couverture** : Analyse de la couverture de code

### 🛠️ Stack technique

- **Framework de test** : Vitest 3.x
- **Environnement DOM** : Happy DOM
- **Couverture** : @vitest/coverage-v8
- **UI de test** : @vitest/ui

## ⚙️ Configuration

### Fichiers de configuration

#### `vitest.config.ts`
Configuration principale utilisant Vitest :

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      thresholds: {
        global: {
          branches: 70,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
```

#### `test/setup.ts`
Configuration globale des mocks et utilitaires :

```typescript
import { vi } from 'vitest'

// Mock pour localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
})

// Mock pour fetch
global.fetch = vi.fn()

// Reset des mocks après chaque test
afterEach(() => {
  vi.clearAllMocks()
})
```

## 📁 Structure des tests

```
test/
├── setup.ts                 # Configuration globale
├── simple.test.ts           # Tests de base
├── utils/
│   ├── test-helpers.ts      # Utilitaires de test
│   ├── coverage-analysis.ts # Analyse de couverture
│   └── helpers.test.ts      # Tests des utilitaires
```

## 🔧 Utilitaires de test

### `test-helpers.ts`

Fournit des fonctions utilitaires pour simplifier l'écriture des tests :

```typescript
// Générateurs de données mock
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  token: 'mock-jwt-token',
  ...overrides
})

// Wrapper de composant avec mocks
export const createComponentWrapper = (component, options = {}) => {
  return mount(component, {
    global: {
      mocks: {
        $router: { push: vi.fn() },
        $route: { params: {}, query: {} }
      },
      stubs: {
        NuxtLink: { template: '<a href="#"><slot /></a>' },
        UButton: { template: '<button><slot /></button>' }
      },
      ...options.global
    },
    ...options
  })
}

// Mock des appels fetch
export const mockFetch = (response, status = 200) => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response)
  })
  global.fetch = fetchMock
  return fetchMock
}
```

## 🚀 Exécution des tests

### Scripts disponibles

```bash
# Tests en mode watch
npm run test

# Tests en mode watch
npm run test:watch

# Interface utilisateur des tests
npm run test:ui

# Tests avec couverture
npm run test:coverage

# Tests unitaires uniquement
npm run test:unit

# Tests pour CI/CD
npm run test:ci
```

### Exemples d'utilisation

```bash
# Exécuter tous les tests
npm run test

# Tests avec couverture et analyse
npm run test:coverage:analyze

# Tests en mode interactif
npm run test:ui
```

## 📊 Couverture de code

### Seuils de couverture

Le projet maintient des seuils de couverture élevés :

- **Global** : 85% branches, 90% fonctions/lignes/statements
- **Composables** : 90% branches, 95% fonctions/lignes/statements
- **Services** : 90% branches, 95% fonctions/lignes/statements
- **Utilitaires** : 95% branches, 95% fonctions/lignes/statements

### Analyse de couverture

Un script d'analyse automatique génère des rapports détaillés :

```bash
npm run test:coverage:analyze
```

Génère :
- Rapport HTML dans `./coverage/`
- Rapport markdown dans `./coverage/coverage-analysis.md`
- Recommandations d'amélioration

## 🧪 Exemples de tests

### Test de composable

```typescript
describe('useAuth', () => {
  it('devrait connecter un utilisateur avec succès', async () => {
    const mockResponse = {
      success: true,
      data: { token: 'mock-token', user: createMockUser() }
    }
    
    vi.mocked(AuthService.login).mockResolvedValue(mockResponse)
    
    const auth = useAuth()
    await auth.login({ email: 'test@example.com', password: 'password' })
    
    expect(auth.isLoggedIn.value).toBe(true)
  })
})
```

### Test de service

```typescript
describe('AuthService', () => {
  it('devrait appeler l\'API avec les bonnes données', async () => {
    const mockResponse = { success: true, data: { token: 'token' } }
    vi.mocked($fetch).mockResolvedValue(mockResponse)
    
    await AuthService.login({ email: 'test@example.com', password: 'password' })
    
    expect($fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/auth/login',
      { method: 'POST', body: { email: 'test@example.com', password: 'password' } }
    )
  })
})
```

### Test de page

```typescript
describe('LoginPage', () => {
  it('devrait soumettre le formulaire correctement', async () => {
    const wrapper = createComponentWrapper(LoginPage)
    
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password')
    await wrapper.find('form').trigger('submit')
    
    expect(mockAuth.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    })
  })
})
```

## 📋 Bonnes pratiques

### 1. Organisation des tests

- **Un fichier de test par module** : `component.test.ts`
- **Groupement logique** : Utiliser `describe` pour organiser
- **Noms descriptifs** : Tests explicites et clairs

### 2. Mocking efficace

```typescript
// Mock au niveau du module
vi.mock('~/services/auth.service', () => ({
  AuthService: {
    login: vi.fn(),
    register: vi.fn()
  }
}))

// Mock spécifique dans un test
it('should handle error', () => {
  vi.mocked(AuthService.login).mockRejectedValue(new Error('API Error'))
  // ... test logic
})
```

### 3. Assertions significatives

```typescript
// ✅ Bon
expect(wrapper.find('h1').text()).toBe('Bienvenue, John Doe !')
expect(mockAuth.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' })

// ❌ Éviter
expect(wrapper.find('h1').exists()).toBe(true)
expect(mockAuth.login).toHaveBeenCalled()
```

### 4. Nettoyage après les tests

```typescript
afterEach(() => {
  vi.clearAllMocks()
  vi.restoreAllMocks()
})
```

## 🔍 Troubleshooting

### Problèmes courants

#### 1. Erreurs de mock Nuxt

```typescript
// Problème : Module non trouvé
// Solution : Vérifier le mock dans test/setup.ts

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({ public: { apiBase: 'http://localhost:3001/api' } })
}))
```

#### 2. Tests qui échouent de manière intermittente

```typescript
// Problème : Timing des tests asynchrones
// Solution : Utiliser await et nextTick

await wrapper.vm.$nextTick()
await new Promise(resolve => setTimeout(resolve, 0))
```

#### 3. Couverture insuffisante

```bash
# Voir les fichiers non couverts
npm run test:coverage

# Analyser la couverture
npm run test:coverage:analyze
```

### Debugging

```typescript
// Ajouter des logs dans les tests
console.log('Wrapper HTML:', wrapper.html())
console.log('Component data:', wrapper.vm.$data)

// Utiliser le mode debug de Vitest
npm run test -- --reporter=verbose
```

## 🎯 Métriques de qualité

### Objectifs de couverture

- **Couverture globale** : > 90%
- **Composables critiques** : > 95%
- **Services** : > 95%
- **Pages principales** : > 85%

### Métriques de performance

- **Temps d'exécution** : < 30s pour tous les tests
- **Taille des tests** : < 500 lignes par fichier
- **Complexité** : Tests simples et focalisés

## 📚 Ressources

- [Documentation Vitest](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Nuxt Test Utils](https://nuxt.com/docs/getting-started/testing)
- [Testing Library](https://testing-library.com/)

## 🔄 Maintenance

### Mise à jour des tests

1. **Nouveau composant** : Créer les tests correspondants
2. **Modification d'API** : Mettre à jour les mocks
3. **Refactoring** : Adapter les tests existants
4. **Nouvelles fonctionnalités** : Ajouter les tests de couverture

### Revue régulière

- **Hebdomadaire** : Vérifier la couverture
- **Mensuelle** : Analyser les métriques
- **Trimestrielle** : Optimiser les performances

---

*Ce guide est maintenu par l'équipe de développement. Pour toute question ou suggestion, veuillez ouvrir une issue.*