import { useState } from 'react'
import type { AnalysisResult } from '../../api/analyses'
import { useModels } from '../../models/useModels'
import { ResultadoExplainTab } from './ResultadoExplainTab'
import { ResultadoMetricsTab } from './ResultadoMetricsTab'

type ResultadoTab = 'metricas' | 'explicacao'

interface ResultadoSidePanelProps {
  analysis: AnalysisResult
  highlightedDetectionIndex?: number | null
  onHighlightDetection?: (index: number | null) => void
}

export function ResultadoSidePanel({
  analysis,
  highlightedDetectionIndex = null,
  onHighlightDetection,
}: ResultadoSidePanelProps) {
  const [activeTab, setActiveTab] = useState<ResultadoTab>('metricas')
  const { labelFor } = useModels()
  const modelLabel = labelFor(analysis.model_id)

  return (
    <div className="flex max-h-[70vh] flex-col overflow-hidden rounded-[10px] border border-[color:var(--navi-border-subtle)] bg-[color:var(--navi-panel)]">
      {modelLabel ? (
        <p
          data-testid="analysis-model-label"
          className="shrink-0 border-b border-[color:var(--navi-border-subtle)] px-5 py-3 text-sm text-[color:var(--navi-text)]"
        >
          <span className="text-[color:var(--navi-muted)]">Modelo: </span>
          {modelLabel}
        </p>
      ) : null}
      <div
        role="tablist"
        aria-label="Painel de resultado"
        className="flex shrink-0 border-b border-[color:var(--navi-border-subtle)]"
      >
        {(
          [
            { id: 'metricas' as const, label: 'Métricas' },
            { id: 'explicacao' as const, label: 'Explicação' },
          ] as const
        ).map(({ id, label }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`resultado-panel-${id}`}
              id={`resultado-tab-${id}`}
              onClick={() => setActiveTab(id)}
              className={[
                'flex-1 border-b-2 px-3 py-2.5 text-[13px] transition-colors',
                isActive
                  ? 'border-[color:var(--navi-link-active)] font-semibold text-[color:var(--navi-link-active)]'
                  : 'border-transparent font-normal text-[color:var(--navi-muted)] hover:text-[color:var(--navi-link)]',
              ].join(' ')}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`resultado-panel-${activeTab}`}
        aria-labelledby={`resultado-tab-${activeTab}`}
        className="overflow-y-auto p-5"
      >
        {activeTab === 'metricas' ? (
          <ResultadoMetricsTab
            analysis={analysis}
            highlightedDetectionIndex={highlightedDetectionIndex}
            onHighlightDetection={onHighlightDetection}
          />
        ) : (
          <ResultadoExplainTab aiAnalysis={analysis.ai_analysis} />
        )}
      </div>
    </div>
  )
}
