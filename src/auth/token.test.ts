import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from './token'

describe('access token storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when no token is stored', () => {
    expect(getAccessToken()).toBeNull()
  })

  it('stores and retrieves the access token', () => {
    setAccessToken('jwt-token')
    expect(getAccessToken()).toBe('jwt-token')
  })

  it('clears the stored access token', () => {
    setAccessToken('jwt-token')
    clearAccessToken()
    expect(getAccessToken()).toBeNull()
  })
})
