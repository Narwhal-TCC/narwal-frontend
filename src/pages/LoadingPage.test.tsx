import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoadingPage } from './LoadingPage'
import { NovaAnalisePage } from './NovaAnalisePage'

vi.mock('../api/analyses', () => ({
  createAnalysis: vi.fn(),
}))

import { createAnalysis } from '../api/analyses'
import { setPendingUploadFile } from '../upload/pendingFile'

function renderLoading(initialEntries: { pathname: string; state?: unknown }[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/analises/loading" element={<LoadingPage />} />
        <Route path="/analises/nova" element={<NovaAnalisePage />} />
        <Route path="/analises/:id" element={<div>Result Page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

function createFile(): File {
  return new File([new Uint8Array([1, 2, 3])], 'sonar.png', { type: 'image/png' })
}

describe('LoadingPage', () => {
  beforeEach(() => {
    vi.mocked(createAnalysis).mockReset()
  })

  it('redirects to nova when no pending file is available', async () => {
    renderLoading([{ pathname: '/analises/loading' }])

    expect(await screen.findByText('Enviar imagem de sonar')).toBeInTheDocument()
  })

  it('navigates to resultado on successful upload', async () => {
    vi.mocked(createAnalysis).mockResolvedValue({
      id: 'analysis-123',
      org_id: 'org',
      user_id: 'user',
      status: 'succeeded',
      detections: [],
      image_content_type: 'image/png',
      image_s3_key: 'key',
      image_url: null,
      created_at: new Date().toISOString(),
      inference_ms: 100,
    })

    const file = createFile()
    renderLoading([{ pathname: '/analises/loading', state: { file } }])

    await waitFor(() => {
      expect(screen.getByText('Result Page')).toBeInTheDocument()
    })
    expect(createAnalysis).toHaveBeenCalledWith(file)
  })

  it('returns to nova with API error message on failure', async () => {
    const { ApiError } = await import('../api/client')
    vi.mocked(createAnalysis).mockRejectedValue(
      new ApiError('INVALID_IMAGE', 'Imagem inválida.', 400),
    )

    renderLoading([{ pathname: '/analises/loading', state: { file: createFile() } }])

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Imagem inválida.')
    })
  })

  it('uses pending file store when location state is missing', async () => {
    vi.mocked(createAnalysis).mockResolvedValue({
      id: 'analysis-456',
      org_id: 'org',
      user_id: 'user',
      status: 'succeeded',
      detections: [],
      image_content_type: 'image/png',
      image_s3_key: 'key',
      image_url: null,
      created_at: new Date().toISOString(),
      inference_ms: 100,
    })

    const file = createFile()
    setPendingUploadFile(file)
    renderLoading([{ pathname: '/analises/loading' }])

    await waitFor(() => {
      expect(screen.getByText('Result Page')).toBeInTheDocument()
    })
  })
})
