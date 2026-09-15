import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ACCESS_TOKEN_KEY } from '../auth/token'
import { AuthProvider } from '../auth/AuthContext'
import { ThemeProvider } from '../theme/ThemeContext'
import { Sidebar } from './Sidebar'

vi.mock('../api/auth', () => ({
  login: vi.fn(),
  me: vi.fn(),
}))

import { me as meApi } from '../api/auth'

const mockProfile = {
  user_id: 'operador-1',
  org_id: 'org-1',
  role: 'member' as const,
}

function renderSidebar(initialPath = '/') {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/" element={<Sidebar />} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>,
  )
}

describe('Sidebar', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(meApi).mockReset()
    localStorage.setItem(ACCESS_TOKEN_KEY, 'jwt-token')
    vi.mocked(meApi).mockResolvedValue(mockProfile)
  })

  it('renders navigation targets for overview, new analysis, and history', () => {
    renderSidebar()

    expect(screen.getByRole('link', { name: /Visão geral/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /Nova análise/i })).toHaveAttribute(
      'href',
      '/analises/nova',
    )
    expect(screen.getByRole('link', { name: /Histórico/i })).toHaveAttribute('href', '/historico')
  })

  it('shows operator identity from auth profile', async () => {
    renderSidebar()

    expect(await screen.findByText('operador-1')).toBeInTheDocument()
  })

  it('clears token and navigates to login when Sair is clicked', async () => {
    renderSidebar()

    fireEvent.click(screen.getByRole('button', { name: /Sair/i }))

    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull()
    expect(await screen.findByText('Login Page')).toBeInTheDocument()
  })
})
