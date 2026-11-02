import { describe, expect, it } from 'vitest'
import type { Campaign, CampaignPoint } from '../api/campaigns'
import {
  campaignAreaBounds,
  formatPrimaryConfidence,
  hasSimulatedData,
  heatLayerPoints,
  heatWeight,
  isMarkerFilled,
  locationSourceDescription,
  mapViewBounds,
  markerColor,
  markerRadius,
} from './campaignMap'
import { MAP_MARKER_COLORS } from './detectionDisplay'

const baseCampaign: Campaign = {
  id: 'camp-1',
  name: 'Test',
  area: { min_lat: 38, min_lon: -9.5, max_lat: 39, max_lon: -8.5 },
  simulated: false,
  analyses_count: 0,
  created_at: '2026-01-01T00:00:00Z',
}

const basePoint: CampaignPoint = {
  analysis_id: 'a-1',
  lat: 38.5,
  lon: -9,
  location_source: 'entered',
  primary_class: 'MILCO',
  primary_confidence: 0.9,
  milco_detection_count: 1,
  detection_count: 1,
  created_at: '2026-01-01T00:00:00Z',
}

describe('markerColor', () => {
  it('returns MILCO red from map marker tokens', () => {
    expect(markerColor('MILCO')).toBe(MAP_MARKER_COLORS.MILCO)
  })

  it('returns subdued NOMBO on the map', () => {
    expect(markerColor('NOMBO')).toBe(MAP_MARKER_COLORS.NOMBO)
  })

  it('returns grey when primary class is null', () => {
    expect(markerColor(null)).toBe(MAP_MARKER_COLORS.none)
  })
})

describe('markerRadius', () => {
  it('draws MILCO larger than NOMBO', () => {
    expect(markerRadius('MILCO')).toBeGreaterThan(markerRadius('NOMBO'))
  })
})

describe('locationSourceDescription', () => {
  it('describes entered and simulated sources', () => {
    expect(locationSourceDescription('entered')).toContain('operador')
    expect(locationSourceDescription('simulated')).toContain('simulada')
  })
})

describe('isMarkerFilled', () => {
  it('fills markers for entered positions', () => {
    expect(isMarkerFilled('entered')).toBe(true)
  })

  it('draws hollow markers for simulated positions', () => {
    expect(isMarkerFilled('simulated')).toBe(false)
  })
})

describe('mapViewBounds', () => {
  it('uses the campaign area when there are no points', () => {
    expect(mapViewBounds(baseCampaign, [])).toEqual(
      campaignAreaBounds(baseCampaign),
    )
  })

  it('pads around analysis markers when points exist', () => {
    const bounds = mapViewBounds(baseCampaign, [basePoint])
    expect(bounds[0][0]).toBeLessThan(basePoint.lat)
    expect(bounds[1][0]).toBeGreaterThan(basePoint.lat)
    expect(bounds[0][1]).toBeLessThan(basePoint.lon)
    expect(bounds[1][1]).toBeGreaterThan(basePoint.lon)
  })

  it('includes the campaign area when the survey box is compact', () => {
    const compactCampaign: Campaign = {
      ...baseCampaign,
      area: {
        min_lat: 38.4,
        min_lon: -9.6,
        max_lat: 38.8,
        max_lon: -9.1,
      },
    }
    const bounds = mapViewBounds(compactCampaign, [basePoint])
    expect(bounds[0][0]).toBeLessThanOrEqual(compactCampaign.area.min_lat)
    expect(bounds[1][1]).toBeGreaterThanOrEqual(compactCampaign.area.max_lon)
  })
})

describe('formatPrimaryConfidence', () => {
  it('formats confidence as a percentage label', () => {
    expect(formatPrimaryConfidence(0.876)).toBe('88% conf.')
    expect(formatPrimaryConfidence(null)).toBe('—')
  })
})

describe('heatWeight', () => {
  it('scales up with milco count', () => {
    expect(heatWeight(3)).toBeGreaterThan(heatWeight(1))
  })

  it('returns a low floor for zero milco count', () => {
    expect(heatWeight(0)).toBe(0.12)
  })
})

describe('heatLayerPoints', () => {
  it('prioritizes points with MILCO for the density layer', () => {
    const points = [
      basePoint,
      {
        ...basePoint,
        analysis_id: 'n-1',
        primary_class: 'NOMBO' as const,
        milco_detection_count: 0,
      },
    ]
    const layer = heatLayerPoints(points)
    expect(layer).toHaveLength(1)
    expect(layer[0][2]).toBeGreaterThan(0.12)
  })
})

describe('hasSimulatedData', () => {
  it('is true when the campaign area is simulated', () => {
    expect(
      hasSimulatedData({ ...baseCampaign, simulated: true }, []),
    ).toBe(true)
  })

  it('is true when any point is simulated', () => {
    expect(
      hasSimulatedData(baseCampaign, [
        { ...basePoint, location_source: 'simulated' },
      ]),
    ).toBe(true)
  })

  it('is false when campaign and all points are entered', () => {
    expect(hasSimulatedData(baseCampaign, [basePoint])).toBe(false)
  })
})
