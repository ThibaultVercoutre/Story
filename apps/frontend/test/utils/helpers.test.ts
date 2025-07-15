import { describe, it, expect } from 'vitest'
import { 
  createMockUser, 
  createMockStory, 
  createMockChapitre, 
  createMockMorceauTexte 
} from './test-helpers'

describe('Test Helpers', () => {
  describe('createMockUser', () => {
    it('should create a mock user with default values', () => {
      const user = createMockUser()
      
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('name')
      expect(user).toHaveProperty('token')
      expect(user.email).toBe('test@example.com')
    })

    it('should create a mock user with custom values', () => {
      const user = createMockUser({ 
        email: 'custom@example.com',
        name: 'Custom User' 
      })
      
      expect(user.email).toBe('custom@example.com')
      expect(user.name).toBe('Custom User')
    })
  })

  describe('createMockStory', () => {
    it('should create a mock story with default values', () => {
      const story = createMockStory()
      
      expect(story).toHaveProperty('id')
      expect(story).toHaveProperty('title')
      expect(story).toHaveProperty('description')
      expect(story).toHaveProperty('author')
      expect(story.title).toBe('Test Story')
    })

    it('should create a mock story with custom values', () => {
      const story = createMockStory({ 
        title: 'Custom Story',
        is_saga: true 
      })
      
      expect(story.title).toBe('Custom Story')
      expect(story.is_saga).toBe(true)
    })
  })

  describe('createMockChapitre', () => {
    it('should create a mock chapitre with default values', () => {
      const chapitre = createMockChapitre()
      
      expect(chapitre).toHaveProperty('id')
      expect(chapitre).toHaveProperty('title')
      expect(chapitre).toHaveProperty('slug')
      expect(chapitre).toHaveProperty('order')
      expect(chapitre.title).toBe('Test Chapter')
    })
  })

  describe('createMockMorceauTexte', () => {
    it('should create a mock morceau texte with default values', () => {
      const morceau = createMockMorceauTexte()
      
      expect(morceau).toHaveProperty('id')
      expect(morceau).toHaveProperty('content')
      expect(morceau).toHaveProperty('order')
      expect(morceau.content).toBe('Test content')
    })
  })
})