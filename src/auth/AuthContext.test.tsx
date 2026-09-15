import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/client'
import { ACCESS_TOKEN_KEY } from './token'
import { AuthProvider, useAuth } from './AuthContext'

vi.mock('../api/auth', () => ({
  login: vi.fn(),
  me: vi.fn(),
}))

import { login as loginApi, me as meApi } from '../api/auth'

const mockProfile = {
  user_id: 'user-1',
  org_id: 'org-1',
  role: 'member' as const,
}

function renderAuthHook() {
  return renderHook(() => useAuth(), {
    wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
  })
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(loginApi).mockReset()
    vi.mocked(meApi).mockReset()
  })

  it('login success stores token and loads user', async () => {
    vi.mocked(loginApi).mockResolvedValue({
      access_token: 'jwt-token',
      token_type: 'bearer',
    })
    vi.mocked(meApi).mockResolvedValue(mockProfile)

    const { result } = renderAuthHook()

    await act(async () => {
      await result.current.login('admin', 'secret')
    })

    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe('jwt-token')
    expect(result.current.user).toEqual(mockProfile)
  })

  it('logout clears token and user', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'jwt-token')
    vi.mocked(meApi).mockResolvedValue(mockProfile)

    const { result } = renderAuthHook()

    await waitFor(() => {
      expect(result.current.user).toEqual(mockProfile)
    })

    act(() => {
      result.current.logout()
    })

    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull()
    expect(result.current.user).toBeNull()
  })

  it('failed login keeps user logged out and does not store token', async () => {
    vi.mocked(loginApi).mockRejectedValue(
      new ApiError('INVALID_CREDENTIALS', 'Credenciais inválidas', 401),
    )

    const { result } = renderAuthHook()

    await expect(
      act(async () => {
        await result.current.login('bad', 'wrong')
      }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })

    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull()
    expect(result.current.user).toBeNull()
  })
})
