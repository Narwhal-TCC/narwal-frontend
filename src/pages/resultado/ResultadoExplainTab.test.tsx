import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { AiAnalysis } from '../../api/analyses'
import { ResultadoExplainTab } from './ResultadoExplainTab'

const readyFixture: AiAnalysis = {
  status: 'ready',
  reason: null,
  summary: 'Achado compatível com MILCO com confiança moderada.',
  detections: [
    { index: 0, note: 'Sombra acústica proeminente na região central.' },
    { index: 2, note: 'Segundo alvo com contorno menos definido.' },
  ],
  recommendation: 'Priorizar inspeção visual do alvo principal.',
  caveats: ['Qualidade da imagem reduzida nas bordas.'],
  model: 'openai/gpt-oss-120b',
  generated_at: '2026-03-15T14:30:00.000Z',
}

describe('ResultadoExplainTab', () => {
  it('renders ready analysis sections, detection labels, and disclaimer', () => {
    render(<ResultadoExplainTab aiAnalysis={readyFixture} />)

    expect(
      screen.getByRole('region', { name: /explicação/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('Resumo')).toBeInTheDocument()
    expect(
      screen.getByText('Achado compatível com MILCO com confiança moderada.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Detecções')).toBeInTheDocument()
    expect(screen.getByText('Detecção 1')).toBeInTheDocument()
    expect(screen.getByText('Detecção 3')).toBeInTheDocument()
    expect(screen.getByText('Recomendação')).toBeInTheDocument()
    expect(
      screen.getByText('Priorizar inspeção visual do alvo principal.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Limitações')).toBeInTheDocument()
    expect(
      screen.getByText('Qualidade da imagem reduzida nas bordas.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Gerado por IA — apoio à decisão, não substitui a avaliação do operador.',
      ),
    ).toBeInTheDocument()
  })

  it('shows class and confidence in detection headings when analysis detections are passed', () => {
    render(
      <ResultadoExplainTab
        aiAnalysis={readyFixture}
        detections={[
          {
            x1: 0,
            y1: 0,
            x2: 10,
            y2: 10,
            label: 'MILCO',
            confidence: 0.9,
          },
          {
            x1: 1,
            y1: 1,
            x2: 11,
            y2: 11,
            label: 'NOMBO',
            confidence: 0.5,
          },
          {
            x1: 2,
            y1: 2,
            x2: 12,
            y2: 12,
            label: 'MILCO',
            confidence: 0.7,
          },
        ]}
      />,
    )

    expect(
      screen.getByText('Detecção 1 · MILCO · 90,0% de confiança'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Detecção 3 · MILCO · 70,0% de confiança'),
    ).toBeInTheDocument()
  })

  it('humanizes zero-based detection references in summary text', () => {
    render(
      <ResultadoExplainTab
        aiAnalysis={{
          ...readyFixture,
          summary: 'Priorizando a detecção 0 com maior confiança.',
          detections: [],
        }}
        detections={[
          {
            x1: 0,
            y1: 0,
            x2: 10,
            y2: 10,
            label: 'MILCO',
            confidence: 0.9,
          },
        ]}
      />,
    )

    expect(
      screen.getByText('Priorizando a Detecção 1 com maior confiança.'),
    ).toBeInTheDocument()
  })

  it('shows unavailable message when status is unavailable', () => {
    render(
      <ResultadoExplainTab
        aiAnalysis={{
          ...readyFixture,
          status: 'unavailable',
          reason: 'timeout',
          summary: null,
        }}
      />,
    )

    expect(
      screen.getByText('Análise de IA indisponível para esta detecção.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Resumo')).not.toBeInTheDocument()
    expect(
      screen.queryByText(
        'Gerado por IA — apoio à decisão, não substitui a avaliação do operador.',
      ),
    ).not.toBeInTheDocument()
  })

  it('shows unavailable message when ai_analysis is missing', () => {
    render(<ResultadoExplainTab />)

    expect(
      screen.getByText('Análise de IA indisponível para esta detecção.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Resumo')).not.toBeInTheDocument()
  })

  it('hides Limitações when caveats is empty', () => {
    render(
      <ResultadoExplainTab
        aiAnalysis={{ ...readyFixture, caveats: [] }}
      />,
    )

    expect(screen.getByText('Resumo')).toBeInTheDocument()
    expect(screen.queryByText('Limitações')).not.toBeInTheDocument()
  })

  it('hides Detecções when detections is empty', () => {
    render(
      <ResultadoExplainTab
        aiAnalysis={{ ...readyFixture, detections: [] }}
      />,
    )

    expect(screen.getByText('Resumo')).toBeInTheDocument()
    expect(screen.queryByText('Detecções')).not.toBeInTheDocument()
    expect(screen.queryByText(/Detecção \d+/)).not.toBeInTheDocument()
  })

  it('renders LLM text as plain text without interpreting HTML', () => {
    render(
      <ResultadoExplainTab
        aiAnalysis={{
          ...readyFixture,
          detections: [{ index: 0, note: '<b>x</b>' }],
          caveats: [],
        }}
      />,
    )

    expect(screen.getByText('<b>x</b>')).toBeInTheDocument()
    expect(document.querySelector('b')).toBeNull()
  })
})
