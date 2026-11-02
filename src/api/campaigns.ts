import { apiRequest } from './client'

export type LocationSource = 'entered' | 'simulated'

export type PrimaryClass = 'MILCO' | 'NOMBO'

export interface CampaignArea {
  min_lat: number
  min_lon: number
  max_lat: number
  max_lon: number
}

export interface Campaign {
  id: string
  name: string
  area: CampaignArea
  simulated: boolean
  analyses_count: number
  created_at: string
}

export interface CampaignPoint {
  analysis_id: string
  lat: number
  lon: number
  location_source: LocationSource
  primary_class: PrimaryClass | null
  milco_detection_count: number
  detection_count: number
  created_at: string
}

export interface CampaignPointsResponse {
  campaign: Campaign
  points: CampaignPoint[]
}

export async function listCampaigns(): Promise<Campaign[]> {
  return apiRequest<Campaign[]>('/api/campaigns')
}

export async function getCampaignPoints(
  campaignId: string,
): Promise<CampaignPointsResponse> {
  return apiRequest<CampaignPointsResponse>(
    `/api/campaigns/${campaignId}/points`,
  )
}
