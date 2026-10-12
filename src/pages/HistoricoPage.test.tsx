import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HistoricoPage } from './HistoricoPage'

vi.mock('../api/analyses', () => ({
  listAnalyses: vi.fn(),
  getAnalysis: vi.fn(),
}))

import { getAnalysis, listAnalyses } from '../api/analyses'

const summaryA = {
  id: 'aaaaaaaa-1111-1111-1111-111111111111',
  org_id: 'org',
  user_id: 'user',
  status: 'succeeded',
  created_at: '2026-01-01T10:00:00.000Z',
  inference_ms: 100,
  detection_count: 2,
}

const summaryB = {
  id: 'bbbbbbbb-2222-2222-2222-222222222222',
  org_id: 'org',
  user_id: 'user',
  status: 'succeeded',
  created_at: '2026-01-02T10:00:00.000Z',
  inference_ms: 120,
  detection_count: 1,
}

function renderHistorico() {
  return render(
    <MemoryRouter initialEntries={['/historico']}>
      <Routes>
        <Route path="/historico" element={<HistoricoPage />} />
        <Route path="/analises/:id" element={<div>Resultado Page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('HistoricoPage', () => {
  beforeEach(() => {
    vi.mocked(listAnalyses).mockReset()
    vi.mocked(getAnalysis).mockReset()
  })

  it('renders analysis list with short ids', async () => {
    vi.mocked(listAnalyses).mockResolvedValue({
      items: [summaryA, summaryB],
      limit: 50,
      offset: 0,
    })
    vi.mocked(getAnalysis).mockImplementation(async (id: string) => ({
      id,
      org_id: 'org',
      user_id: 'user',
      status: 'succeeded',
      detections:
        id === summaryA.id
          ? [{ x1: 0, y1: 0, x2: 1, y2: 1, confidence: 0.9, label: 'MILCO' }]
          : [{ x1: 0, y1: 0, x2: 1, y2: 1, confidence: 0.5, label: 'NOMBO' }],
      image_content_type: 'image/png',
      image_s3_key: 'key',
      image_url: null,
      created_at: summaryA.created_at,
      inference_ms: 100,
    }))

    renderHistorico()

    expect(await screen.findByText('aaaaaaaa')).toBeInTheDocument()
    expect(screen.getByText('bbbbbbbb')).toBeInTheDocument()
    expect(screen.getByText('2 detecções')).toBeInTheDocument()
    expect(screen.getByText('1 detecção')).toBeInTheDocument()
  })

  it('filters to analyses with NOMBO detections', async () => {
    vi.mocked(listAnalyses).mockResolvedValue({
      items: [summaryA, summaryB],
      limit: 50,
      offset: 0,
    })
    vi.mocked(getAnalysis).mockImplementation(async (id: string) => ({
      id,
      org_id: 'org',
      user_id: 'user',
      status: 'succeeded',
      detections:
        id === summaryA.id
          ? [{ x1: 0, y1: 0, x2: 1, y2: 1, confidence: 0.9, label: 'MILCO' }]
          : [{ x1: 0, y1: 0, x2: 1, y2: 1, confidence: 0.5, label: 'NOMBO' }],
      image_content_type: 'image/png',
      image_s3_key: 'key',
      image_url: null,
      created_at: summaryA.created_at,
      inference_ms: 100,
    }))

    renderHistorico()
    await screen.findByText('aaaaaaaa')

    fireEvent.click(screen.getByRole('button', { name: 'NOMBO' }))

    expect(screen.getByText('bbbbbbbb')).toBeInTheDocument()
    expect(screen.queryByText('aaaaaaaa')).not.toBeInTheDocument()
  })

  it('filters to analyses with MILCO detections', async () => {
    vi.mocked(listAnalyses).mockResolvedValue({
      items: [summaryA, summaryB],
      limit: 50,
      offset: 0,
    })
    vi.mocked(getAnalysis).mockImplementation(async (id: string) => ({
      id,
      org_id: 'org',
      user_id: 'user',
      status: 'succeeded',
      detections:
        id === summaryA.id
          ? [{ x1: 0, y1: 0, x2: 1, y2: 1, confidence: 0.9, label: 'MILCO' }]
          : [{ x1: 0, y1: 0, x2: 1, y2: 1, confidence: 0.5, label: 'NOMBO' }],
      image_content_type: 'image/png',
      image_s3_key: 'key',
      image_url: null,
      created_at: summaryA.created_at,
      inference_ms: 100,
    }))

    renderHistorico()
    await screen.findByText('aaaaaaaa')

    fireEvent.click(screen.getByRole('button', { name: 'MILCO' }))

    expect(screen.getByText('aaaaaaaa')).toBeInTheDocument()
    expect(screen.queryByText('bbbbbbbb')).not.toBeInTheDocument()
  })

  it('shows empty state when no analyses match filter', async () => {
    vi.mocked(listAnalyses).mockResolvedValue({ items: [], limit: 50, offset: 0 })

    renderHistorico()

    expect(await screen.findByText('Resultado não encontrado')).toBeInTheDocument()
  })

  it('appends items when Carregar mais is clicked', async () => {
    const firstPage = Array.from({ length: 50 }, (_, index) => ({
      ...summaryA,
      id: `page1-${index}`,
    }))
    vi.mocked(listAnalyses)
      .mockResolvedValueOnce({
        items: firstPage,
        limit: 50,
        offset: 0,
      })
      .mockResolvedValueOnce({
        items: [summaryB],
        limit: 50,
        offset: 50,
      })
    vi.mocked(getAnalysis).mockImplementation(async (id: string) => ({
      id,
      org_id: 'org',
      user_id: 'user',
      status: 'succeeded',
      detections: [],
      image_content_type: 'image/png',
      image_s3_key: 'key',
      image_url: null,
      created_at: summaryA.created_at,
      inference_ms: 100,
    }))

    renderHistorico()
    await screen.findByText('page1-0'.slice(0, 8))
    expect(screen.queryByText('bbbbbbbb')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Carregar mais' }))

    expect(await screen.findByText('bbbbbbbb')).toBeInTheDocument()
  })

  it('hides Carregar mais when the next page is empty', async () => {
    const firstPage = Array.from({ length: 50 }, (_, index) => ({
      ...summaryA,
      id: `page1-${index}`,
    }))
    vi.mocked(listAnalyses)
      .mockResolvedValueOnce({
        items: firstPage,
        limit: 50,
        offset: 0,
      })
      .mockResolvedValueOnce({
        items: [],
        limit: 50,
        offset: 50,
      })
    vi.mocked(getAnalysis).mockImplementation(async (id: string) => ({
      id,
      org_id: 'org',
      user_id: 'user',
      status: 'succeeded',
      detections: [],
      image_content_type: 'image/png',
      image_s3_key: 'key',
      image_url: null,
      created_at: summaryA.created_at,
      inference_ms: 100,
    }))

    renderHistorico()
    await screen.findByText('page1-0'.slice(0, 8))
    expect(screen.getByRole('button', { name: 'Carregar mais' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Carregar mais' }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Carregar mais' })).not.toBeInTheDocument()
    })
  })

  it('navigates to resultado when a row is clicked', async () => {
    vi.mocked(listAnalyses).mockResolvedValue({
      items: [summaryA],
      limit: 50,
      offset: 0,
    })
    vi.mocked(getAnalysis).mockResolvedValue({
      id: summaryA.id,
      org_id: 'org',
      user_id: 'user',
      status: 'succeeded',
      detections: [],
      image_content_type: 'image/png',
      image_s3_key: 'key',
      image_url: null,
      created_at: summaryA.created_at,
      inference_ms: 100,
    })

    renderHistorico()
    fireEvent.click(await screen.findByRole('button', { name: /aaaaaaaa/i }))

    await waitFor(() => {
      expect(screen.getByText('Resultado Page')).toBeInTheDocument()
    })
  })
})
