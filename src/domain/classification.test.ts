import { describe, expect, it } from 'vitest'
import {
  analysisHasClass,
  classifyDetection,
  countMilco,
  type Detection,
} from './classification'

function detection(label: Detection['label'], confidence: number): Detection {
  return { x1: 0, y1: 0, x2: 10, y2: 10, confidence, label }
}

describe('classifyDetection', () => {
  it('uses the API label, not confidence', () => {
    expect(classifyDetection(detection('NOMBO', 0.99))).toBe('NOMBO')
    expect(classifyDetection(detection('MILCO', 0.61))).toBe('MILCO')
  })
})

describe('analysisHasClass and countMilco', () => {
  it('returns false and zero for an empty detection list', () => {
    expect(analysisHasClass([], 'MILCO')).toBe(false)
    expect(countMilco([])).toBe(0)
  })

  it('counts MILCO from labels', () => {
    const detections = [
      detection('MILCO', 0.4),
      detection('NOMBO', 0.95),
      detection('MILCO', 0.99),
    ]
    expect(countMilco(detections)).toBe(2)
    expect(analysisHasClass(detections, 'NOMBO')).toBe(true)
    expect(analysisHasClass([detection('NOMBO', 0.99)], 'MILCO')).toBe(false)
  })
})

describe('detector_score optional field', () => {
  it('accepts detections that include detector_score', () => {
    const withScore: Detection = {
      x1: 0,
      y1: 0,
      x2: 10,
      y2: 10,
      confidence: 0.9,
      label: 'MILCO',
      detector_score: 0.85,
    }
    expect(withScore.detector_score).toBe(0.85)
    expect(classifyDetection(withScore)).toBe('MILCO')
  })
})
