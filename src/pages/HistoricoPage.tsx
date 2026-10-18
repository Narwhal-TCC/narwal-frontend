import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAnalysis,
  listAnalyses,
  type AnalysisResult,
  type AnalysisSummary,
} from '../api/analyses'
import { analysisHasClass, countMilco, type DetectionClass } from '../domain/classification'
import { shortId } from '../domain/idDisplay'
import { formatDeteccaoCount } from '../domain/ptPlural'
import { useModels } from '../models/useModels'

const PAGE_SIZE = 50

type FilterOption = 'ALL' | DetectionClass

interface EnrichedItem {
  summary: AnalysisSummary
  detail: AnalysisResult | null
}

function formatDate(iso: string): string {
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

async function enrichSummaries(items: AnalysisSummary[]): Promise<EnrichedItem[]> {
  const details = await Promise.all(
    items.map(async (summary) => {
      try {
        const detail = await getAnalysis(summary.id)
        return { summary, detail }
      } catch {
        return { summary, detail: null }
      }
    }),
  )
  return details
}

export function HistoricoPage() {
  const navigate = useNavigate()
  const { labelFor } = useModels()
  const [items, setItems] = useState<EnrichedItem[]>([])
  const [filter, setFilter] = useState<FilterOption>('ALL')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const loadPage = useCallback(async (pageOffset: number, append: boolean) => {
    const response = await listAnalyses(PAGE_SIZE, pageOffset)
    const enriched = await enrichSummaries(response.items)
    setHasMore(response.items.length === PAGE_SIZE)
    setOffset(pageOffset + response.items.length)
    setItems((current) => (append ? [...current, ...enriched] : enriched))
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    loadPage(0, false)
      .catch(() => {
        if (!cancelled) setItems([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [loadPage])

  const filteredItems = useMemo(() => {
    if (filter === 'ALL') return items
    return items.filter(
      (item) => item.detail && analysisHasClass(item.detail.detections, filter),
    )
  }, [filter, items])

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    try {
      await loadPage(offset, true)
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <div className="px-9 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
            Histórico
          </p>
          <h1 className="pt-1.5 font-serif text-[30px] leading-[45px] text-[color:var(--navi-text)]">
            Histórico
          </h1>
        </div>
        <div className="flex gap-2">
          {(['ALL', 'MILCO', 'NOMBO'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={[
                'rounded-md px-3 py-1.5 text-sm font-medium',
                filter === option
                  ? 'bg-[var(--navi-accent)] text-[color:var(--navi-button-text)]'
                  : 'border border-[color:var(--navi-border-strong)] text-[color:var(--navi-link)]',
              ].join(' ')}
            >
              {option === 'ALL' ? 'Todos' : option}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="pt-8 text-[color:var(--navi-muted)]">Carregando histórico…</p>
      ) : filteredItems.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <p className="text-lg font-semibold text-[color:var(--navi-text)]">
            Resultado não encontrado
          </p>
          <p className="pt-2 text-sm text-[color:var(--navi-muted)]">
            Nenhuma análise corresponde ao filtro selecionado.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {filteredItems.map(({ summary, detail }) => {
            const modelId = detail?.model_id ?? summary.model_id
            const modelLabel = modelId ? labelFor(modelId) : null
            return (
            <li key={summary.id}>
              <button
                type="button"
                onClick={() => navigate(`/analises/${summary.id}`)}
                className="flex w-full items-center justify-between rounded-[10px] border border-[color:var(--navi-border-subtle)] bg-[color:var(--navi-panel)] px-5 py-4 text-left hover:border-[color:var(--navi-border-strong)]"
              >
                <div>
                  <p className="font-mono text-sm font-semibold text-[color:var(--navi-text)]">
                    {shortId(summary.id)}
                  </p>
                  <p className="pt-1 text-xs text-[color:var(--navi-muted)]">
                    {formatDate(summary.created_at)}
                  </p>
                  {modelLabel ? (
                    <p
                      data-testid={`history-model-${summary.id}`}
                      className="pt-1 text-xs text-[color:var(--navi-link)]"
                    >
                      {modelLabel}
                    </p>
                  ) : null}
                </div>
                <div className="text-right text-sm text-[color:var(--navi-link)]">
                  <p>{formatDeteccaoCount(summary.detection_count)}</p>
                  {detail ? (
                    <p className="pt-0.5 text-xs text-[color:var(--navi-muted)]">
                      {countMilco(detail.detections)} MILCO
                    </p>
                  ) : null}
                </div>
              </button>
            </li>
            )
          })}
        </ul>
      )}

      {hasMore && filteredItems.length > 0 ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="rounded-md border border-[color:var(--navi-border-strong)] px-5 py-2.5 text-sm font-medium text-[color:var(--navi-link)] disabled:opacity-60"
          >
            {isLoadingMore ? 'Carregando…' : 'Carregar mais'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
