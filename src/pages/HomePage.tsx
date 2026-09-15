import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAnalysis, listAnalyses, type AnalysisSummary } from '../api/analyses'
import { countMilco } from '../domain/classification'

const ACTIVE_CAMPAIGN = 'Santos 2026'

interface DashboardData {
  analysisCount: number
  milcoCount: number
  lastAnalysisLabel: string
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

  const milcoCount = detailResults.reduce(
    (total, detail) => total + (detail ? countMilco(detail.detections) : 0),
    0,
  )

  return {
    analysisCount: items.length,
    milcoCount,
    lastAnalysisLabel: formatRelativeTime(newest.created_at),
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
          accent ? 'text-[#e8836a]' : 'text-[color:var(--navi-text)]',
        ].join(' ')}
      >
        {value}
      </p>
    </div>
  )
}

export function HomePage() {
  const [data, setData] = useState<DashboardData>({
    analysisCount: 0,
    milcoCount: 0,
    lastAnalysisLabel: '—',
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

      <div className="mt-9 rounded-2xl border border-[color:var(--navi-border)] bg-[#1c2654] p-8">
        <div className="flex items-center justify-between gap-6">
          <div className="max-w-[380px]">
            <h2 className="text-xl font-semibold text-[color:var(--navi-text)]">
              Iniciar nova análise
            </h2>
            <p className="pt-2 text-sm text-[#98b9f2]">
              Envie uma imagem de sonar de varredura lateral para classificação automática de
              objetos no leito marinho.
            </p>
          </div>
          <Link
            to="/analises/nova"
            className="inline-flex items-center gap-2 rounded-md bg-[var(--navi-accent)] px-5 py-2.5 text-sm font-semibold text-[#f3f7ff]"
          >
            Nova análise
          </Link>
        </div>
      </div>

      <div className="mt-7 flex overflow-hidden rounded-[10px] border border-[color:var(--navi-border)] bg-[#1c2654]">
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
    </div>
  )
}
