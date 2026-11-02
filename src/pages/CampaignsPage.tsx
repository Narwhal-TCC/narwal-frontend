import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCampaigns, type Campaign } from '../api/campaigns'
import { ApiError } from '../api/client'

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const loadList = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const list = await listCampaigns()
      setCampaigns(list)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar as campanhas.'
      setLoadError(message)
      setCampaigns([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadList()
  }, [loadList, reloadToken])

  const handleRetry = () => {
    setReloadToken((value) => value + 1)
  }

  return (
    <div className="px-9 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
            Campanhas
          </p>
          <h1 className="pt-1.5 font-serif text-[30px] leading-[45px] text-[color:var(--navi-text)]">
            Campanhas
          </h1>
        </div>
        <button
          type="button"
          className="rounded-md bg-[var(--navi-accent)] px-4 py-2 text-sm font-medium text-[color:var(--navi-button-text)]"
          data-testid="campaign-create-open"
        >
          Nova campanha
        </button>
      </div>

      {isLoading ? (
        <p className="pt-8 text-[color:var(--navi-muted)]">Carregando campanhas…</p>
      ) : loadError ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <p className="text-lg font-semibold text-[color:var(--navi-text)]">
            Erro ao carregar
          </p>
          <p className="pt-2 text-sm text-[color:var(--navi-muted)]" role="alert">
            {loadError}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-4 rounded-md border border-[color:var(--navi-border-strong)] px-5 py-2.5 text-sm font-medium text-[color:var(--navi-link)]"
          >
            Tentar novamente
          </button>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <p className="text-lg font-semibold text-[color:var(--navi-text)]">
            Nenhuma campanha
          </p>
          <p className="pt-2 text-sm text-[color:var(--navi-muted)]">
            Crie a primeira campanha para organizar suas análises.
          </p>
          <button
            type="button"
            className="mt-4 rounded-md bg-[var(--navi-accent)] px-4 py-2 text-sm font-medium text-[color:var(--navi-button-text)]"
            data-testid="campaign-create-empty"
          >
            Criar campanha
          </button>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-[10px] border border-[color:var(--navi-border-subtle)]">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[color:var(--navi-border-subtle)] bg-[color:var(--navi-panel)] text-left text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">Análises</th>
                <th className="px-5 py-3">Simulada</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  data-testid={`campaign-row-${campaign.id}`}
                  className="border-b border-[color:var(--navi-border-subtle)] last:border-b-0"
                >
                  <td className="px-5 py-4 font-medium text-[color:var(--navi-text)]">
                    {campaign.name}
                  </td>
                  <td className="px-5 py-4 text-[color:var(--navi-link)]">
                    {campaign.analyses_count}
                  </td>
                  <td className="px-5 py-4">
                    {campaign.simulated ? (
                      <span className="rounded-md bg-[color:var(--navi-surface-tint)] px-2 py-0.5 text-xs font-medium text-[color:var(--navi-link)]">
                        Simulada
                      </span>
                    ) : (
                      <span className="text-[color:var(--navi-muted)]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-md border border-[color:var(--navi-border-strong)] px-3 py-1.5 text-xs font-medium text-[color:var(--navi-link)]"
                        data-testid={`campaign-edit-${campaign.id}`}
                      >
                        Editar
                      </button>
                      <Link
                        to={`/campaigns/${campaign.id}`}
                        className="rounded-md border border-[color:var(--navi-border-strong)] px-3 py-1.5 text-xs font-medium text-[color:var(--navi-link)]"
                        data-testid={`campaign-map-${campaign.id}`}
                      >
                        Ver mapa
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
