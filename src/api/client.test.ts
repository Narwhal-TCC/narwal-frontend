import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, ApiError } from './client'

const TOKEN_KEY = 'navi-access-token'

describe('apiRequest', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns parsed JSON on success and sends Bearer token when stored', async () => {
    localStorage.setItem(TOKEN_KEY, 'test-token')
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await apiRequest<{ ok: boolean }>('/api/auth/me')

    expect(result).toEqual({ ok: true })
    const [, options] = vi.mocked(fetch).mock.calls[0]
    const headers = options?.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer test-token')
  })

  it('throws ApiError with code and message from error JSON body', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ code: 'INVALID_CREDENTIALS', message: 'Credenciais inválidas' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(apiRequest('/api/auth/login')).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      message: 'Credenciais inválidas',
      status: 401,
    } satisfies Partial<ApiError>)
  })

  it('maps 401 responses to UNAUTHORIZED when body has no code', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(apiRequest('/api/analyses')).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      status: 401,
    } satisfies Partial<ApiError>)
  })
})
