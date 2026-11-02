import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/client'
import { CampanhaPage } from './CampanhaPage'

vi.mock('../api/campaigns', () => ({
  getCampaignPoints: vi.fn(),
}))

vi.mock('../components/CampaignMap', () => ({
  CampaignMap: ({
    campaign,
    points,
  }: {
    campaign: { name: string }
    points: unknown[]
  }) => (
    <div data-testid="campaign-map-stub">
      {campaign.name} · {points.length} pontos
    </div>
  ),
}))

import { getCampaignPoints } from '../api/campaigns'

const sampleResponse = {
  campaign: {
    id: 'camp-1',
    name: 'Campanha Simulada',
    area: {
      min_lat: 38,
      min_lon: -9.5,
      max_lat: 39,
      max_lon: -8.5,
    },
    simulated: true,
    analyses_count: 1,
    created_at: '2026-01-01T00:00:00Z',
  },
  points: [
    {
      analysis_id: 'an-1',
      lat: 38.5,
      lon: -9,
      location_source: 'simulated' as const,
      primary_class: 'MILCO' as const,
      milco_detection_count: 1,
      detection_count: 1,
      created_at: '2026-01-01T00:00:00Z',
    },
  ],
}

function renderPage(path = '/campanhas/camp-1') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/campanhas/:id" element={<CampanhaPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CampanhaPage', () => {
  beforeEach(() => {
    vi.mocked(getCampaignPoints).mockReset()
  })

  it('shows loading then renders the campaign map on success', async () => {
    vi.mocked(getCampaignPoints).mockResolvedValue(sampleResponse)

    renderPage()

    expect(screen.getByText('Carregando campanha…')).toBeInTheDocument()

    expect(await screen.findByTestId('campaign-map-stub')).toHaveTextContent(
      'Campanha Simulada · 1 pontos',
    )
    expect(getCampaignPoints).toHaveBeenCalledWith('camp-1')
  })

  it('shows Campanha não encontrada when the API returns 404', async () => {
    vi.mocked(getCampaignPoints).mockRejectedValue(
      new ApiError('NOT_FOUND', 'Campaign not found', 404),
    )

    renderPage()

    expect(
      await screen.findByText('Campanha não encontrada.'),
    ).toBeInTheDocument()
  })

  it('shows a generic error for other failures', async () => {
    vi.mocked(getCampaignPoints).mockRejectedValue(
      new ApiError('UNKNOWN_ERROR', 'Server error', 500),
    )

    renderPage()

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('Não foi possível carregar a campanha.')
  })
})
