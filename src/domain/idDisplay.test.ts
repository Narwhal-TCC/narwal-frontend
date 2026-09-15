import { describe, expect, it } from 'vitest'
import { shortId } from './idDisplay'

describe('shortId', () => {
  it('returns the full id when shorter than 8 characters', () => {
    expect(shortId('abc')).toBe('abc')
  })

  it('returns the first 8 characters for longer ids', () => {
    expect(shortId('0123456789abcdef')).toBe('01234567')
  })
})
