import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useSearchParams } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ACCESS_TOKEN_KEY } from './token'
import { AuthProvider } from './AuthContext'
import { ProtectedRoute } from './ProtectedRoute'

vi.mock('../api/auth', () => ({
  login: vi.fn(),
  me: vi.fn(),
}))

import { me as meApi } from '../api/auth'

const mockProfile = {
  user_id: 'user-1',
  org_id: 'org-1',
  role: 'member' as const,
}

function LoginWithNext() {
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next')
  return (
    <div>
      Login Page
      {next ? <span data-testid="next-path">{next}</span> : null}
    </div>
  )
}

function renderProtectedRoutes(initialPath = '/') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<LoginWithNext />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<div>Protected Home</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(meApi).mockReset()
  })

  it('redirects unauthenticated users to login with return path', async () => {
    renderProtectedRoutes('/')

    expect(await screen.findByText('Login Page')).toBeInTheDocument()
    expect(screen.getByTestId('next-path')).toHaveTextContent('/')
  })

  it('renders protected content when authenticated', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'jwt-token')
    vi.mocked(meApi).mockResolvedValue(mockProfile)

    renderProtectedRoutes('/')

    expect(await screen.findByText('Protected Home')).toBeInTheDocument()
  })
})
