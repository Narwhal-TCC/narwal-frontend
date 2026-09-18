import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ResultadoPage } from './ResultadoPage'

vi.mock('../api/analyses', () => ({
  getAnalysis: vi.fn(),
}))

import { getAnalysis } from '../api/analyses'

const baseAnalysis = {
  id: '01234567-89ab-cdef-0123-456789abcdef',
  org_id: 'org',
  user_id: 'user',
  status: 'succeeded' as const,
  image_content_type: 'image/png',
  image_s3_key: 'key',
  created_at: new Date().toISOString(),
  inference_ms: 120,
}

function renderResultado(
  path = '/analises/01234567-89ab-cdef-0123-456789abcdef',
  state?: unknown,
) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: path, state }]}>
      <Routes>
        <Route path="/analises/:id" element={<ResultadoPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ResultadoPage', () => {
  beforeEach(() => {
    vi.mocked(getAnalysis).mockReset()
  })

  it('renders tabbed side panel with detections in Métricas tab', async () => {
    vi.mocked(getAnalysis).mockResolvedValue({
      ...baseAnalysis,
      image_url: 'https://example.com/sonar.png',
      detections: [
        { x1: 0, y1: 0, x2: 10, y2: 10, confidence: 0.85, label: 'Alvo A' },
        { x1: 1, y1: 1, x2: 2, y2: 2, confidence: 0.5, label: 'Alvo B' },
      ],
    })

    renderResultado()

    expect(await screen.findByRole('tab', { name: 'Métricas' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('Alvo A')).toBeInTheDocument()
    expect(screen.getByText(/Confiança 85\.0%/)).toBeInTheDocument()
    expect(screen.getByText('Alvo B')).toBeInTheDocument()
    expect(screen.getByTestId('detection-badge-milco')).toBeInTheDocument()
    expect(screen.getByTestId('detection-badge-nombo')).toBeInTheDocument()
  })

  it('shows empty detections treatment in Métricas tab', async () => {
    vi.mocked(getAnalysis).mockResolvedValue({
      ...baseAnalysis,
      image_url: 'https://example.com/sonar.png',
      detections: [],
    })

    renderResultado()

    expect(
      await screen.findByText('Nenhuma detecção encontrada nesta imagem.'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('metric-total')).toHaveTextContent('0')
  })

  it('shows placeholder when image_url is null and still renders side panel', async () => {
    vi.mocked(getAnalysis).mockResolvedValue({
      ...baseAnalysis,
      image_url: null,
      detections: [
        { x1: 0, y1: 0, x2: 10, y2: 10, confidence: 0.9, label: 'Alvo' },
      ],
    })

    renderResultado()

    await waitFor(() => {
      expect(screen.getByTestId('detection-placeholder')).toHaveTextContent(
        'Imagem indisponível',
      )
    })
    expect(screen.getByRole('tab', { name: 'Métricas' })).toBeInTheDocument()
    expect(screen.getByText('Alvo')).toBeInTheDocument()
  })

  it('switches to Explicação tab with empty state', async () => {
    vi.mocked(getAnalysis).mockResolvedValue({
      ...baseAnalysis,
      image_url: 'https://example.com/sonar.png',
      detections: [],
    })

    renderResultado()

    fireEvent.click(await screen.findByRole('tab', { name: 'Explicação' }))

    expect(
      screen.getByText('Nenhuma explicação disponível.'),
    ).toBeInTheDocument()
  })

  it('constrains overlay image to max 70vh', async () => {
    vi.mocked(getAnalysis).mockResolvedValue({
      ...baseAnalysis,
      image_url: 'https://example.com/sonar.png',
      detections: [],
    })

    renderResultado()

    const img = await screen.findByAltText('Imagem de sonar analisada')
    expect(img).toHaveClass('max-h-[70vh]')
    expect(img).toHaveClass('object-contain')
  })
})
