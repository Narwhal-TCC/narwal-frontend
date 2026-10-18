import type { AnalysisResult } from '../api/analyses'

type CreateFn = (file: File, modelId?: string) => Promise<AnalysisResult>

let inFlightKey: string | null = null
let inFlight: Promise<AnalysisResult> | null = null

function fileKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`
}

function uploadKey(file: File, modelId?: string): string {
  return `${fileKey(file)}:${modelId ?? ''}`
}

/** Dedupes concurrent create calls for the same file (e.g. React Strict Mode). */
export function createAnalysisOnce(
  file: File,
  create: CreateFn,
  modelId?: string,
): Promise<AnalysisResult> {
  const key = uploadKey(file, modelId)
  if (inFlight && inFlightKey === key) {
    return inFlight
  }

  inFlightKey = key
  inFlight = create(file, modelId).finally(() => {
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
