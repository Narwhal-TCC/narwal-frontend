import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/client'
import { AuthProvider } from '../auth/AuthContext'
import { ThemeProvider } from '../theme/ThemeContext'
import { LoginPage } from './LoginPage'

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

function renderLogin(initialPath = '/login') {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<div>Home Dashboard</div>} />
            <Route path="/historico" element={<div>History Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(loginApi).mockReset()
    vi.mocked(meApi).mockReset()
  })

  it('shows required-fields error on empty submit without calling API', async () => {
    renderLogin()

    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Preencha os campos obrigatórios.',
    )
    expect(loginApi).not.toHaveBeenCalled()
  })

  it('shows Portuguese error for invalid credentials', async () => {
    vi.mocked(loginApi).mockRejectedValue(
      new ApiError('INVALID_CREDENTIALS', 'Credenciais inválidas', 401),
    )

    renderLogin()

    fireEvent.change(screen.getByLabelText(/Usuário/i), { target: { value: 'bad' } })
    fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciais inválidas.')
  })

  it('navigates to next path after successful login', async () => {
    vi.mocked(loginApi).mockResolvedValue({
      access_token: 'jwt-token',
      token_type: 'bearer',
    })
    vi.mocked(meApi).mockResolvedValue(mockProfile)

    renderLogin('/login?next=%2Fhistorico')

    fireEvent.change(screen.getByLabelText(/Usuário/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }))

    await waitFor(() => {
      expect(screen.getByText('History Page')).toBeInTheDocument()
    })
  })
})
