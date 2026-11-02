import type { CampaignPoint } from '../api/campaigns'
import { icoEye, icoEyeOff, icoMapPin } from '../assets'
import {
  formatPointCoordinates,
  formatPrimaryConfidence,
} from '../domain/campaignMap'
import {
  classGroupLabel,
  groupCampaignPoints,
  type ClassGroupKey,
} from '../domain/campaignPointGroups'

function EyeButton({
  visible,
  label,
  onToggle,
  testId,
}: {
  visible: boolean
  label: string
  onToggle: () => void
  testId: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={visible}
      data-testid={testId}
      onClick={(event) => {
        event.stopPropagation()
        onToggle()
      }}
      className={[
        'flex size-7 shrink-0 items-center justify-center rounded-md border transition',
        visible
          ? 'border-[color:var(--navi-border-subtle)] hover:bg-[color:var(--navi-surface-tint)]'
          : 'border-[color:var(--navi-border)] bg-[color:var(--navi-input-bg)]',
      ].join(' ')}
    >
      <img
        src={visible ? icoEye : icoEyeOff}
        alt=""
        className="size-[18px]"
      />
    </button>
  )
}

export interface CampaignDetectionsSidebarProps {
  points: CampaignPoint[]
  hiddenClasses: ReadonlySet<ClassGroupKey>
  hiddenAnalysisIds: ReadonlySet<string>
  collapsedSections: ReadonlySet<ClassGroupKey>
  selectedAnalysisId: string | null
  heatmapOn: boolean
  onToggleClassVisibility: (key: ClassGroupKey) => void
  onToggleAnalysisVisibility: (analysisId: string) => void
  onToggleSectionCollapsed: (key: ClassGroupKey) => void
  onSelectAnalysis: (analysisId: string) => void
  onHeatmapChange: (enabled: boolean) => void
  onCollapsePanel: () => void
}

export function CampaignDetectionsSidebar({
  points,
  hiddenClasses,
  hiddenAnalysisIds,
  collapsedSections,
  selectedAnalysisId,
  heatmapOn,
  onToggleClassVisibility,
  onToggleAnalysisVisibility,
  onToggleSectionCollapsed,
  onSelectAnalysis,
  onHeatmapChange,
  onCollapsePanel,
}: CampaignDetectionsSidebarProps) {
  const groups = groupCampaignPoints(points)

  return (
    <aside
      data-testid="campaign-detections-sidebar"
      className="flex w-[320px] shrink-0 flex-col border-l border-[color:var(--navi-border)] bg-[color:var(--navi-panel)]"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[color:var(--navi-border-subtle)] px-3 py-2.5">
        <p className="text-sm font-semibold text-[color:var(--navi-text)]">
          Detecções
        </p>
        <button
          type="button"
          data-testid="campaign-panel-collapse"
          aria-label="Recolher painel"
          onClick={onCollapsePanel}
          className="rounded-md px-2 py-1 text-sm text-[color:var(--navi-link)] hover:bg-[color:var(--navi-surface-tint)]"
        >
          ›
        </button>
      </div>

      <div className="border-b border-[color:var(--navi-border-subtle)] px-3 py-2.5">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[color:var(--navi-link)]">
          <input
            type="checkbox"
            checked={heatmapOn}
            onChange={(event) => onHeatmapChange(event.target.checked)}
            data-testid="heatmap-toggle"
          />
          Mapa de densidade
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {groups.length === 0 ? (
          <p
            data-testid="campaign-sidebar-empty"
            className="px-2 py-4 text-sm text-[color:var(--navi-muted)]"
            role="status"
          >
            Nenhuma análise nesta campanha
          </p>
        ) : (
          groups.map((group) => {
            const classVisible = !hiddenClasses.has(group.key)
            const collapsed = collapsedSections.has(group.key)
            return (
              <section
                key={group.key}
                data-testid={`class-group-${group.key}`}
                className="mb-2"
              >
                <div className="flex items-center gap-1 rounded-md px-1 py-1">
                  <EyeButton
                    visible={classVisible}
                    label={
                      classVisible
                        ? `Ocultar grupo ${classGroupLabel(group.key)}`
                        : `Mostrar grupo ${classGroupLabel(group.key)}`
                    }
                    testId={`class-visibility-${group.key}`}
                    onToggle={() => onToggleClassVisibility(group.key)}
                  />
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-1 rounded-md px-1 py-1 text-left text-sm font-medium text-[color:var(--navi-text)] hover:bg-[color:var(--navi-surface-tint)]"
                    aria-expanded={!collapsed}
                    onClick={() => onToggleSectionCollapsed(group.key)}
                  >
                    <span className="text-[color:var(--navi-muted)]">
                      {collapsed ? '▸' : '▾'}
                    </span>
                    <span className="truncate">{classGroupLabel(group.key)}</span>
                    <span className="ml-auto font-mono text-xs text-[color:var(--navi-muted)]">
                      {group.points.length}
                    </span>
                  </button>
                </div>

                {!collapsed ? (
                  <ul className="space-y-0.5 pb-1 pl-1">
                    {group.points.map((point) => {
                      const rowVisible = !hiddenAnalysisIds.has(
                        point.analysis_id,
                      )
                      const selected =
                        selectedAnalysisId === point.analysis_id
                      return (
                        <li key={point.analysis_id}>
                          <div
                            role="button"
                            tabIndex={rowVisible ? 0 : -1}
                            data-testid={`detection-row-${point.analysis_id}`}
                            data-selected={selected ? 'true' : 'false'}
                            onClick={() => {
                              if (rowVisible) {
                                onSelectAnalysis(point.analysis_id)
                              }
                            }}
                            onKeyDown={(event) => {
                              if (
                                rowVisible &&
                                (event.key === 'Enter' || event.key === ' ')
                              ) {
                                event.preventDefault()
                                onSelectAnalysis(point.analysis_id)
                              }
                            }}
                            className={[
                              'flex items-center gap-1 rounded-md px-1 py-1.5',
                              selected
                                ? 'bg-[color:var(--navi-surface-active)]'
                                : 'hover:bg-[color:var(--navi-surface-tint)]',
                              rowVisible
                                ? 'cursor-pointer'
                                : 'cursor-not-allowed opacity-50',
                            ].join(' ')}
                          >
                            <EyeButton
                              visible={rowVisible}
                              label={
                                rowVisible
                                  ? 'Ocultar análise no mapa'
                                  : 'Mostrar análise no mapa'
                              }
                              testId={`analysis-visibility-${point.analysis_id}`}
                              onToggle={() =>
                                onToggleAnalysisVisibility(point.analysis_id)
                              }
                            />
                            <img
                              src={icoMapPin}
                              alt=""
                              className="size-4 shrink-0 opacity-80"
                            />
                            <div className="min-w-0 flex-1">
                              <p
                                data-testid={`detection-row-coords-${point.analysis_id}`}
                                className="truncate font-mono text-sm text-[color:var(--navi-text)]"
                              >
                                {formatPointCoordinates(point.lat, point.lon)}
                              </p>
                              <p
                                data-testid={`detection-row-confidence-${point.analysis_id}`}
                                className="truncate text-xs text-[color:var(--navi-muted)]"
                              >
                                {formatPrimaryConfidence(
                                  point.primary_confidence,
                                )}
                              </p>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                ) : null}
              </section>
            )
          })
        )}
      </div>
    </aside>
  )
}
