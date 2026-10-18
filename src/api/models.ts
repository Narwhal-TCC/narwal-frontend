import { apiRequest } from './client'

export interface ModelCatalogItem {
  id: string
  label: string
  description: string
  is_default: boolean
}

interface ModelsListResponse {
  models: ModelCatalogItem[]
}

export async function listModels(): Promise<ModelCatalogItem[]> {
  const body = await apiRequest<ModelsListResponse>('/api/models')
  return body.models
}
