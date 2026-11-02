import { describe, expect, it } from 'vitest'
import type { CampaignPoint } from '../api/campaigns'
import {
  classGroupKey,
  filterVisibleCampaignPoints,
  groupCampaignPoints,
  isCampaignPointVisible,
} from './campaignPointGroups'

const milcoPoint: CampaignPoint = {
  analysis_id: 'a-milco',
  lat: 1,
  lon: 2,
  location_source: 'entered',
  primary_class: 'MILCO',
  milco_detection_count: 2,
  detection_count: 3,
  created_at: '2026-01-20T14:30:00Z',
}

const nomboPoint: CampaignPoint = {
  ...milcoPoint,
  analysis_id: 'a-nombo',
  primary_class: 'NOMBO',
}

const nonePoint: CampaignPoint = {
  ...milcoPoint,
  analysis_id: 'a-none',
  primary_class: null,
}

describe('campaignPointGroups', () => {
  it('maps primary_class to group keys', () => {
    expect(classGroupKey('MILCO')).toBe('MILCO')
    expect(classGroupKey('NOMBO')).toBe('NOMBO')
    expect(classGroupKey(null)).toBe('NONE')
  })

  it('groups points by class and omits empty sections', () => {
    const groups = groupCampaignPoints([milcoPoint, nomboPoint, milcoPoint])
    expect(groups.map((g) => g.key)).toEqual(['MILCO', 'NOMBO'])
    expect(groups[0].points).toHaveLength(2)
    expect(groups[1].points).toHaveLength(1)
  })

  it('respects hidden class and hidden analysis visibility', () => {
    const hiddenClasses = new Set<'MILCO' | 'NOMBO' | 'NONE'>(['NOMBO'])
    const hiddenIds = new Set(['a-milco'])

    expect(
      isCampaignPointVisible(milcoPoint, hiddenClasses, new Set()),
    ).toBe(true)
    expect(
      isCampaignPointVisible(nomboPoint, hiddenClasses, new Set()),
    ).toBe(false)
    expect(
      isCampaignPointVisible(milcoPoint, new Set(), hiddenIds),
    ).toBe(false)

    const visible = filterVisibleCampaignPoints(
      [milcoPoint, nomboPoint, nonePoint],
      hiddenClasses,
      hiddenIds,
    )
    expect(visible.map((p) => p.analysis_id)).toEqual(['a-none'])
  })
})
