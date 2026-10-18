import { describe, expect, it } from 'vitest'
import {
  formatDetectionHeading,
  humanizeAiDetectionText,
} from './detectionDisplay'

describe('formatDetectionHeading', () => {
  it('includes class and confidence when detection is provided', () => {
    expect(
      formatDetectionHeading(0, {
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 1,
        label: 'MILCO',
        confidence: 0.852,
      }),
    ).toBe('Detecção 1 · MILCO · 85,2% de confiança')
  })
})

describe('humanizeAiDetectionText', () => {
  it('maps zero-based detection index to one-based label', () => {
    expect(
      humanizeAiDetectionText('Priorizando a detecção 0 na imagem.', 3),
    ).toBe('Priorizando a Detecção 1 na imagem.')
  })

  it('replaces internal detector_score wording', () => {
    expect(
      humanizeAiDetectionText('detector_score 0.91 indica alta certeza.', 1),
    ).toBe('confiança da classificação indica alta certeza.')
  })
})
