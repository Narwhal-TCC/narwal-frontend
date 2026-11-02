import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { getCampaignPoints, type CampaignPointsResponse } from '../api/campaigns'
import { CampaignMap } from '../components/CampaignMap'

export function CampanhaPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<CampaignPointsResponse | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      return
    }

    let cancelled = false
    setIsLoading(true)
    setNotFound(false)
    setError(null)
    setData(null)

    getCampaignPoints(id)
      .then((response) => {
        if (!cancelled) {
          setData(response)
        }
      })
      .catch((err) => {
        if (cancelled) {
          return
        }
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true)
          return
        }
        setError('Não foi possível carregar a campanha.')
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="px-9 py-8 text-[color:var(--navi-muted)]">
        Carregando campanha…
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="px-9 py-8 text-[color:var(--navi-muted)]" role="status">
        Campanha não encontrada.
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="px-9 py-8 text-[color:var(--navi-milco)]" role="alert">
        {error ?? 'Não foi possível carregar a campanha.'}
      </div>
    )
  }

  return (
    <div className="px-9 py-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
        Campanha
      </p>
      <CampaignMap campaign={data.campaign} points={data.points} />
    </div>
  )
}
