import { describe, expect, it } from 'vitest'
import {
  analysisHasClass,
  classifyDetection,
  countMilco,
  type Detection,
} from './classification'

function detection(confidence: number): Detection {
  return { x1: 0, y1: 0, x2: 10, y2: 10, confidence, label: 'obj' }
}

describe('classifyDetection', () => {
  it('labels confidence 0.79 as NOMBO', () => {
    expect(classifyDetection(detection(0.79))).toBe('NOMBO')
  })

  it('labels confidence 0.80 as MILCO', () => {
    expect(classifyDetection(detection(0.8))).toBe('MILCO')
  })

  it('labels confidence 0.81 as MILCO', () => {
    expect(classifyDetection(detection(0.81))).toBe('MILCO')
  })
})

describe('analysisHasClass and countMilco', () => {
  it('returns false and zero for an empty detection list', () => {
    expect(analysisHasClass([], 'MILCO')).toBe(false)
    expect(countMilco([])).toBe(0)
  })
})
