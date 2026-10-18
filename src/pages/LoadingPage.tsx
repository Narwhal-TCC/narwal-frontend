import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createAnalysis } from '../api/analyses'
import { ApiError } from '../api/client'
import { createAnalysisOnce } from '../upload/createAnalysisOnce'
import {
  clearPendingUploadFile,
  getPendingUploadFile,
} from '../upload/pendingFile'

interface LoadingLocationState {
  file?: File
  modelId?: string
}

export function LoadingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [statusText] = useState('Analisando imagem de sonar…')

  useEffect(() => {
    const state = location.state as LoadingLocationState | null
    const file = state?.file ?? getPendingUploadFile()
    const modelId = state?.modelId

    if (!file) {
      navigate('/analises/nova', { replace: true })
      return
    }

    let cancelled = false

    // Shared promise across Strict Mode remount so POST /analyses runs once.
    createAnalysisOnce(file, createAnalysis, modelId)
      .then((result) => {
        if (cancelled) return
        clearPendingUploadFile()
        navigate(`/analises/${result.id}`, {
          replace: true,
          state: { analysis: result },
        })
      })
      .catch((err) => {
        if (cancelled) return
        clearPendingUploadFile()
        const message =
          err instanceof ApiError
            ? err.message
            : 'Não foi possível concluir a análise. Tente novamente.'
        navigate('/analises/nova', {
          replace: true,
          state: { error: message },
        })
      })

    return () => {
      cancelled = true
    }
  }, [location.state, navigate])

  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center px-9 py-16">
      <div
        className="size-12 animate-spin rounded-full border-4 border-[color:var(--navi-border-subtle)] border-t-[var(--navi-accent)]"
        role="status"
        aria-label="Carregando"
      />
      <p className="pt-6 text-lg font-semibold text-[color:var(--navi-text)]">
        {statusText}
      </p>
      <p className="pt-2 text-sm text-[color:var(--navi-muted)]">
        Isso pode levar alguns segundos.
      </p>
    </div>
  )
}
