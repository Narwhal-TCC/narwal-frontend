import type { AnalysisResult } from '../../api/analyses'
import { classifyDetection, countMilco } from '../../domain/classification'
import { shortId } from '../../domain/idDisplay'
import { DetectionBadge } from './DetectionBadge'

const ACTIVE_CAMPAIGN = 'Santos 2026'

function formatAnalysisDate(iso: string): string {
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

function countNombo(detections: AnalysisResult['detections']): number {
  return detections.filter((d) => classifyDetection(d) === 'NOMBO').length
}

function MetricCard({
  label,
  value,
  testId,
  accent,
}: {
  label: string
  value: number
  testId: string
  accent?: 'milco' | 'nombo'
}) {
  const valueClass =
    accent === 'milco'
      ? 'text-[color:var(--navi-milco)]'
      : accent === 'nombo'
        ? 'text-[color:var(--navi-nombo)]'
        : 'text-[color:var(--navi-text)]'

  return (
    <div className="flex flex-1 flex-col rounded-md border border-[color:var(--navi-border-subtle)] bg-[color:var(--navi-input-bg)] px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.6px] text-[color:var(--navi-muted)]">
        {label}
      </p>
      <p
        data-testid={testId}
        className={['pt-1 font-mono text-xl font-bold', valueClass].join(' ')}
      >
        {value}
      </p>
    </div>
  )
}

export function ResultadoMetricsTab({ analysis }: { analysis: AnalysisResult }) {
  const detections = analysis.detections
  const milcoCount = countMilco(detections)
  const nomboCount = countNombo(detections)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
          Resumo
        </p>
        <div className="mt-3 flex gap-2">
          <MetricCard label="Total" value={detections.length} testId="metric-total" />
          <MetricCard
            label="MILCO"
            value={milcoCount}
            testId="metric-milco"
            accent="milco"
          />
          <MetricCard
            label="NOMBO"
            value={nomboCount}
            testId="metric-nombo"
            accent="nombo"
          />
        </div>
      </div>

      <div className="border-t border-[color:var(--navi-border-subtle)] pt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
          Metadados
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[color:var(--navi-muted)]">ID</dt>
            <dd className="font-mono text-[color:var(--navi-link)]">{shortId(analysis.id)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[color:var(--navi-muted)]">Data</dt>
            <dd className="text-[color:var(--navi-text)]">
              {formatAnalysisDate(analysis.created_at)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[color:var(--navi-muted)]">Campanha</dt>
            <dd className="text-[color:var(--navi-text)]">{ACTIVE_CAMPAIGN}</dd>
          </div>
        </dl>
      </div>

      <div className="border-t border-[color:var(--navi-border-subtle)] pt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
          Detecções ({detections.length})
        </p>

        {detections.length === 0 ? (
          <p className="pt-4 text-sm text-[color:var(--navi-muted)]">
            Nenhuma detecção encontrada nesta imagem.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {detections.map((detection, index) => (
              <li
                key={`${detection.x1}-${detection.y1}-${index}`}
                className="flex items-center justify-between rounded-md border border-[color:var(--navi-border-subtle)] bg-[color:var(--navi-input-bg)] px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-[color:var(--navi-text)]">
                    {detection.label || `Detecção ${index + 1}`}
                  </p>
                  <p className="font-mono text-xs text-[color:var(--navi-muted)]">
                    Confiança {(detection.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <DetectionBadge detection={detection} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
