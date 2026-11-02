import { classifyDetection, type Detection } from './classification'

/** Hex colours aligned with --navi-milco, --navi-nombo and muted grey for map markers. */
export const PRIMARY_CLASS_MARKER_COLORS = {
  MILCO: '#e8836a',
  NOMBO: '#6f9ceb',
  none: '#5a7ab0',
} as const

/** Map-only palette: MILCO stays salient; NOMBO is deliberately subdued on the chart. */
export const MAP_MARKER_COLORS = {
  MILCO: PRIMARY_CLASS_MARKER_COLORS.MILCO,
  NOMBO: PRIMARY_CLASS_MARKER_COLORS.NOMBO,
  none: PRIMARY_CLASS_MARKER_COLORS.none,
} as const

export type MapPrimaryClass = keyof typeof PRIMARY_CLASS_MARKER_COLORS

export function primaryClassMarkerColor(
  primaryClass: 'MILCO' | 'NOMBO' | null,
): string {
  if (primaryClass === 'MILCO') {
    return PRIMARY_CLASS_MARKER_COLORS.MILCO
  }
  if (primaryClass === 'NOMBO') {
    return PRIMARY_CLASS_MARKER_COLORS.NOMBO
  }
  return PRIMARY_CLASS_MARKER_COLORS.none
}

export function formatDetectionHeading(
  index: number,
  detection?: Detection | null,
): string {
  const number = index + 1
  if (!detection) {
    return `Detecção ${number}`
  }
  const label = classifyDetection(detection)
  const confidencePct = (detection.confidence * 100)
    .toFixed(1)
    .replace('.', ',')
  return `Detecção ${number} · ${label} · ${confidencePct}% de confiança`
}

/** Corrige textos de IA que usam índice 0-based ou campo interno detector_score. */
export function humanizeAiDetectionText(
  text: string,
  detectionCount: number,
): string {
  let out = text

  for (let i = detectionCount - 1; i >= 0; i--) {
    const human = String(i + 1)
    out = out.replace(
      new RegExp(`\\bdetec[cç][aã]o\\s*${i}(?!\\d)`, 'gi'),
      `Detecção ${human}`,
    )
    out = out.replace(
      new RegExp(`\\bpriorizando\\s+a\\s+detec[cç][aã]o\\s*${i}(?!\\d)`, 'gi'),
      `priorizando a Detecção ${human}`,
    )
  }

  out = out.replace(
    /\bdetector_score\b\s*(?:de|:)?\s*[\d.,]+/gi,
    'confiança da classificação',
  )
  out = out.replace(/\bdetector_score\b/gi, 'confiança da classificação')

  return out
}
