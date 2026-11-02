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

function boundsFromPoints(
  points: CampaignPoint[],
): [[number, number], [number, number]] {
  let minLat = points[0].lat
  let maxLat = points[0].lat
  let minLon = points[0].lon
  let maxLon = points[0].lon

  for (let index = 1; index < points.length; index += 1) {
    const point = points[index]
    minLat = Math.min(minLat, point.lat)
    maxLat = Math.max(maxLat, point.lat)
    minLon = Math.min(minLon, point.lon)
    maxLon = Math.max(maxLon, point.lon)
  }

  const latSpan = maxLat - minLat
  const lonSpan = maxLon - minLon
  const latPad = Math.max(0.025, latSpan * 0.25 || 0.05)
  const lonPad = Math.max(0.025, lonSpan * 0.25 || 0.05)

  return [
    [minLat - latPad, minLon - lonPad],
    [maxLat + latPad, maxLon + lonPad],
  ]
}

/** Fit the viewport to markers; for compact campaign areas, include the survey box too. */
export function mapViewBounds(
  campaign: Campaign,
  points: CampaignPoint[],
): [[number, number], [number, number]] {
  if (points.length === 0) {
    return campaignAreaBounds(campaign)
  }

  const pointBounds = boundsFromPoints(points)
  const area = campaignAreaBounds(campaign)
  const areaLatSpan = area[1][0] - area[0][0]
  const areaLonSpan = area[1][1] - area[0][1]
  const compactArea = areaLatSpan <= 1.5 && areaLonSpan <= 1.5

  if (!compactArea) {
    return pointBounds
  }

  return [
    [
      Math.min(area[0][0], pointBounds[0][0]),
      Math.min(area[0][1], pointBounds[0][1]),
    ],
    [
      Math.max(area[1][0], pointBounds[1][0]),
      Math.max(area[1][1], pointBounds[1][1]),
    ],
  ]
}

export function formatPointCoordinates(lat: number, lon: number): string {
  return `${lat.toFixed(5)}, ${lon.toFixed(5)}`
}

export function formatPrimaryConfidence(confidence: number | null): string {
  if (confidence == null || Number.isNaN(confidence)) {
    return '—'
  }
  return `${Math.round(confidence * 100)}% conf.`
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
