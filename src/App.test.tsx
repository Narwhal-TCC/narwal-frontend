import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App, { LegacyCampanhaRedirect } from './App'
import { AuthProvider } from './auth/AuthContext'
import { ACCESS_TOKEN_KEY } from './auth/token'
import { ThemeProvider } from './theme/ThemeContext'

vi.mock('./api/auth', () => ({
  login: vi.fn(),
  me: vi.fn(),
}))

vi.mock('./api/campaigns', () => ({
  getCampaignPoints: vi.fn(),
  listCampaigns: vi.fn(),
  createCampaign: vi.fn(),
  updateCampaign: vi.fn(),
  getCampaign: vi.fn(),
}))

vi.mock('./components/CampaignMap', () => ({
  CampaignMap: () => <div data-testid="campaign-map-stub" />,
}))

import { me as meApi } from './api/auth'
import { getCampaignPoints } from './api/campaigns'

const mockProfile = {
  user_id: 'operador-1',
  org_id: 'org-1',
  role: 'member' as const,
}

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

    expect(await screen.findByRole('button', { name: /Entrar/i })).toBeInTheDocument()
  })

  it('LegacyCampanhaRedirect sends /campanhas/:id to /campaigns/:id', () => {
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1']}>
        <Routes>
          <Route path="/campanhas/:id" element={<LegacyCampanhaRedirect />} />
          <Route
            path="/campaigns/:id"
            element={<div data-testid="campaign-detail-route">ok</div>}
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('campaign-detail-route')).toBeInTheDocument()
  })

  it('App registers legacy campanhas path and loads campaign map after redirect', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'jwt-token')
    vi.mocked(meApi).mockResolvedValue(mockProfile)
    vi.mocked(getCampaignPoints).mockResolvedValue({
      campaign: {
        id: 'camp-1',
        name: 'Test',
        area: { min_lat: 0, min_lon: 0, max_lat: 1, max_lon: 1 },
        simulated: false,
        analyses_count: 0,
        created_at: '2026-01-01T00:00:00Z',
      },
      points: [],
    })

    renderApp('/campanhas/camp-1')

    expect(await screen.findByTestId('campaign-map-stub')).toBeInTheDocument()
    expect(getCampaignPoints).toHaveBeenCalledWith('camp-1')
  })
})
