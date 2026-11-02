import { describe, expect, it } from 'vitest'
import type { Campaign, CampaignPoint } from '../api/campaigns'
import {
  hasSimulatedData,
  heatWeight,
  isMarkerFilled,
  markerColor,
} from './campaignMap'
import { PRIMARY_CLASS_MARKER_COLORS } from './detectionDisplay'

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
  milco_detection_count: 1,
  detection_count: 1,
  created_at: '2026-01-01T00:00:00Z',
}

describe('markerColor', () => {
  it('returns MILCO red from detection display tokens', () => {
    expect(markerColor('MILCO')).toBe(PRIMARY_CLASS_MARKER_COLORS.MILCO)
  })

  it('returns NOMBO amber from detection display tokens', () => {
    expect(markerColor('NOMBO')).toBe(PRIMARY_CLASS_MARKER_COLORS.NOMBO)
  })

  it('returns grey when primary class is null', () => {
    expect(markerColor(null)).toBe(PRIMARY_CLASS_MARKER_COLORS.none)
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

describe('heatWeight', () => {
  it('uses milco count when above the floor', () => {
    expect(heatWeight(3)).toBe(3)
  })

  it('floors weight at 0.2 for zero milco count', () => {
    expect(heatWeight(0)).toBe(0.2)
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
