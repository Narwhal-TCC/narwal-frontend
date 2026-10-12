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

export function classifyDetection(detection: Detection): DetectionClass {
  return detection.label === 'MILCO' ? 'MILCO' : 'NOMBO'
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
