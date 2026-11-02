import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/client'
import { CampaignsPage } from './CampaignsPage'

vi.mock('../api/campaigns', () => ({
  listCampaigns: vi.fn(),
  createCampaign: vi.fn(),
  updateCampaign: vi.fn(),
  getCampaign: vi.fn(),
}))

import { createCampaign, listCampaigns, updateCampaign } from '../api/campaigns'

const sampleCampaigns = [
  {
    id: 'camp-1',
    name: 'Costa Norte',
    area: { min_lat: 38, min_lon: -9.5, max_lat: 39, max_lon: -8.5 },
    simulated: true,
    analyses_count: 2,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'camp-2',
    name: 'Baía Sul',
    area: { min_lat: -23, min_lon: -46, max_lat: -22, max_lon: -45 },
    simulated: false,
    analyses_count: 0,
    created_at: '2026-02-01T00:00:00Z',
  },
]

function renderPage() {
  return render(
    <MemoryRouter>
      <CampaignsPage />
    </MemoryRouter>,
  )
}

describe('CampaignsPage', () => {
  beforeEach(() => {
    vi.mocked(listCampaigns).mockReset()
    vi.mocked(createCampaign).mockReset()
    vi.mocked(updateCampaign).mockReset()
  })

  it('renders a row per campaign with simulated badge', async () => {
    vi.mocked(listCampaigns).mockResolvedValue(sampleCampaigns)

    renderPage()

    const rowOne = await screen.findByTestId('campaign-row-camp-1')
    expect(rowOne).toBeInTheDocument()
    expect(screen.getByTestId('campaign-row-camp-2')).toBeInTheDocument()
    expect(screen.getByText('Costa Norte')).toBeInTheDocument()
    expect(rowOne).toHaveTextContent('Simulada')
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('shows empty state when there are no campaigns', async () => {
    vi.mocked(listCampaigns).mockResolvedValue([])

    renderPage()

    expect(await screen.findByText('Nenhuma campanha')).toBeInTheDocument()
    expect(screen.getByTestId('campaign-create-empty')).toBeInTheDocument()
  })

  it('links open map to /campaigns/:id', async () => {
    vi.mocked(listCampaigns).mockResolvedValue([sampleCampaigns[0]])

    renderPage()

    const link = await screen.findByTestId('campaign-map-camp-1')
    expect(link).toHaveAttribute('href', '/campaigns/camp-1')
  })

  it('creates a campaign via POST and refreshes the list', async () => {
    vi.mocked(listCampaigns).mockResolvedValue([])
    vi.mocked(createCampaign).mockResolvedValue(sampleCampaigns[1])

    renderPage()

    fireEvent.click(await screen.findByTestId('campaign-create-empty'))
    fireEvent.change(screen.getByTestId('campaign-form-name'), {
      target: { value: 'Nova Baía' },
    })
    fireEvent.change(screen.getByTestId('campaign-form-min-lat'), {
      target: { value: '-23' },
    })
    fireEvent.change(screen.getByTestId('campaign-form-max-lat'), {
      target: { value: '-22' },
    })
    fireEvent.change(screen.getByTestId('campaign-form-min-lon'), {
      target: { value: '-46' },
    })
    fireEvent.change(screen.getByTestId('campaign-form-max-lon'), {
      target: { value: '-45' },
    })
    fireEvent.click(screen.getByTestId('campaign-form-submit'))

    await waitFor(() => {
      expect(createCampaign).toHaveBeenCalledWith({
        name: 'Nova Baía',
        area: { min_lat: -23, min_lon: -46, max_lat: -22, max_lon: -45 },
        simulated: false,
      })
    })
    await waitFor(() => {
      expect(listCampaigns).toHaveBeenCalledTimes(2)
    })
  })

  it('PATCHes name and simulated only when analyses_count > 0', async () => {
    vi.mocked(listCampaigns).mockResolvedValue([sampleCampaigns[0]])
    vi.mocked(updateCampaign).mockResolvedValue({
      ...sampleCampaigns[0],
      name: 'Costa Renomeada',
      simulated: false,
    })

    renderPage()

    fireEvent.click(await screen.findByTestId('campaign-edit-camp-1'))
    expect(screen.getByTestId('campaign-form-min-lat')).toBeDisabled()

    fireEvent.change(screen.getByTestId('campaign-form-name'), {
      target: { value: 'Costa Renomeada' },
    })
    fireEvent.click(screen.getByTestId('campaign-form-submit'))

    await waitFor(() => {
      expect(updateCampaign).toHaveBeenCalledWith('camp-1', {
        name: 'Costa Renomeada',
        simulated: true,
      })
    })
    expect(updateCampaign).toHaveBeenCalledWith(
      'camp-1',
      expect.not.objectContaining({ area: expect.anything() }),
    )
  })

  it('shows backend error on 409 and keeps the form open', async () => {
    vi.mocked(listCampaigns).mockResolvedValue([sampleCampaigns[1]])
    vi.mocked(updateCampaign).mockRejectedValue(
      new ApiError('AREA_LOCKED', 'Não é possível alterar a área.', 409),
    )

    renderPage()

    fireEvent.click(await screen.findByTestId('campaign-edit-camp-2'))
    fireEvent.change(screen.getByTestId('campaign-form-name'), {
      target: { value: 'Conflito' },
    })
    fireEvent.click(screen.getByTestId('campaign-form-submit'))

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('Não é possível alterar a área.')
    expect(screen.getByTestId('campaign-form-submit')).toBeInTheDocument()
  })

  it('blocks submit with invalid coordinates before calling the API', async () => {
    vi.mocked(listCampaigns).mockResolvedValue([])

    renderPage()

    fireEvent.click(await screen.findByTestId('campaign-create-empty'))
    fireEvent.change(screen.getByTestId('campaign-form-name'), {
      target: { value: 'Teste' },
    })
    fireEvent.change(screen.getByTestId('campaign-form-min-lat'), {
      target: { value: 'abc' },
    })
    fireEvent.click(screen.getByTestId('campaign-form-submit'))

    expect(await screen.findByRole('alert')).toHaveTextContent('Coordenadas inválidas')
    expect(createCampaign).not.toHaveBeenCalled()
  })

  it('shows load error and retries list fetch', async () => {
    vi.mocked(listCampaigns)
      .mockRejectedValueOnce(new ApiError('UNKNOWN_ERROR', 'Falha na rede.', 500))
      .mockResolvedValueOnce([sampleCampaigns[0]])

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha na rede.')
    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }))

    await waitFor(() => {
      expect(listCampaigns).toHaveBeenCalledTimes(2)
    })
    expect(await screen.findByText('Costa Norte')).toBeInTheDocument()
  })
})
