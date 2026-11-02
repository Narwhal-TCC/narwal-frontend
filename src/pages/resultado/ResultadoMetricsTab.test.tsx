import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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

function renderMetrics(analysis: AnalysisResult) {
  return render(
    <MemoryRouter>
      <ResultadoMetricsTab analysis={analysis} />
    </MemoryRouter>,
  )
}

describe('ResultadoMetricsTab', () => {
  it('shows total, MILCO, and NOMBO counts from detections', () => {
    renderMetrics({
      ...baseAnalysis,
      detections: [
        { x1: 0, y1: 0, x2: 1, y2: 1, confidence: 0.85, label: 'MILCO' },
        { x1: 1, y1: 1, x2: 2, y2: 2, confidence: 0.5, label: 'NOMBO' },
        { x1: 2, y1: 2, x2: 3, y2: 3, confidence: 0.9, label: 'MILCO' },
      ],
    })

    expect(screen.getByTestId('metric-total')).toHaveTextContent('3')
    expect(screen.getByTestId('metric-milco')).toHaveTextContent('2')
    expect(screen.getByTestId('metric-nombo')).toHaveTextContent('1')
  })

  it('does not show campaign row when no campaign is present', () => {
    renderMetrics(baseAnalysis)

    expect(screen.queryByText('Campanha')).not.toBeInTheDocument()
  })

  it('shows campaign name linked to the campaign map when location is present', () => {
    renderMetrics({
      ...baseAnalysis,
      campaign: { id: 'camp-1', name: 'Campanha Simulada - Costa da Prata' },
      location: { lat: 38.7654321, lon: -9.8765432, source: 'entered' },
    })

    const link = screen.getByRole('link', { name: 'Campanha Simulada - Costa da Prata' })
    expect(link).toHaveAttribute('href', '/campanhas/camp-1')
    expect(screen.getByText('38.76543, -9.87654')).toBeInTheDocument()
    expect(screen.queryByText('simulado')).not.toBeInTheDocument()
  })

  it('shows simulado tag when location source is simulated', () => {
    renderMetrics({
      ...baseAnalysis,
      campaign: { id: 'camp-1', name: 'Campanha Simulada' },
      location: { lat: 38.1, lon: -9.5, source: 'simulated' },
    })

    expect(screen.getByText('simulado')).toBeInTheDocument()
    expect(screen.getByText('38.10000, -9.50000')).toBeInTheDocument()
  })

  it('shows campaign name only when location is absent', () => {
    renderMetrics({
      ...baseAnalysis,
      campaign: { id: 'camp-1', name: 'Campanha Simulada' },
    })

    expect(screen.getByText('Campanha Simulada')).toBeInTheDocument()
    expect(screen.queryByText(/^\d+\.\d+,/)).not.toBeInTheDocument()
    expect(screen.queryByText('simulado')).not.toBeInTheDocument()
  })

  it('shows legacy campaign_name without link when campaign record is missing', () => {
    renderMetrics({ ...baseAnalysis, campaign_name: 'Campanha legado' })

    expect(screen.getByText('Campanha legado')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Campanha legado' })).not.toBeInTheDocument()
  })

  it('shows empty detections treatment with zero counts', () => {
    renderMetrics(baseAnalysis)

    expect(screen.getByTestId('metric-total')).toHaveTextContent('0')
    expect(screen.getByTestId('metric-milco')).toHaveTextContent('0')
    expect(screen.getByTestId('metric-nombo')).toHaveTextContent('0')
    expect(
      screen.getByText('Nenhuma detecção encontrada nesta imagem.'),
    ).toBeInTheDocument()
  })

  it('renders detection list with confidence and class badges', () => {
    renderMetrics({
      ...baseAnalysis,
      detections: [
        { x1: 0, y1: 0, x2: 1, y2: 1, confidence: 0.85, label: 'MILCO' },
        { x1: 1, y1: 1, x2: 2, y2: 2, confidence: 0.99, label: 'NOMBO' },
      ],
    })

    expect(screen.getByText('Detecções (2)')).toBeInTheDocument()
    expect(screen.getAllByText('MILCO').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('NOMBO').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/Confiança 85\.0%/)).toBeInTheDocument()
    expect(screen.getByText(/Confiança 99\.0%/)).toBeInTheDocument()

    expect(screen.getByTestId('detection-badge-milco')).toHaveClass(
      'text-[color:var(--navi-milco)]',
    )
    expect(screen.getByTestId('detection-badge-nombo')).toHaveClass(
      'text-[color:var(--navi-nombo)]',
    )
  })

  it('uses singular Detecção heading for one item and matches badge class', () => {
    renderMetrics({
      ...baseAnalysis,
      detections: [
        { x1: 0, y1: 0, x2: 1, y2: 1, confidence: 0.605, label: 'MILCO' },
      ],
    })

    expect(screen.getByText('Detecção (1)')).toBeInTheDocument()
    expect(screen.queryByText('Detecções (1)')).not.toBeInTheDocument()
    expect(screen.getByTestId('detection-badge-milco')).toBeInTheDocument()
    expect(screen.queryByTestId('detection-badge-nombo')).not.toBeInTheDocument()
    const listTitle = screen.getByText('MILCO', {
      selector: 'li p.text-sm',
    })
    expect(listTitle).toBeInTheDocument()
  })
})
