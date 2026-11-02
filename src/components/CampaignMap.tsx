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
import { icoArrowRight, icoClock, icoMapPin } from '../assets'
import {
  campaignAreaBounds,
  hasSimulatedData,
  heatLayerPoints,
  locationSourceDescription,
  markerPathOptions,
  markerRadius,
  milcoHeatGradient,
} from '../domain/campaignMap'

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

function CampaignMapPopup({ point }: { point: CampaignPoint }) {
  const title = primaryClassLabel(point.primary_class)
  const titleAccent =
    point.primary_class === 'MILCO'
      ? 'text-[color:var(--navi-milco)]'
      : point.primary_class === 'NOMBO'
        ? 'text-[color:var(--navi-nombo)]'
        : 'text-[color:var(--navi-text)]'

  return (
    <div className="min-w-[280px] overflow-hidden">
      <header className="border-b border-[color:var(--navi-border-subtle)] px-3.5 pb-3.5 pr-9 pt-3.5">
        <div className="flex items-start gap-2.5">
          <img src={icoMapPin} alt="" className="mt-0.5 size-[18px] shrink-0" />
          <div className="min-w-0 flex-1">
            <h3
              className={`text-base font-semibold leading-tight ${titleAccent}`}
            >
              {title}
            </h3>
            <p
              data-testid="popup-location-source"
              className="mt-0.5 text-xs leading-snug text-[#94A3B8]"
            >
              {locationSourceDescription(point.location_source)}
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-3 px-3.5 py-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col rounded-md border border-[color:var(--navi-border-subtle)] bg-[color:var(--navi-input-bg)] px-2.5 py-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.6px] text-[#94A3B8]">
              MILCO
            </span>
            <span
              data-testid="popup-metric-milco"
              className="pt-0.5 font-mono text-lg font-bold text-[color:var(--navi-milco)]"
            >
              {point.milco_detection_count}
            </span>
          </div>
          <div className="flex flex-col rounded-md border border-[color:var(--navi-border-subtle)] bg-[color:var(--navi-input-bg)] px-2.5 py-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.6px] text-[#94A3B8]">
              Detecções
            </span>
            <span
              data-testid="popup-metric-detections"
              className="pt-0.5 font-mono text-lg font-bold text-[color:var(--navi-text)]"
            >
              {point.detection_count}
            </span>
          </div>
        </div>

        <p
          data-testid="popup-date"
          className="flex items-center gap-1.5 text-xs text-[#94A3B8]"
        >
          <img src={icoClock} alt="" className="size-3.5 shrink-0" />
          {formatPointDate(point.created_at)}
        </p>
      </div>

      <div className="border-t border-[color:var(--navi-border-subtle)] px-3.5 py-3">
        <Link
          to={`/analises/${point.analysis_id}`}
          className="campaign-map-popup-cta flex w-full items-center justify-center gap-2 rounded-md bg-[var(--navi-accent)] px-4 py-2.5 text-sm font-semibold text-[color:var(--navi-button-text)] no-underline transition hover:brightness-110"
        >
          Ver Análise Completa
          <img src={icoArrowRight} alt="" className="size-4 shrink-0" />
        </Link>
      </div>
    </div>
  )
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
    const latlngs = heatLayerPoints(points)
    const layer = L.heatLayer(latlngs, {
      radius: 32,
      blur: 22,
      maxZoom: 17,
      minOpacity: 0.35,
      max: 1,
      gradient: milcoHeatGradient,
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
    <div className="flex min-h-0 flex-1 flex-col gap-4">
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
        className="min-h-[480px] flex-1 overflow-hidden rounded-[10px] border border-[color:var(--navi-border)]"
      >
        <MapContainer
          bounds={bounds}
          className="h-full w-full"
          style={{
            height: 'calc(100vh - 14rem)',
            minHeight: '480px',
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
              radius={markerRadius(point.primary_class)}
              pathOptions={markerPathOptions(
                point.primary_class,
                point.location_source,
              )}
            >
              <Popup>
                <CampaignMapPopup point={point} />
              </Popup>
            </CircleMarker>
          ))}
          <HeatLayer points={points} enabled={heatmapOn} />
        </MapContainer>
      </div>

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
