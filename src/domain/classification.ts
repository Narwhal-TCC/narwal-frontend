export interface Detection {
  x1: number
  y1: number
  x2: number
  y2: number
  confidence: number
  label: string
  detector_score?: number
}

export type DetectionClass = 'MILCO' | 'NOMBO'

const MILCO_THRESHOLD = 0.8

export function classifyDetection(detection: Detection): DetectionClass {
  return detection.confidence >= MILCO_THRESHOLD ? 'MILCO' : 'NOMBO'
}

export function countMilco(detections: Detection[]): number {
  return detections.filter((d) => classifyDetection(d) === 'MILCO').length
}

export function analysisHasClass(
  detections: Detection[],
  targetClass: DetectionClass,
): boolean {
  return detections.some((d) => classifyDetection(d) === targetClass)
}
