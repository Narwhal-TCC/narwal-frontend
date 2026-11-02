import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Campaign, CampaignPoint } from '../api/campaigns'
import { PRIMARY_CLASS_MARKER_COLORS } from '../domain/detectionDisplay'
import { CampaignMap } from './CampaignMap'

const leafletMocks = vi.hoisted(() => {
  const addLayer = vi.fn()
  const heatLayer = vi.fn(() => ({ addTo: addLayer }))
  return {
    fitBounds: vi.fn(),
    addLayer,
    removeLayer: vi.fn(),
    heatLayer,
  }
})

vi.mock('leaflet', async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>()
  const base = (original.default ?? original) as Record<string, unknown>
  const leafletDefault = { ...base, heatLayer: leafletMocks.heatLayer }
  return {
    ...original,
    default: leafletDefault,
    heatLayer: leafletMocks.heatLayer,
  }
})

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => null,
  Rectangle: ({ bounds }: { bounds: unknown }) => (
    <div data-testid="area-rectangle" data-bounds={JSON.stringify(bounds)} />
  ),
  CircleMarker: ({
    center,
    pathOptions,
    children,
  }: {
    center: [number, number]
    pathOptions: Record<string, unknown>
    children?: React.ReactNode
  }) => (
    <div
      data-testid="map-marker"
      data-center={JSON.stringify(center)}
      data-path={JSON.stringify(pathOptions)}
    >
      {children}
    </div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-popup">{children}</div>
  ),
  useMap: () => ({
    fitBounds: leafletMocks.fitBounds,
    addLayer: leafletMocks.addLayer,
    removeLayer: leafletMocks.removeLayer,
  }),
}))

const campaign: Campaign = {
  id: 'camp-1',
  name: 'Campanha Simulada',
  area: { min_lat: 38.4, min_lon: -9.6, max_lat: 38.8, max_lon: -9.1 },
  simulated: true,
  analyses_count: 2,
  created_at: '2026-01-15T12:00:00Z',
}

const enteredMilco: CampaignPoint = {
  analysis_id: '01234567-89ab-cdef-0123-456789abcdef',
  lat: 38.5,
  lon: -9.4,
  location_source: 'entered',
  primary_class: 'MILCO',
  milco_detection_count: 2,
  detection_count: 3,
  created_at: '2026-01-20T14:30:00Z',
}

const simulatedNombo: CampaignPoint = {
  analysis_id: '11111111-1111-1111-1111-111111111111',
  lat: 38.55,
  lon: -9.35,
  location_source: 'simulated',
  primary_class: 'NOMBO',
  milco_detection_count: 0,
  detection_count: 1,
  created_at: '2026-01-21T10:00:00Z',
}

function renderMap(
  points: CampaignPoint[] = [enteredMilco, simulatedNombo],
  campaignOverride?: Partial<Campaign>,
) {
  return render(
    <MemoryRouter>
      <CampaignMap
        campaign={{ ...campaign, ...campaignOverride }}
        points={points}
      />
    </MemoryRouter>,
  )
}

describe('CampaignMap', () => {
  beforeEach(() => {
    leafletMocks.heatLayer.mockClear()
    leafletMocks.addLayer.mockClear()
    leafletMocks.removeLayer.mockClear()
    leafletMocks.fitBounds.mockClear()
  })

  it('draws the campaign area and one marker per point', () => {
    renderMap()

    const rectangle = screen.getByTestId('area-rectangle')
    expect(JSON.parse(rectangle.getAttribute('data-bounds') ?? '[]')).toEqual([
      [38.4, -9.6],
      [38.8, -9.1],
    ])
    expect(screen.getAllByTestId('map-marker')).toHaveLength(2)
  })

  it('colours markers by primary class', () => {
    renderMap([
      enteredMilco,
      simulatedNombo,
      {
        ...enteredMilco,
        analysis_id: '22222222-2222-2222-2222-222222222222',
        primary_class: null,
        location_source: 'entered',
      },
    ])

    const markers = screen.getAllByTestId('map-marker')
    const milcoPath = JSON.parse(markers[0].getAttribute('data-path') ?? '{}')
    const nomboPath = JSON.parse(markers[1].getAttribute('data-path') ?? '{}')
    const nonePath = JSON.parse(markers[2].getAttribute('data-path') ?? '{}')

    expect(milcoPath.color).toBe(PRIMARY_CLASS_MARKER_COLORS.MILCO)
    expect(nomboPath.color).toBe(PRIMARY_CLASS_MARKER_COLORS.NOMBO)
    expect(nonePath.color).toBe(PRIMARY_CLASS_MARKER_COLORS.none)
  })

  it('draws entered markers filled and simulated markers hollow', () => {
    renderMap()

    const markers = screen.getAllByTestId('map-marker')
    const enteredPath = JSON.parse(markers[0].getAttribute('data-path') ?? '{}')
    const simulatedPath = JSON.parse(
      markers[1].getAttribute('data-path') ?? '{}',
    )

    expect(enteredPath.fillOpacity).toBeGreaterThan(0)
    expect(simulatedPath.fillOpacity).toBe(0)
  })

  it('shows the simulated data badge when campaign or points are simulated', () => {
    renderMap()

    expect(screen.getByTestId('simulated-location-badge')).toHaveTextContent(
      'Dados de localização simulados',
    )
  })

  it('shows the badge when only a point is simulated', () => {
    renderMap([simulatedNombo], { simulated: false })

    expect(screen.getByTestId('simulated-location-badge')).toBeInTheDocument()
  })

  it('toggles the heat layer on and off', () => {
    renderMap()

    expect(screen.queryByTestId('heatmap-layer')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('heatmap-toggle'))
    expect(screen.getByTestId('heatmap-layer')).toBeInTheDocument()
    expect(leafletMocks.heatLayer).toHaveBeenCalled()

    fireEvent.click(screen.getByTestId('heatmap-toggle'))
    expect(screen.queryByTestId('heatmap-layer')).not.toBeInTheDocument()
  })

  it('shows popup details and link to the analysis', () => {
    renderMap([enteredMilco])

    const popup = screen.getByTestId('map-popup')
    expect(within(popup).getByText('MILCO')).toBeInTheDocument()
    expect(within(popup).getByText('MILCO: 2')).toBeInTheDocument()
    expect(within(popup).getByText('Detecções: 3')).toBeInTheDocument()
    expect(
      within(popup).getByRole('link', { name: 'Ver análise' }),
    ).toHaveAttribute('href', '/analises/01234567-89ab-cdef-0123-456789abcdef')
  })

  it('shows empty state when there are no points', () => {
    renderMap([])

    expect(screen.getByTestId('campaign-map-empty')).toHaveTextContent(
      'Nenhuma análise nesta campanha',
    )
    expect(screen.queryAllByTestId('map-marker')).toHaveLength(0)
  })

  it('includes the detection class legend', () => {
    renderMap([])

    expect(screen.getByTestId('detection-class-legend')).toBeInTheDocument()
  })
})
