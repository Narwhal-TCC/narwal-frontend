import { useEffect, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { icoUploadDrop } from '../assets'
import { validateUploadFile } from '../domain/uploadValidation'
import { useModels } from '../models/useModels'
import { ModelConfusionMatrix } from '../components/ModelConfusionMatrix'
import { benchmarkForModel } from '../domain/modelBenchmarks'
import { setPendingUploadFile } from '../upload/pendingFile'

const FIELD_CLASS =
  'w-full rounded-md border border-[color:var(--navi-border-strong)] bg-[color:var(--navi-panel)] px-3 py-2.5 text-sm text-[color:var(--navi-text)] placeholder:text-[color:var(--navi-muted)]'

const COLLECTION_FIELD_CLASS = `${FIELD_CLASS} font-mono`

const SELECT_CLASS = `${FIELD_CLASS} cursor-pointer`

export function NovaAnalisePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(
    (location.state as { error?: string } | null)?.error ?? null,
  )
  const [coordinates, setCoordinates] = useState('')
  const [collectedAt, setCollectedAt] = useState('')
  const [campaign, setCampaign] = useState('')
  const { models, defaultId, error: modelsError } = useModels()
  const [selectedModelId, setSelectedModelId] = useState<string>('')

  useEffect(() => {
    if (defaultId) {
      setSelectedModelId(defaultId)
    }
  }, [defaultId])

  const catalogFailed = modelsError !== null
  const selectedModel = models.find((m) => m.id === selectedModelId)
  const selectedBenchmark = selectedModelId
    ? benchmarkForModel(selectedModelId)
    : null

  const handleFile = (file: File | null) => {
    if (!file) return
    const validationError = validateUploadFile(file)
    if (validationError) {
      setSelectedFile(null)
      setError(validationError)
      return
    }
    setError(null)
    setSelectedFile(file)
  }

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    handleFile(file)
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    handleFile(event.dataTransfer.files[0] ?? null)
  }

  const onSubmit = () => {
    if (!selectedFile) {
      setError('Selecione uma imagem para continuar.')
      return
    }
    setPendingUploadFile(selectedFile)
    navigate('/analises/loading', {
      state: {
        file: selectedFile,
        modelId: catalogFailed ? undefined : selectedModelId || undefined,
      },
    })
  }

  return (
    <div className="px-9 py-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
        Nova análise
      </p>
      <h1 className="pt-1.5 font-serif text-[30px] leading-[45px] text-[color:var(--navi-text)]">
        Enviar imagem de sonar
      </h1>

      <div className="mx-auto mt-8 grid max-w-[960px] grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              inputRef.current?.click()
            }
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[color:var(--navi-border-strong)] bg-[color:var(--navi-panel)] p-8"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={onInputChange}
          />
          <div className="flex size-14 items-center justify-center rounded-full bg-[color:var(--navi-surface-tint)]">
            <img src={icoUploadDrop} alt="" className="size-7" />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-semibold text-[color:var(--navi-text)]">
              {selectedFile ? selectedFile.name : 'Arraste a imagem aqui'}
            </p>
            <p className="pt-1 text-[13px] text-[color:var(--navi-muted)]">
              ou clique para selecionar
            </p>
          </div>
          <p className="font-mono text-[11px] text-[color:var(--navi-muted)]">
            JPG · PNG · máx. 10 MB
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[10px] border border-[color:var(--navi-border-subtle)] bg-[color:var(--navi-panel)] p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
              Modelo de detecção
            </p>
            <div className="mt-4">
              <label
                htmlFor="analysis-model"
                className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]"
              >
                Modelo
              </label>
              <select
                id="analysis-model"
                disabled={catalogFailed}
                value={catalogFailed ? '' : selectedModelId}
                onChange={(event) => setSelectedModelId(event.target.value)}
                className={SELECT_CLASS}
              >
                {catalogFailed ? (
                  <option value="">Modelo padrão</option>
                ) : (
                  models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.label}
                    </option>
                  ))
                )}
              </select>
              {selectedModel && !catalogFailed ? (
                <div className="pt-3">
                  <p className="text-[13px] leading-[20px] text-[color:var(--navi-text)]">
                    {selectedBenchmark?.summary ?? selectedModel.description}
                  </p>
                  {selectedBenchmark ? (
                    <>
                      <p className="pt-2 text-[13px] leading-[20px] text-[color:var(--navi-muted)]">
                        {selectedBenchmark.narrative}
                      </p>
                      <ModelConfusionMatrix benchmark={selectedBenchmark} />
                    </>
                  ) : (
                    <p className="pt-2 text-[13px] leading-[20px] text-[color:var(--navi-muted)]">
                      {selectedModel.description}
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <details className="rounded-[10px] border border-[color:var(--navi-border-subtle)] bg-[color:var(--navi-panel)] p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="cursor-pointer list-none text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
              Informações adicionais
              <span className="ml-1.5 font-normal normal-case tracking-normal text-[color:var(--navi-muted)]">
                (opcional)
              </span>
            </summary>
            <p className="pt-3 text-[12px] leading-[18px] text-[color:var(--navi-muted)]">
              Coordenadas, data e campanha ainda não são enviadas na análise.
            </p>
            <div className="mt-4 space-y-3.5">
              <div>
                <label
                  htmlFor="collection-coordinates"
                  className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]"
                >
                  Coordenadas
                </label>
                <input
                  id="collection-coordinates"
                  type="text"
                  value={coordinates}
                  onChange={(event) => setCoordinates(event.target.value)}
                  placeholder="Ex.: 23°58'S 43°10'W"
                  autoComplete="off"
                  className={COLLECTION_FIELD_CLASS}
                />
              </div>
              <div>
                <label
                  htmlFor="collection-datetime"
                  className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]"
                >
                  Data e hora da coleta
                </label>
                <input
                  id="collection-datetime"
                  type="datetime-local"
                  value={collectedAt}
                  onChange={(event) => setCollectedAt(event.target.value)}
                  className={COLLECTION_FIELD_CLASS}
                />
              </div>
              <div>
                <label
                  htmlFor="collection-campaign"
                  className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]"
                >
                  Campanha
                </label>
                <input
                  id="collection-campaign"
                  type="text"
                  value={campaign}
                  onChange={(event) => setCampaign(event.target.value)}
                  placeholder="Nome da campanha"
                  autoComplete="off"
                  className={COLLECTION_FIELD_CLASS}
                />
              </div>
            </div>
          </details>

          {error ? (
            <p role="alert" className="text-[13px] text-[color:var(--navi-milco)]">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={onSubmit}
            className="w-full rounded-md bg-[var(--navi-accent)] px-5 py-2.5 text-sm font-semibold text-[color:var(--navi-button-text)]"
          >
            Iniciar análise
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full rounded-md border border-[color:var(--navi-border-strong)] px-5 py-2.5 text-sm font-medium text-[color:var(--navi-link)]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
