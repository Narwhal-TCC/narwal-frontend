import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { AnalysisResult } from '../../api/analyses'
import { ResultadoMetricsTab } from './ResultadoMetricsTab'

const baseAnalysis: AnalysisResult = {
  id: '01234567-89ab-cdef-0123-456789abcdef',
  org_id: 'org',
  user_id: 'user',
  status: 'succeeded',
  image_content_type: 'image/png',
  image_s3_key: 'key',
  image_url: null,
  created_at: '2026-03-15T14:30:00.000Z',
  inference_ms: 120,
  detections: [],
}

describe('ResultadoMetricsTab', () => {
  it('shows total, MILCO, and NOMBO counts from detections', () => {
    render(
      <ResultadoMetricsTab
        analysis={{
          ...baseAnalysis,
          detections: [
            { x1: 0, y1: 0, x2: 1, y2: 1, confidence: 0.85, label: 'Alvo A' },
            { x1: 1, y1: 1, x2: 2, y2: 2, confidence: 0.5, label: 'Alvo B' },
            { x1: 2, y1: 2, x2: 3, y2: 3, confidence: 0.9, label: 'Alvo C' },
          ],
        }}
      />,
    )

    expect(screen.getByTestId('metric-total')).toHaveTextContent('3')
    expect(screen.getByTestId('metric-milco')).toHaveTextContent('2')
    expect(screen.getByTestId('metric-nombo')).toHaveTextContent('1')
  })

  it('shows empty detections treatment with zero counts', () => {
    render(<ResultadoMetricsTab analysis={baseAnalysis} />)

    expect(screen.getByTestId('metric-total')).toHaveTextContent('0')
    expect(screen.getByTestId('metric-milco')).toHaveTextContent('0')
    expect(screen.getByTestId('metric-nombo')).toHaveTextContent('0')
    expect(
      screen.getByText('Nenhuma detecção encontrada nesta imagem.'),
    ).toBeInTheDocument()
  })

  it('renders detection list with confidence and class badges', () => {
    render(
      <ResultadoMetricsTab
        analysis={{
          ...baseAnalysis,
          detections: [
            { x1: 0, y1: 0, x2: 1, y2: 1, confidence: 0.85, label: 'Alvo A' },
            { x1: 1, y1: 1, x2: 2, y2: 2, confidence: 0.5, label: 'Alvo B' },
          ],
        }}
      />,
    )

    expect(screen.getByText('Detecções (2)')).toBeInTheDocument()
    // Title and badge both use AD-003 heuristic, not API label
    // (plus Resumo metric card labels → ≥2 each).
    expect(screen.getAllByText('MILCO').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('NOMBO').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/Confiança 85\.0%/)).toBeInTheDocument()
    expect(screen.getByText(/Confiança 50\.0%/)).toBeInTheDocument()

    expect(screen.getByTestId('detection-badge-milco')).toHaveClass(
      'text-[color:var(--navi-milco)]',
    )
    expect(screen.getByTestId('detection-badge-nombo')).toHaveClass(
      'text-[color:var(--navi-nombo)]',
    )
  })

  it('uses singular Detecção heading for one item and matches badge class', () => {
    render(
      <ResultadoMetricsTab
        analysis={{
          ...baseAnalysis,
          detections: [
            { x1: 0, y1: 0, x2: 1, y2: 1, confidence: 0.605, label: 'MILCO' },
          ],
        }}
      />,
    )

    expect(screen.getByText('Detecção (1)')).toBeInTheDocument()
    expect(screen.queryByText('Detecções (1)')).not.toBeInTheDocument()
    // API label MILCO but confidence < 0.80 → list title + badge are NOMBO
    expect(screen.getByTestId('detection-badge-nombo')).toBeInTheDocument()
    expect(screen.queryByTestId('detection-badge-milco')).not.toBeInTheDocument()
    const listTitle = screen.getByText('NOMBO', {
      selector: 'li p.text-sm',
    })
    expect(listTitle).toBeInTheDocument()
  })
})
