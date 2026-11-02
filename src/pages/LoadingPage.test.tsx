import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoadingPage } from './LoadingPage'
import { NovaAnalisePage } from './NovaAnalisePage'

vi.mock('../api/analyses', () => ({
  createAnalysis: vi.fn(),
}))

vi.mock('../api/campaigns', () => ({
  listCampaigns: vi.fn().mockResolvedValue([
    {
      id: 'camp-1',
      name: 'Campanha Simulada',
      area: { min_lat: 38, min_lon: -10, max_lat: 39, max_lon: -9 },
      simulated: true,
      analyses_count: 0,
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ]),
}))

import { createAnalysis } from '../api/analyses'
import { resetCreateAnalysisOnce } from '../upload/createAnalysisOnce'
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
    resetCreateAnalysisOnce()
  })

  it('redirects to nova when no pending file is available', async () => {
    renderLoading([{ pathname: '/analises/loading' }])

    expect(await screen.findByText('Enviar imagem de sonar')).toBeInTheDocument()
  })

  it('redirects to nova when campaignId is missing from navigation state', async () => {
    renderLoading([{ pathname: '/analises/loading', state: { file: createFile() } }])

    expect(await screen.findByText('Enviar imagem de sonar')).toBeInTheDocument()
    expect(createAnalysis).not.toHaveBeenCalled()
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
    renderLoading([
      { pathname: '/analises/loading', state: { file, campaignId: 'camp-1' } },
    ])

    await waitFor(() => {
      expect(screen.getByText('Result Page')).toBeInTheDocument()
    })
    expect(createAnalysis).toHaveBeenCalledWith(file, {
      campaignId: 'camp-1',
      modelId: undefined,
    })
  })

  it('forwards campaignId without latitude or longitude when position omitted', async () => {
    vi.mocked(createAnalysis).mockResolvedValue({
      id: 'analysis-campaign-only',
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
    renderLoading([
      {
        pathname: '/analises/loading',
        state: { file, campaignId: 'camp-1', modelId: 'yolo-convnext-balanced' },
      },
    ])

    await waitFor(() => {
      expect(screen.getByText('Result Page')).toBeInTheDocument()
    })

    const options = vi.mocked(createAnalysis).mock.calls[0][1]
    expect(options).toEqual({
      campaignId: 'camp-1',
      modelId: 'yolo-convnext-balanced',
    })
    expect(options).not.toHaveProperty('latitude')
    expect(options).not.toHaveProperty('longitude')
  })

  it('forwards campaignId with latitude and longitude when both provided', async () => {
    vi.mocked(createAnalysis).mockResolvedValue({
      id: 'analysis-position',
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
    renderLoading([
      {
        pathname: '/analises/loading',
        state: {
          file,
          campaignId: 'camp-1',
          latitude: 38.76543,
          longitude: -9.87654,
        },
      },
    ])

    await waitFor(() => {
      expect(screen.getByText('Result Page')).toBeInTheDocument()
    })
    expect(createAnalysis).toHaveBeenCalledWith(file, {
      campaignId: 'camp-1',
      modelId: undefined,
      latitude: 38.76543,
      longitude: -9.87654,
    })
  })

  it('forwards modelId from navigation state to createAnalysis', async () => {
    vi.mocked(createAnalysis).mockResolvedValue({
      id: 'analysis-recall',
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
    renderLoading([
      {
        pathname: '/analises/loading',
        state: { file, campaignId: 'camp-1', modelId: 'yolo-convnext-recall' },
      },
    ])

    await waitFor(() => {
      expect(screen.getByText('Result Page')).toBeInTheDocument()
    })
    expect(createAnalysis).toHaveBeenCalledWith(file, {
      campaignId: 'camp-1',
      modelId: 'yolo-convnext-recall',
    })
  })

  it('posts createAnalysis only once under React Strict Mode remount', async () => {
    let resolveUpload!: (value: unknown) => void
    const uploadPromise = new Promise((resolve) => {
      resolveUpload = resolve
    })
    vi.mocked(createAnalysis).mockReturnValue(uploadPromise as never)

    const file = createFile()
    const state = { file, campaignId: 'camp-1' }
    const { unmount } = renderLoading([{ pathname: '/analises/loading', state }])
    // Simulate Strict Mode: cleanup then remount with the same file.
    unmount()
    renderLoading([{ pathname: '/analises/loading', state }])

    resolveUpload({
      id: 'analysis-strict',
      org_id: 'org',
      user_id: 'user',
      status: 'succeeded',
      detections: [],
      image_content_type: 'image/png',
      image_s3_key: 'key',
      image_url: 'https://example.com/sonar.png',
      created_at: new Date().toISOString(),
      inference_ms: 100,
    })

    await waitFor(() => {
      expect(screen.getByText('Result Page')).toBeInTheDocument()
    })
    expect(createAnalysis).toHaveBeenCalledTimes(1)
  })

  it('returns to nova with backend detail on upload failure', async () => {
    const { ApiError } = await import('../api/client')
    vi.mocked(createAnalysis).mockRejectedValue(
      new ApiError('INVALID_IMAGE', 'Imagem inválida.', 400),
    )

    renderLoading([
      {
        pathname: '/analises/loading',
        state: { file: createFile(), campaignId: 'camp-1' },
      },
    ])

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Imagem inválida.')
    })
  })

  it('redirects to nova when only a pending file exists without campaignId', async () => {
    const file = createFile()
    setPendingUploadFile(file)
    renderLoading([{ pathname: '/analises/loading' }])

    expect(await screen.findByText('Enviar imagem de sonar')).toBeInTheDocument()
    expect(createAnalysis).not.toHaveBeenCalled()
  })
})
