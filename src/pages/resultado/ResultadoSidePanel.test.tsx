import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AnalysisResult } from '../../api/analyses'
import { ResultadoSidePanel } from './ResultadoSidePanel'

vi.mock('../../models/useModels', () => ({
  useModels: vi.fn(),
}))

import { useModels } from '../../models/useModels'

const CATALOG_LABELS: Record<string, string> = {
  'yolo-convnext-balanced': 'YOLO + ConvNeXt (equilibrado)',
  'yolo-convnext-recall': 'YOLO + ConvNeXt (recall)',
  'two-stage-pt': 'RetinaNet + fusão (PyTorch)',
}

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
  beforeEach(() => {
    vi.mocked(useModels).mockReturnValue({
      models: [],
      defaultId: null,
      labelFor: (id) => (id ? (CATALOG_LABELS[id] ?? id) : ''),
      error: null,
      isLoading: false,
    })
  })

  it('shows catalog label for a known model_id', () => {
    render(
      <ResultadoSidePanel
        analysis={{ ...baseAnalysis, model_id: 'yolo-convnext-recall' }}
      />,
    )

    expect(screen.getByTestId('analysis-model-label')).toHaveTextContent(
      'YOLO + ConvNeXt (recall)',
    )
  })

  it('shows raw model_id when id is not in the catalog', () => {
    render(
      <ResultadoSidePanel
        analysis={{ ...baseAnalysis, model_id: 'legacy-unknown-id' }}
      />,
    )

    expect(screen.getByTestId('analysis-model-label')).toHaveTextContent(
      'legacy-unknown-id',
    )
  })

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
