import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  createCampaign,
  listCampaigns,
  updateCampaign,
  type Campaign,
  type CampaignArea,
} from '../api/campaigns'
import { ApiError } from '../api/client'

const FIELD_CLASS =
  'w-full rounded-md border border-[color:var(--navi-border-strong)] bg-[color:var(--navi-panel)] px-3 py-2.5 text-sm text-[color:var(--navi-text)] placeholder:text-[color:var(--navi-muted)] disabled:cursor-not-allowed disabled:opacity-60'

type FormMode =
  | { kind: 'create' }
  | { kind: 'edit'; campaign: Campaign }

function parseCoordinate(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const value = Number(trimmed)
  if (!Number.isFinite(value)) return null
  return value
}

function areaFromInputs(
  minLat: string,
  minLon: string,
  maxLat: string,
  maxLon: string,
): CampaignArea | 'invalid' {
  const min_lat = parseCoordinate(minLat)
  const min_lon = parseCoordinate(minLon)
  const max_lat = parseCoordinate(maxLat)
  const max_lon = parseCoordinate(maxLon)
  if (
    min_lat === null ||
    min_lon === null ||
    max_lat === null ||
    max_lon === null
  ) {
    return 'invalid'
  }
  return { min_lat, min_lon, max_lat, max_lon }
}

interface CampaignFormModalProps {
  mode: FormMode
  onClose: () => void
  onSaved: () => void
}

function CampaignFormModal({ mode, onClose, onSaved }: CampaignFormModalProps) {
  const editing = mode.kind === 'edit' ? mode.campaign : null
  const areaLocked = (editing?.analyses_count ?? 0) > 0

  const [name, setName] = useState(editing?.name ?? '')
  const [minLat, setMinLat] = useState(String(editing?.area.min_lat ?? ''))
  const [minLon, setMinLon] = useState(String(editing?.area.min_lon ?? ''))
  const [maxLat, setMaxLat] = useState(String(editing?.area.max_lat ?? ''))
  const [maxLon, setMaxLon] = useState(String(editing?.area.max_lon ?? ''))
  const [simulated, setSimulated] = useState(editing?.simulated ?? false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setFormError('Informe o nome da campanha.')
      return
    }

    let area: CampaignArea | undefined
    if (!areaLocked) {
      const parsed = areaFromInputs(minLat, minLon, maxLat, maxLon)
      if (parsed === 'invalid') {
        setFormError('Coordenadas inválidas')
        return
      }
      area = parsed
    }

    setIsSubmitting(true)
    try {
      if (mode.kind === 'create') {
        await createCampaign({
          name: trimmedName,
          area: area!,
          simulated,
        })
      } else {
        const body: {
          name: string
          simulated: boolean
          area?: CampaignArea
        } = { name: trimmedName, simulated }
        if (!areaLocked && area) {
          body.area = area
        }
        await updateCampaign(mode.campaign.id, body)
      }
      onSaved()
      onClose()
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Não foi possível salvar a campanha.'
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-form-title"
    >
      <div className="w-full max-w-lg rounded-[10px] border border-[color:var(--navi-border-subtle)] bg-[color:var(--navi-panel)] p-6 shadow-lg">
        <h2
          id="campaign-form-title"
          className="font-serif text-xl text-[color:var(--navi-text)]"
        >
          {mode.kind === 'create' ? 'Nova campanha' : 'Editar campanha'}
        </h2>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block pb-1.5 text-xs font-medium text-[color:var(--navi-muted)]">
              Nome
            </label>
            <input
              className={FIELD_CLASS}
              value={name}
              onChange={(event) => setName(event.target.value)}
              data-testid="campaign-form-name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block pb-1.5 text-xs font-medium text-[color:var(--navi-muted)]">
                Latitude mínima
              </label>
              <input
                className={FIELD_CLASS}
                value={minLat}
                onChange={(event) => setMinLat(event.target.value)}
                disabled={areaLocked}
                data-testid="campaign-form-min-lat"
              />
            </div>
            <div>
              <label className="block pb-1.5 text-xs font-medium text-[color:var(--navi-muted)]">
                Latitude máxima
              </label>
              <input
                className={FIELD_CLASS}
                value={maxLat}
                onChange={(event) => setMaxLat(event.target.value)}
                disabled={areaLocked}
                data-testid="campaign-form-max-lat"
              />
            </div>
            <div>
              <label className="block pb-1.5 text-xs font-medium text-[color:var(--navi-muted)]">
                Longitude mínima
              </label>
              <input
                className={FIELD_CLASS}
                value={minLon}
                onChange={(event) => setMinLon(event.target.value)}
                disabled={areaLocked}
                data-testid="campaign-form-min-lon"
              />
            </div>
            <div>
              <label className="block pb-1.5 text-xs font-medium text-[color:var(--navi-muted)]">
                Longitude máxima
              </label>
              <input
                className={FIELD_CLASS}
                value={maxLon}
                onChange={(event) => setMaxLon(event.target.value)}
                disabled={areaLocked}
                data-testid="campaign-form-max-lon"
              />
            </div>
          </div>

          {areaLocked ? (
            <p className="text-xs text-[color:var(--navi-muted)]">
              A área não pode ser alterada enquanto a campanha tiver análises.
            </p>
          ) : null}

          <label className="flex items-start gap-2 text-sm text-[color:var(--navi-link)]">
            <input
              type="checkbox"
              checked={simulated}
              onChange={(event) => setSimulated(event.target.checked)}
              className="mt-1"
              data-testid="campaign-form-simulated"
            />
            Simular posição quando não informada
          </label>

          {formError ? (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-[color:var(--navi-border-strong)] px-4 py-2 text-sm text-[color:var(--navi-link)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-[var(--navi-accent)] px-4 py-2 text-sm font-medium text-[color:var(--navi-button-text)] disabled:opacity-60"
              data-testid="campaign-form-submit"
            >
              {isSubmitting ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [formMode, setFormMode] = useState<FormMode | null>(null)

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

  const handleSaved = () => {
    setReloadToken((value) => value + 1)
  }

  const openCreate = () => {
    setFormMode({ kind: 'create' })
  }

  const openEdit = (campaign: Campaign) => {
    setFormMode({ kind: 'edit', campaign })
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
          onClick={openCreate}
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
            onClick={openCreate}
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
                        onClick={() => openEdit(campaign)}
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

      {formMode ? (
        <CampaignFormModal
          mode={formMode}
          onClose={() => setFormMode(null)}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  )
}
