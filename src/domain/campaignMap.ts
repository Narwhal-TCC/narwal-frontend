import type {
  Campaign,
  CampaignPoint,
  LocationSource,
  PrimaryClass,
} from '../api/campaigns'
import { primaryClassMarkerColor } from './detectionDisplay'

export function markerColor(primaryClass: PrimaryClass | null): string {
  return primaryClassMarkerColor(primaryClass)
}

export function isMarkerFilled(locationSource: LocationSource): boolean {
  return locationSource === 'entered'
}

export function heatWeight(milcoDetectionCount: number): number {
  return Math.max(milcoDetectionCount, 0.2)
}

export function hasSimulatedData(
  campaign: Campaign,
  points: CampaignPoint[],
): boolean {
  if (campaign.simulated) {
    return true
  }
  return points.some((point) => point.location_source === 'simulated')
}

export function campaignAreaBounds(
  campaign: Campaign,
): [[number, number], [number, number]] {
  const { area } = campaign
  return [
    [area.min_lat, area.min_lon],
    [area.max_lat, area.max_lon],
  ]
}

export function markerPathOptions(
  primaryClass: PrimaryClass | null,
  locationSource: LocationSource,
): {
  color: string
  fillColor: string
  fillOpacity: number
  weight: number
} {
  const color = markerColor(primaryClass)
  const filled = isMarkerFilled(locationSource)
  return {
    color,
    fillColor: color,
    fillOpacity: filled ? 0.85 : 0,
    weight: filled ? 1 : 2,
  }
}
