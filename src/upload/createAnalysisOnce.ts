import type { AnalysisResult, CreateAnalysisOptions } from '../api/analyses'

type CreateFn = (
  file: File,
  options: CreateAnalysisOptions,
) => Promise<AnalysisResult>

let inFlightKey: string | null = null
let inFlight: Promise<AnalysisResult> | null = null

function fileKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`
}

function uploadKey(file: File, options: CreateAnalysisOptions): string {
  const lat = options.latitude ?? ''
  const lon = options.longitude ?? ''
  return `${fileKey(file)}:${options.modelId ?? ''}:${options.campaignId}:${lat}:${lon}`
}

/** Dedupes concurrent create calls for the same file (e.g. React Strict Mode). */
export function createAnalysisOnce(
  file: File,
  create: CreateFn,
  options: CreateAnalysisOptions,
): Promise<AnalysisResult> {
  const key = uploadKey(file, options)
  if (inFlight && inFlightKey === key) {
    return inFlight
  }

  inFlightKey = key
  inFlight = create(file, options).finally(() => {
    if (inFlightKey === key) {
      inFlight = null
      inFlightKey = null
    }
  })
  return inFlight
}

/** Test helper — resets in-flight state between cases. */
export function resetCreateAnalysisOnce(): void {
  inFlight = null
  inFlightKey = null
}
