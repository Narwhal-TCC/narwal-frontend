import { apiRequest } from './client'

export type AiStatus = 'ready' | 'unavailable'

export type AiReason =
  | 'disabled'
  | 'timeout'
  | 'provider_error'
  | 'rate_limited'
  | 'invalid_response'

export interface AiDetectionNote {
  index: number
  note: string
}

export interface AiAnalysis {
  status: AiStatus
  reason: AiReason | null
  summary: string | null
  detections: AiDetectionNote[]
  recommendation: string | null
  caveats: string[]
  model: string | null
  generated_at: string | null
}

export interface Detection {
  x1: number
  y1: number
  x2: number
  y2: number
  confidence: number
  label: string
  detector_score?: number
}

export interface AnalysisSummary {
  id: string
  org_id: string
  user_id: string
  status: string
  created_at: string
  inference_ms: number | null
  detection_count: number
  model_id?: string
}

export interface AnalysisResult {
  id: string
  org_id: string
  user_id: string
  status: 'succeeded'
  detections: Detection[]
  image_content_type: string
  image_s3_key: string
  image_url: string | null
  created_at: string
  inference_ms: number | null
  model_id?: string
  ai_analysis?: AiAnalysis | null
}

export interface AnalysisListResponse {
  items: AnalysisSummary[]
  limit: number
  offset: number
}

export async function listAnalyses(
  limit = 50,
  offset = 0,
): Promise<AnalysisListResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  })
  return apiRequest<AnalysisListResponse>(`/api/analyses?${params.toString()}`)
}

export async function getAnalysis(id: string): Promise<AnalysisResult> {
  return apiRequest<AnalysisResult>(`/api/analyses/${id}`)
}

export async function createAnalysis(
  file: File,
  modelId?: string,
): Promise<AnalysisResult> {
  const formData = new FormData()
  formData.append('file', file)
  if (modelId !== undefined) {
    formData.append('model_id', modelId)
  }
  return apiRequest<AnalysisResult>('/api/analyses', {
    method: 'POST',
    body: formData,
  })
}
