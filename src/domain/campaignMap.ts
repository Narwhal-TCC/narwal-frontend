import type {
  Campaign,
  CampaignPoint,
  LocationSource,
  PrimaryClass,
} from '../api/campaigns'
import { MAP_MARKER_COLORS } from './detectionDisplay'

export function markerColor(primaryClass: PrimaryClass | null): string {
  if (primaryClass === 'MILCO') {
    return MAP_MARKER_COLORS.MILCO
  }
  if (primaryClass === 'NOMBO') {
    return MAP_MARKER_COLORS.NOMBO
  }
  return MAP_MARKER_COLORS.none
}

export function markerRadius(primaryClass: PrimaryClass | null): number {
  if (primaryClass === 'MILCO') {
    return 9
  }
  if (primaryClass === 'NOMBO') {
    return 6
  }
  return 7
}

export function locationSourceDescription(source: LocationSource): string {
  return source === 'entered'
    ? 'Coordenada informada pelo operador'
    : 'Posição simulada pelo sistema'
}

export function isMarkerFilled(locationSource: LocationSource): boolean {
  return locationSource === 'entered'
}

/** Heat intensity from MILCO count (0–1); higher values use the warm end of the gradient. */
export function heatWeight(milcoDetectionCount: number): number {
  if (milcoDetectionCount <= 0) {
    return 0.12
  }
  return Math.min(1, 0.35 + milcoDetectionCount * 0.22)
}

/** Warm gradient for MILCO density — blue only at low intensity, red at hotspots. */
export const milcoHeatGradient: Record<number, string> = {
  0.2: '#3d5a80',
  0.35: '#48cae4',
  0.5: '#ffd60a',
  0.65: '#ff8c00',
  0.8: '#ff4500',
  1: '#dc143c',
}

export function heatLayerPoints(
  points: CampaignPoint[],
): Array<[number, number, number]> {
  const milcoPoints = points.filter(
    (point) =>
      point.milco_detection_count > 0 || point.primary_class === 'MILCO',
  )
  const source = milcoPoints.length > 0 ? milcoPoints : points
  return source.map(
    (point) =>
      [point.lat, point.lon, heatWeight(point.milco_detection_count)] as [
        number,
        number,
        number,
      ],
  )
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
  const isNombo = primaryClass === 'NOMBO'
  const isMilco = primaryClass === 'MILCO'
  return {
    color,
    fillColor: color,
    fillOpacity: filled ? (isNombo ? 0.45 : 0.85) : 0,
    weight: isMilco ? 2.5 : isNombo ? 1.5 : 2,
  }
}
