import { useEffect, useState, useCallback } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { getAnalysis, type AnalysisResult } from '../api/analyses'
import { DetectionClassLegend } from '../components/DetectionClassLegend'
import { DetectionOverlay } from '../components/DetectionOverlay'
import { shortId } from '../domain/idDisplay'
import { ResultadoSidePanel } from './resultado/ResultadoSidePanel'

interface ResultadoLocationState {
  analysis?: AnalysisResult
}

export function ResultadoPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const state = location.state as ResultadoLocationState | null
  const seeded =
    state?.analysis && state.analysis.id === id ? state.analysis : null
  // Create POST may omit image_url; keep loading until GET hydrates it.
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(seeded)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!seeded)
  const [highlightedDetectionIndex, setHighlightedDetectionIndex] = useState<
    number | null
  >(null)

  const handleHighlightDetection = useCallback((index: number | null) => {
    setHighlightedDetectionIndex(index)
  }, [])

  useEffect(() => {
    if (!id) return

    let cancelled = false
    const showLoading = !seeded
    if (showLoading) setIsLoading(true)

    getAnalysis(id)
      .then((result) => {
        if (!cancelled) {
          setAnalysis(result)
          setError(null)
        }
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
  }, [id, seeded])

  if (isLoading && !analysis) {
    return (
      <div className="px-9 py-8 text-[color:var(--navi-muted)]">Carregando resultado…</div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="px-9 py-8 text-[color:var(--navi-milco)]" role="alert">
        {error ?? 'Resultado não encontrado.'}
      </div>
    )
  }

  const detections = analysis.detections

  return (
    <div className="px-9 py-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
        Resultado
      </p>
      <h1 className="pt-1 font-serif text-[28px] leading-[36px] text-[color:var(--navi-text)]">
        Resultado da análise
      </h1>
      <p className="pt-1 font-mono text-sm text-[color:var(--navi-muted)]">
        ID {shortId(analysis.id)}
      </p>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px] lg:gap-6">
        <div className="min-h-0">
          <div className="max-h-[70vh] overflow-hidden">
            <DetectionOverlay
              detections={detections}
              imageUrl={analysis.image_url}
              imageClassName="max-h-[70vh] object-contain"
              highlightedIndex={highlightedDetectionIndex}
            />
          </div>
          <DetectionClassLegend />
        </div>

        <ResultadoSidePanel
          analysis={analysis}
          highlightedDetectionIndex={highlightedDetectionIndex}
          onHighlightDetection={handleHighlightDetection}
        />
      </div>
    </div>
  )
}
