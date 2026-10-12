import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { AnalysisResult } from '../../api/analyses'
import { ResultadoSidePanel } from './ResultadoSidePanel'

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
  detections: [
    { x1: 0, y1: 0, x2: 1, y2: 1, confidence: 0.85, label: 'MILCO' },
  ],
}

describe('ResultadoSidePanel', () => {
  it('defaults to Métricas tab and shows metrics content', () => {
    render(<ResultadoSidePanel analysis={baseAnalysis} />)

    expect(screen.getByRole('tab', { name: 'Métricas' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByTestId('metric-total')).toHaveTextContent('1')
    expect(
      screen.queryByText('Nenhuma explicação disponível.'),
    ).not.toBeInTheDocument()
  })

  it('switches to Explicação tab and shows empty state', () => {
    render(<ResultadoSidePanel analysis={baseAnalysis} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Explicação' }))

    expect(screen.getByRole('tab', { name: 'Explicação' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(
      screen.getByText('Nenhuma explicação disponível.'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('metric-total')).not.toBeInTheDocument()
  })

  it('switches back to Métricas tab', () => {
    render(<ResultadoSidePanel analysis={baseAnalysis} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Explicação' }))
    fireEvent.click(screen.getByRole('tab', { name: 'Métricas' }))

    expect(screen.getByRole('tab', { name: 'Métricas' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByTestId('metric-total')).toBeInTheDocument()
  })
})
