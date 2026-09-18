import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAnalysis, listAnalyses } from '../api/analyses'
import { analysisHasClass, countMilco } from '../domain/classification'
import { shortId } from '../domain/idDisplay'

const ACTIVE_CAMPAIGN = 'Santos 2026'
const RECENT_LIMIT = 5

interface RecentAnalysisRow {
  id: string
  created_at: string
  detection_count: number
  hasMilco: boolean
}

interface DashboardData {
  analysisCount: number
  milcoCount: number
  lastAnalysisLabel: string
  recentAnalyses: RecentAnalysisRow[]
}

function formatRelativeTime(isoDate: string): string {
  const then = new Date(isoDate).getTime()
  const diffMin = Math.floor((Date.now() - then) / 60000)

  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `${diffMin}min atrás`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h atrás`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d atrás`
}

function formatRowDate(iso: string): string {
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

function formatHeaderDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(date)
    .replace('.', '')
}

async function loadDashboardData(): Promise<DashboardData> {
  const list = await listAnalyses(50, 0)
  const items = list.items

  if (items.length === 0) {
    return {
      analysisCount: 0,
      milcoCount: 0,
      lastAnalysisLabel: 'Nenhuma',
      recentAnalyses: [],
    }
  }

  const sorted = [...items].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
  const newest = sorted[0]

  const detailResults = await Promise.all(
    items.map(async (item) => {
      try {
        return await getAnalysis(item.id)
      } catch {
        return null
      }
    }),
  )

  const detailById = new Map(
    items.map((item, index) => [item.id, detailResults[index]]),
  )

  const milcoCount = detailResults.reduce(
    (total, detail) => total + (detail ? countMilco(detail.detections) : 0),
    0,
  )

  const recentAnalyses: RecentAnalysisRow[] = sorted.slice(0, RECENT_LIMIT).map(
    (summary) => {
      const detail = detailById.get(summary.id)
      return {
        id: summary.id,
        created_at: summary.created_at,
        detection_count: summary.detection_count,
        hasMilco: detail ? analysisHasClass(detail.detections, 'MILCO') : false,
      }
    },
  )

  return {
    analysisCount: items.length,
    milcoCount,
    lastAnalysisLabel: formatRelativeTime(newest.created_at),
    recentAnalyses,
  }
}

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div className="flex flex-1 flex-col border-r border-[color:var(--navi-border)] px-[22px] py-[18px] last:border-r-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
        {label}
      </p>
      <p
        className={[
          'pt-1.5 font-mono text-[26px] font-bold leading-[28.6px]',
          accent ? 'text-[color:var(--navi-milco)]' : 'text-[color:var(--navi-text)]',
        ].join(' ')}
      >
        {value}
      </p>
    </div>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData>({
    analysisCount: 0,
    milcoCount: 0,
    lastAnalysisLabel: '—',
    recentAnalyses: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    loadDashboardData()
      .then((dashboard) => {
        if (!cancelled) {
          setData(dashboard)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="px-9 py-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
        {formatHeaderDate(new Date())}
      </p>
      <h1 className="pt-1.5 font-serif text-[30px] leading-[33px] text-[color:var(--navi-text)]">
        Visão geral
      </h1>

      <div className="mt-9 rounded-2xl border border-[color:var(--navi-border)] bg-[color:var(--navi-panel)] p-8">
        <div className="flex items-center justify-between gap-6">
          <div className="max-w-[380px]">
            <h2 className="text-xl font-semibold text-[color:var(--navi-text)]">
              Iniciar nova análise
            </h2>
            <p className="pt-2 text-sm text-[color:var(--navi-link)]">
              Envie uma imagem de sonar de varredura lateral para classificação automática de
              objetos no leito marinho.
            </p>
          </div>
          <Link
            to="/analises/nova"
            className="inline-flex items-center gap-2 rounded-md bg-[var(--navi-accent)] px-5 py-2.5 text-sm font-semibold text-[color:var(--navi-button-text)]"
          >
            Nova análise
          </Link>
        </div>
      </div>

      <div className="mt-7 flex overflow-hidden rounded-[10px] border border-[color:var(--navi-border)] bg-[color:var(--navi-panel)]">
        <KpiCard
          label="Análises realizadas"
          value={isLoading ? '—' : data.analysisCount}
        />
        <KpiCard
          label="Detecções MILCO"
          value={isLoading ? '—' : data.milcoCount}
          accent
        />
        <KpiCard
          label="Última análise"
          value={isLoading ? '—' : data.lastAnalysisLabel}
        />
        <KpiCard label="Campanha ativa" value={ACTIVE_CAMPAIGN} />
      </div>

      <section aria-label="Análises recentes" className="mt-7">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
          Análises recentes
        </h2>

        {isLoading ? (
          <p className="pt-4 text-sm text-[color:var(--navi-muted)]">Carregando…</p>
        ) : data.recentAnalyses.length === 0 ? (
          <p
            className="pt-4 text-sm text-[color:var(--navi-muted)]"
            role="status"
          >
            Nenhuma análise recente.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {data.recentAnalyses.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/analises/${row.id}`)}
                  className="flex w-full items-center justify-between rounded-[10px] border border-[color:var(--navi-border-subtle)] bg-[color:var(--navi-panel)] px-5 py-4 text-left hover:border-[color:var(--navi-border-strong)]"
                >
                  <div>
                    <p className="font-mono text-sm font-semibold text-[color:var(--navi-text)]">
                      {shortId(row.id)}
                    </p>
                    <p className="pt-1 text-xs text-[color:var(--navi-muted)]">
                      {formatRowDate(row.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <p className="text-sm text-[color:var(--navi-link)]">
                      {row.detection_count} detecções
                    </p>
                    {row.hasMilco ? (
                      <span className="rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide bg-[color-mix(in_srgb,var(--navi-milco)_20%,transparent)] text-[color:var(--navi-milco)]">
                        MILCO
                      </span>
                    ) : null}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
