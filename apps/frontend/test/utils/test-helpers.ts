import { mount, VueWrapper } from '@vue/test-utils'
import { vi } from 'vitest'

// Types pour les helpers de test
export interface MockUser {
  id: string
  email: string
  name: string
  token: string
}

export interface MockStory {
  id: string
  title: string
  description: string
  author: string
  is_saga: boolean
  created_at: string
  updated_at: string
}

export interface MockChapitre {
  id: string
  title: string
  slug: string
  order: number
  story_id: string
  created_at: string
  updated_at: string
}

export interface MockMorceauTexte {
  id: string
  content: string
  order: number
  chapitre_id: string
  created_at: string
  updated_at: string
}

// Mock data generators
export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  token: 'mock-jwt-token',
  ...overrides
})

export const createMockStory = (overrides: Partial<MockStory> = {}): MockStory => ({
  id: '1',
  title: 'Test Story',
  description: 'A test story',
  author: 'Test Author',
  is_saga: false,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides
})

export const createMockChapitre = (overrides: Partial<MockChapitre> = {}): MockChapitre => ({
  id: '1',
  title: 'Test Chapter',
  slug: 'test-chapter',
  order: 1,
  story_id: '1',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides
})

export const createMockMorceauTexte = (overrides: Partial<MockMorceauTexte> = {}): MockMorceauTexte => ({
  id: '1',
  content: 'Test content',
  order: 1,
  chapitre_id: '1',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides
})

// Helper pour créer un wrapper de composant avec les mocks nécessaires
export const createComponentWrapper = (
  component: any,
  options: {
    props?: Record<string, any>
    slots?: Record<string, any>
    global?: {
      plugins?: any[]
      mocks?: Record<string, any>
      stubs?: Record<string, any>
    }
  } = {}
): VueWrapper<any> => {
  const defaultMocks = {
    $router: {
      push: vi.fn(),
      replace: vi.fn(),
      go: vi.fn(),
      back: vi.fn(),
      forward: vi.fn()
    },
    $route: {
      params: {},
      query: {},
      path: '/',
      fullPath: '/',
      name: 'index'
    }
  }

  const defaultStubs = {
    NuxtLink: {
      template: '<a href="#"><slot /></a>'
    },
    NuxtImg: {
      template: '<img />'
    },
    UButton: {
      template: '<button><slot /></button>'
    },
    UInput: {
      template: '<input />'
    },
    UTextarea: {
      template: '<textarea></textarea>'
    },
    UCard: {
      template: '<div class="card"><slot /></div>'
    },
    UContainer: {
      template: '<div class="container"><slot /></div>'
    }
  }

  return mount(component, {
    ...options,
    global: {
      ...options.global,
      mocks: {
        ...defaultMocks,
        ...options.global?.mocks
      },
      stubs: {
        ...defaultStubs,
        ...options.global?.stubs
      }
    }
  })
}

// Helper pour mocker les appels fetch
export const mockFetch = (response: any, status: number = 200) => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response))
  })
  global.fetch = fetchMock
  return fetchMock
}

// Helper pour mocker les erreurs fetch
export const mockFetchError = (error: Error) => {
  const fetchMock = vi.fn().mockRejectedValue(error)
  global.fetch = fetchMock
  return fetchMock
}

// Helper pour attendre les mises à jour du DOM
export const nextTick = () => new Promise(resolve => setTimeout(resolve, 0))

// Helper pour simuler les délais
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper pour mocker localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    store
  }
}

// Helper pour mocker les services
export const mockService = (serviceName: string, methods: Record<string, any>) => {
  const mock = vi.fn()
  Object.keys(methods).forEach(method => {
    mock[method] = vi.fn().mockImplementation(methods[method])
  })
  return mock
}

// Helper pour vérifier les appels d'API
export const expectApiCall = (
  fetchMock: ReturnType<typeof vi.fn>,
  url: string,
  options?: {
    method?: string
    body?: any
    headers?: Record<string, string>
  }
) => {
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining(url),
    expect.objectContaining({
      method: options?.method || 'GET',
      ...(options?.body && { body: JSON.stringify(options.body) }),
      ...(options?.headers && { headers: expect.objectContaining(options.headers) })
    })
  )
}

// Helper pour nettoyer les mocks après les tests
export const cleanupMocks = () => {
  vi.clearAllMocks()
  vi.restoreAllMocks()
}