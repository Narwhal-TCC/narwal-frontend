import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet.heat'
import {
  CircleMarker,
  MapContainer,
  Popup,
  Rectangle,
  TileLayer,
  useMap,
} from 'react-leaflet'
import type { Campaign, CampaignPoint } from '../api/campaigns'
import {
  campaignAreaBounds,
  hasSimulatedData,
  heatWeight,
  markerPathOptions,
} from '../domain/campaignMap'
import { DetectionClassLegend } from './DetectionClassLegend'

function formatPointDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(new Date(iso))
    .replace('.', '')
}

function primaryClassLabel(
  primaryClass: CampaignPoint['primary_class'],
): string {
  if (primaryClass === 'MILCO') return 'MILCO'
  if (primaryClass === 'NOMBO') return 'NOMBO'
  return 'Sem classe'
}

function FitBounds({
  bounds,
}: {
  bounds: [[number, number], [number, number]]
}) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(bounds, { padding: [24, 24] })
  }, [map, bounds])
  return null
}

function HeatLayer({
  points,
  enabled,
}: {
  points: CampaignPoint[]
  enabled: boolean
}) {
  const map = useMap()

  useEffect(() => {
    if (!enabled) {
      return
    }
    const latlngs = points.map(
      (point) =>
        [
          point.lat,
          point.lon,
          heatWeight(point.milco_detection_count),
        ] as [number, number, number],
    )
    const layer = L.heatLayer(latlngs, {
      radius: 28,
      blur: 20,
      maxZoom: 17,
    })
    layer.addTo(map)
    return () => {
      map.removeLayer(layer)
    }
  }, [map, points, enabled])

  if (!enabled) {
    return null
  }

  return <div data-testid="heatmap-layer" aria-hidden className="hidden" />
}

export interface CampaignMapProps {
  campaign: Campaign
  points: CampaignPoint[]
}

export function CampaignMap({ campaign, points }: CampaignMapProps) {
  const [heatmapOn, setHeatmapOn] = useState(false)
  const bounds = campaignAreaBounds(campaign)
  const showSimulatedBadge = hasSimulatedData(campaign, points)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-[color:var(--navi-text)]">
          {campaign.name}
        </h2>
        {showSimulatedBadge ? (
          <span
            data-testid="simulated-location-badge"
            className="rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide bg-[color-mix(in_srgb,var(--navi-nombo)_18%,transparent)] text-[color:var(--navi-link)]"
          >
            Dados de localização simulados
          </span>
        ) : null}
      </div>

      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[color:var(--navi-link)]">
        <input
          type="checkbox"
          checked={heatmapOn}
          onChange={(event) => setHeatmapOn(event.target.checked)}
          data-testid="heatmap-toggle"
        />
        Mapa de densidade
      </label>

      <div
        data-testid="campaign-map"
        className="overflow-hidden rounded-[10px] border border-[color:var(--navi-border)]"
      >
        <MapContainer
          bounds={bounds}
          style={{
            height: '420px',
            width: '100%',
            background: 'var(--navi-image-bg)',
          }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds bounds={bounds} />
          <Rectangle
            bounds={bounds}
            pathOptions={{
              color: 'var(--navi-accent)',
              weight: 2,
              fillOpacity: 0.06,
            }}
          />
          {points.map((point) => (
            <CircleMarker
              key={point.analysis_id}
              center={[point.lat, point.lon]}
              radius={8}
              pathOptions={markerPathOptions(
                point.primary_class,
                point.location_source,
              )}
            >
              <Popup>
                <div className="min-w-[160px] space-y-1 text-sm text-[color:var(--navi-text)]">
                  <p className="font-semibold">
                    {primaryClassLabel(point.primary_class)}
                  </p>
                  <p>MILCO: {point.milco_detection_count}</p>
                  <p>Detecções: {point.detection_count}</p>
                  <p>{formatPointDate(point.created_at)}</p>
                  <Link
                    to={`/analises/${point.analysis_id}`}
                    className="font-medium text-[color:var(--navi-link-active)] underline"
                  >
                    Ver análise
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          ))}
          <HeatLayer points={points} enabled={heatmapOn} />
        </MapContainer>
      </div>

      <DetectionClassLegend />

      {points.length === 0 ? (
        <p
          data-testid="campaign-map-empty"
          className="text-sm text-[color:var(--navi-muted)]"
          role="status"
        >
          Nenhuma análise nesta campanha
        </p>
      ) : null}
    </div>
  )
}
