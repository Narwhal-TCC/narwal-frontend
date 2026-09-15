import { render, screen, waitFor } from '@testing-library/react'
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

  it('renders detections with confidence and class badges', async () => {
    vi.mocked(getAnalysis).mockResolvedValue({
      ...baseAnalysis,
      image_url: 'https://example.com/sonar.png',
      detections: [
        { x1: 0, y1: 0, x2: 10, y2: 10, confidence: 0.85, label: 'Alvo A' },
        { x1: 1, y1: 1, x2: 2, y2: 2, confidence: 0.5, label: 'Alvo B' },
      ],
    })

    renderResultado()

    expect(await screen.findByText('Alvo A')).toBeInTheDocument()
    expect(screen.getByText(/Confiança 85\.0%/)).toBeInTheDocument()
    expect(screen.getByText('Alvo B')).toBeInTheDocument()
    expect(screen.getAllByText('MILCO').length).toBeGreaterThan(0)
    expect(screen.getAllByText('NOMBO').length).toBeGreaterThan(0)
  })

  it('shows empty detections treatment', async () => {
    vi.mocked(getAnalysis).mockResolvedValue({
      ...baseAnalysis,
      image_url: 'https://example.com/sonar.png',
      detections: [],
    })

    renderResultado()

    expect(
      await screen.findByText('Nenhuma detecção encontrada nesta imagem.'),
    ).toBeInTheDocument()
  })

  it('shows placeholder when image_url is null', async () => {
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
    expect(screen.getByText('Alvo')).toBeInTheDocument()
  })
})
