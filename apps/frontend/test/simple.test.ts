import { describe, it, expect } from 'vitest'

describe('Simple test', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle strings', () => {
    expect('hello').toBe('hello')
  })
})