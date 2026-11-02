import { apiRequest } from './client'

export type AiStatus = 'ready' | 'unavailable'

export type AiReason =
  | 'disabled'
  | 'timeout'
  | 'provider_error'
  | 'rate_limited'
  | 'invalid_response'

export type LocationSource = 'entered' | 'simulated'

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

export interface CampaignRef {
  id: string
  name: string
}

export interface AnalysisLocation {
  lat: number
  lon: number
  source: LocationSource
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
  campaign_name?: string | null
  campaign?: CampaignRef | null
  location?: AnalysisLocation | null
  collected_at?: string | null
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
  campaign_name?: string | null
  campaign?: CampaignRef | null
  location?: AnalysisLocation | null
  collected_at?: string | null
  ai_analysis?: AiAnalysis | null
}

export interface AnalysisListResponse {
  items: AnalysisSummary[]
  limit: number
  offset: number
}

export interface ActiveCampaign {
  id: string | null
  name: string
}

export interface OrgStatsResponse {
  analyses_count: number
  milco_detections_count: number
  last_analysis: AnalysisSummary | null
  active_campaign: ActiveCampaign | null
}

export interface CreateAnalysisOptions {
  campaignId: string
  modelId?: string
  latitude?: number
  longitude?: number
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

export async function getOrgStats(): Promise<OrgStatsResponse> {
  return apiRequest<OrgStatsResponse>('/api/analyses/stats')
}

export async function createAnalysis(
  file: File,
  options: CreateAnalysisOptions,
): Promise<AnalysisResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('campaign_id', options.campaignId)
  if (options.modelId !== undefined) {
    formData.append('model_id', options.modelId)
  }
  if (options.latitude !== undefined) {
    formData.append('latitude', String(options.latitude))
  }
  if (options.longitude !== undefined) {
    formData.append('longitude', String(options.longitude))
  }
  return apiRequest<AnalysisResult>('/api/analyses', {
    method: 'POST',
    body: formData,
  })
}
