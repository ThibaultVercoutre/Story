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

// Mock pour sessionStorage
Object.defineProperty(window, 'sessionStorage', {
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