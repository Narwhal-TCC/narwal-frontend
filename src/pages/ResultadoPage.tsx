import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { getAnalysis, type AnalysisResult } from '../api/analyses'
import { DetectionOverlay } from '../components/DetectionOverlay'
import { classifyDetection } from '../domain/classification'
import { shortId } from '../domain/idDisplay'

interface ResultadoLocationState {
  analysis?: AnalysisResult
}

function DetectionBadge({ confidence }: { confidence: number }) {
  const detectionClass = classifyDetection({
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    confidence,
    label: '',
  })

  return (
    <span
      className={[
        'rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        detectionClass === 'MILCO'
          ? 'bg-[rgba(232,131,106,0.2)] text-[#e8836a]'
          : 'bg-[rgba(111,156,235,0.2)] text-[#6f9ceb]',
      ].join(' ')}
    >
      {detectionClass}
    </span>
  )
}

export function ResultadoPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const state = location.state as ResultadoLocationState | null
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(
    state?.analysis ?? null,
  )
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!state?.analysis)

  useEffect(() => {
    if (state?.analysis || !id) return

    let cancelled = false
    getAnalysis(id)
      .then((result) => {
        if (!cancelled) setAnalysis(result)
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível carregar o resultado.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, state?.analysis])

  if (isLoading && !analysis) {
    return (
      <div className="px-9 py-8 text-[color:var(--navi-muted)]">Carregando resultado…</div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="px-9 py-8 text-[#e8836a]" role="alert">
        {error ?? 'Resultado não encontrado.'}
      </div>
    )
  }

  const detections = analysis.detections

  return (
    <div className="px-9 py-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
        Resultado
      </p>
      <h1 className="pt-1.5 font-serif text-[30px] leading-[42px] text-[color:var(--navi-text)]">
        Resultado da análise
      </h1>
      <p className="pt-1 font-mono text-sm text-[color:var(--navi-muted)]">
        ID {shortId(analysis.id)}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <DetectionOverlay
          detections={detections}
          imageUrl={analysis.image_url}
        />

        <div className="rounded-[10px] border border-[rgba(111,156,235,0.15)] bg-[#1c2654] p-5">
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
                  className="flex items-center justify-between rounded-md border border-[rgba(111,156,235,0.12)] bg-[rgba(255,255,255,0.03)] px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-[color:var(--navi-text)]">
                      {detection.label || `Detecção ${index + 1}`}
                    </p>
                    <p className="font-mono text-xs text-[color:var(--navi-muted)]">
                      Confiança {(detection.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  <DetectionBadge confidence={detection.confidence} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
