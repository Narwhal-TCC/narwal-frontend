import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './client'
import { login, me } from './auth'

describe('auth API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('login returns access token on success', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ access_token: 'jwt-token', token_type: 'bearer' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const result = await login({ username: 'admin', password: 'secret' })

    expect(result).toEqual({ access_token: 'jwt-token', token_type: 'bearer' })
    const [url, options] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('/api/auth/login')
    expect(options?.method).toBe('POST')
    expect(JSON.parse(options?.body as string)).toEqual({
      username: 'admin',
      password: 'secret',
    })
  })

  it('login throws INVALID_CREDENTIALS on bad credentials', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ code: 'INVALID_CREDENTIALS', message: 'Credenciais inválidas' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    await expect(login({ username: 'bad', password: 'wrong' })).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      message: 'Credenciais inválidas',
    } satisfies Partial<ApiError>)
  })

  it('me returns current user profile', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          user_id: 'user-1',
          org_id: 'org-1',
          role: 'member',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const result = await me()

    expect(result).toEqual({
      user_id: 'user-1',
      org_id: 'org-1',
      role: 'member',
    })
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('/api/auth/me')
  })
})
