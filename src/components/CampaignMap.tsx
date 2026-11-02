import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react'
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
import { CampaignDetectionsSidebar } from './CampaignDetectionsSidebar'
import {
  campaignAreaBounds,
  hasSimulatedData,
  heatLayerPoints,
  locationSourceDescription,
  markerPathOptions,
  markerRadius,
  milcoHeatGradient,
} from '../domain/campaignMap'
import {
  classGroupKey,
  filterVisibleCampaignPoints,
  type ClassGroupKey,
} from '../domain/campaignPointGroups'

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

function FlyToSelected({
  selectedAnalysisId,
  points,
  markerRefs,
}: {
  selectedAnalysisId: string | null
  points: CampaignPoint[]
  markerRefs: MutableRefObject<Record<string, L.CircleMarker | null>>
}) {
  const map = useMap()

  useEffect(() => {
    if (!selectedAnalysisId) {
      return
    }
    const point = points.find((p) => p.analysis_id === selectedAnalysisId)
    if (!point) {
      return
    }
    const targetZoom = Math.max(map.getZoom(), 14)
    map.flyTo([point.lat, point.lon], targetZoom, { duration: 0.4 })
    const layer = markerRefs.current[selectedAnalysisId]
    layer?.openPopup()
  }, [selectedAnalysisId, points, map, markerRefs])

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
  const [panelOpen, setPanelOpen] = useState(true)
  const [hiddenClasses, setHiddenClasses] = useState<Set<ClassGroupKey>>(
    () => new Set(),
  )
  const [hiddenAnalysisIds, setHiddenAnalysisIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [collapsedSections, setCollapsedSections] = useState<
    Set<ClassGroupKey>
  >(() => new Set())
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(
    null,
  )
  const markerRefs = useRef<Record<string, L.CircleMarker | null>>({})

  const bounds = campaignAreaBounds(campaign)
  const showSimulatedBadge = hasSimulatedData(campaign, points)

  const visiblePoints = useMemo(
    () => filterVisibleCampaignPoints(points, hiddenClasses, hiddenAnalysisIds),
    [points, hiddenClasses, hiddenAnalysisIds],
  )

  const toggleClassVisibility = (key: ClassGroupKey) => {
    setHiddenClasses((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const toggleAnalysisVisibility = (analysisId: string) => {
    setHiddenAnalysisIds((prev) => {
      const next = new Set(prev)
      if (next.has(analysisId)) {
        next.delete(analysisId)
      } else {
        next.add(analysisId)
        if (selectedAnalysisId === analysisId) {
          setSelectedAnalysisId(null)
        }
      }
      return next
    })
  }

  const toggleSectionCollapsed = (key: ClassGroupKey) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const handleSelectAnalysis = (analysisId: string) => {
    if (hiddenAnalysisIds.has(analysisId)) {
      return
    }
    const point = points.find((p) => p.analysis_id === analysisId)
    if (!point) {
      return
    }
    if (hiddenClasses.has(classGroupKey(point.primary_class))) {
      return
    }
    setSelectedAnalysisId(analysisId)
  }

  return (
    <div
      data-testid="campaign-map-layout"
      className="flex min-h-0 flex-1 overflow-hidden"
    >
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute left-4 top-4 z-[1000] flex max-w-[min(100%-2rem,420px)] flex-wrap items-center gap-2">
          <h2 className="pointer-events-auto rounded-md bg-[color-mix(in_srgb,var(--navi-panel)_88%,transparent)] px-3 py-1.5 text-lg font-semibold text-[color:var(--navi-text)] shadow-sm backdrop-blur-sm">
            {campaign.name}
          </h2>
          {showSimulatedBadge ? (
            <span
              data-testid="simulated-location-badge"
              className="pointer-events-auto rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide bg-[color-mix(in_srgb,var(--navi-nombo)_18%,transparent)] text-[color:var(--navi-link)] backdrop-blur-sm"
            >
              Dados de localização simulados
            </span>
          ) : null}
        </div>

        {!panelOpen ? (
          <button
            type="button"
            data-testid="campaign-panel-expand"
            aria-label="Expandir painel de detecções"
            onClick={() => setPanelOpen(true)}
            className="absolute right-3 top-1/2 z-[1000] -translate-y-1/2 rounded-l-md border border-r-0 border-[color:var(--navi-border)] bg-[color:var(--navi-panel)] px-1.5 py-3 text-sm text-[color:var(--navi-link)] shadow-sm hover:bg-[color:var(--navi-surface-tint)]"
          >
            ‹
          </button>
        ) : null}

        <div
          data-testid="campaign-map"
          className="min-h-0 flex-1 overflow-hidden bg-[color:var(--navi-image-bg)]"
        >
          <MapContainer
            bounds={bounds}
            className="h-full w-full"
            style={{ height: '100%', width: '100%', minHeight: 0 }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds bounds={bounds} />
            <FlyToSelected
              selectedAnalysisId={selectedAnalysisId}
              points={visiblePoints}
              markerRefs={markerRefs}
            />
            <Rectangle
              bounds={bounds}
              pathOptions={{
                color: 'var(--navi-accent)',
                weight: 2,
                fillOpacity: 0.06,
              }}
            />
            {visiblePoints.map((point) => {
              const selected = selectedAnalysisId === point.analysis_id
              const baseRadius = markerRadius(point.primary_class)
              return (
                <CircleMarker
                  key={point.analysis_id}
                  ref={(layer) => {
                    markerRefs.current[point.analysis_id] = layer
                  }}
                  center={[point.lat, point.lon]}
                  radius={selected ? baseRadius + 4 : baseRadius}
                  pathOptions={{
                    ...markerPathOptions(
                      point.primary_class,
                      point.location_source,
                    ),
                    weight: selected
                      ? 4
                      : markerPathOptions(
                          point.primary_class,
                          point.location_source,
                        ).weight,
                  }}
                  eventHandlers={{
                    click: () => setSelectedAnalysisId(point.analysis_id),
                  }}
                >
                  <Popup>
                    <CampaignMapPopup point={point} />
                  </Popup>
                </CircleMarker>
              )
            })}
            <HeatLayer points={visiblePoints} enabled={heatmapOn} />
          </MapContainer>
        </div>

        {points.length === 0 ? (
          <p
            data-testid="campaign-map-empty"
            className="absolute bottom-4 left-4 z-[1000] rounded-md bg-[color-mix(in_srgb,var(--navi-panel)_90%,transparent)] px-3 py-2 text-sm text-[color:var(--navi-muted)] backdrop-blur-sm"
            role="status"
          >
            Nenhuma análise nesta campanha
          </p>
        ) : null}
      </div>

      {panelOpen ? (
        <CampaignDetectionsSidebar
          points={points}
          hiddenClasses={hiddenClasses}
          hiddenAnalysisIds={hiddenAnalysisIds}
          collapsedSections={collapsedSections}
          selectedAnalysisId={selectedAnalysisId}
          heatmapOn={heatmapOn}
          onToggleClassVisibility={toggleClassVisibility}
          onToggleAnalysisVisibility={toggleAnalysisVisibility}
          onToggleSectionCollapsed={toggleSectionCollapsed}
          onSelectAnalysis={handleSelectAnalysis}
          onHeatmapChange={setHeatmapOn}
          onCollapsePanel={() => setPanelOpen(false)}
        />
      ) : null}
    </div>
  )
}
