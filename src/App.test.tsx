import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import { ThemeProvider } from './theme/ThemeContext'

vi.mock('./api/auth', () => ({
  login: vi.fn(),
  me: vi.fn(),
}))

function renderApp(initialPath = '/') {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>,
  )
}

describe('App routes', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects unauthenticated users from home to login', async () => {
    renderApp('/')

    expect(await screen.findByText('Login')).toBeInTheDocument()
  })
})
