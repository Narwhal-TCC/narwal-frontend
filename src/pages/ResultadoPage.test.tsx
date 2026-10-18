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
        { x1: 0, y1: 0, x2: 10, y2: 10, confidence: 0.85, label: 'MILCO' },
        { x1: 1, y1: 1, x2: 2, y2: 2, confidence: 0.99, label: 'NOMBO' },
      ],
    })

    renderResultado()

    expect(await screen.findByRole('tab', { name: 'Métricas' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getAllByText('MILCO').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Confiança 85\.0%/)).toBeInTheDocument()
    expect(screen.getAllByText('NOMBO').length).toBeGreaterThanOrEqual(1)
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
        { x1: 0, y1: 0, x2: 10, y2: 10, confidence: 0.9, label: 'MILCO' },
      ],
    })

    renderResultado()

    await waitFor(() => {
      expect(screen.getByTestId('detection-placeholder')).toHaveTextContent(
        'Imagem indisponível',
      )
    })
    expect(screen.getByRole('tab', { name: 'Métricas' })).toBeInTheDocument()
    expect(screen.getAllByText('MILCO').length).toBeGreaterThanOrEqual(1)
  })

  it('switches to Explicação tab with unavailable ai analysis', async () => {
    vi.mocked(getAnalysis).mockResolvedValue({
      ...baseAnalysis,
      image_url: 'https://example.com/sonar.png',
      detections: [],
    })

    renderResultado()

    fireEvent.click(await screen.findByRole('tab', { name: 'Explicação' }))

    expect(
      screen.getByText('Análise de IA indisponível para esta detecção.'),
    ).toBeInTheDocument()
  })

  it('shows MILCO/NOMBO legend under the sonar image', async () => {
    vi.mocked(getAnalysis).mockResolvedValue({
      ...baseAnalysis,
      image_url: 'https://example.com/sonar.png',
      detections: [],
    })

    renderResultado()

    const legend = await screen.findByTestId('detection-class-legend')
    expect(legend).toHaveTextContent(/Mine-Like Contacts/)
    expect(legend).toHaveTextContent(/Non-Mine-like Bottom Objects/)
    expect(legend).toHaveTextContent(/objetos com aparência de mina/)
  })

  it('highlights overlay box when hovering a detection row', async () => {
    vi.mocked(getAnalysis).mockResolvedValue({
      ...baseAnalysis,
      image_url: 'https://example.com/sonar.png',
      detections: [
        { x1: 0, y1: 0, x2: 10, y2: 10, confidence: 0.85, label: 'MILCO' },
        { x1: 20, y1: 20, x2: 30, y2: 30, confidence: 0.5, label: 'NOMBO' },
      ],
    })

    renderResultado()

    const img = await screen.findByAltText('Imagem de sonar analisada')
    Object.defineProperty(img, 'naturalWidth', { configurable: true, value: 400 })
    Object.defineProperty(img, 'naturalHeight', { configurable: true, value: 200 })
    Object.defineProperty(img, 'clientWidth', { configurable: true, value: 400 })
    Object.defineProperty(img, 'clientHeight', { configurable: true, value: 200 })
    fireEvent.load(img)

    await screen.findByTestId('detection-row-1')
    const boxes = screen.getAllByTestId('detection-box')
    expect(boxes[1]).toHaveAttribute('data-highlighted', 'false')

    fireEvent.mouseEnter(screen.getByTestId('detection-row-1'))
    expect(boxes[1]).toHaveAttribute('data-highlighted', 'true')

    fireEvent.mouseLeave(screen.getByTestId('detection-row-1'))
    expect(boxes[1]).toHaveAttribute('data-highlighted', 'false')
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

  it('hydrates image_url via GET when navigation state omitted it', async () => {
    vi.mocked(getAnalysis).mockResolvedValue({
      ...baseAnalysis,
      image_url: 'https://example.com/presigned.png',
      detections: [],
    })

    renderResultado(undefined, {
      analysis: {
        ...baseAnalysis,
        image_url: null,
        detections: [],
      },
    })

    const img = await screen.findByAltText('Imagem de sonar analisada')
    expect(img).toHaveAttribute('src', 'https://example.com/presigned.png')
    expect(getAnalysis).toHaveBeenCalledWith(baseAnalysis.id)
  })
})
