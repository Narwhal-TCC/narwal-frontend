import { useEffect, useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import { listModels, type ModelCatalogItem } from '../api/models'

export interface UseModelsResult {
  models: ModelCatalogItem[]
  defaultId: string | null
  labelFor: (modelId: string | null | undefined) => string
  error: ApiError | null
  isLoading: boolean
}

export function useModels(): UseModelsResult {
  const [models, setModels] = useState<ModelCatalogItem[]>([])
  const [error, setError] = useState<ApiError | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    listModels()
      .then((items) => {
        if (cancelled) return
        setModels(items)
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setModels([])
        setError(
          err instanceof ApiError
            ? err
            : new ApiError('UNKNOWN_ERROR', 'Failed to load models', 0),
        )
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const defaultId = useMemo(
    () => models.find((m) => m.is_default)?.id ?? null,
    [models],
  )

  const labelFor = useMemo(() => {
    const byId = new Map(models.map((m) => [m.id, m.label]))
    return (modelId: string | null | undefined): string => {
      if (modelId == null || modelId === '') return ''
      return byId.get(modelId) ?? modelId
    }
  }, [models])

  return { models, defaultId, labelFor, error, isLoading }
}
