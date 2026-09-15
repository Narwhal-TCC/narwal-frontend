import { apiRequest } from './client'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: 'bearer'
}

export interface MeResponse {
  user_id: string
  org_id: string
  role: 'member' | 'platform_admin'
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export async function me(): Promise<MeResponse> {
  return apiRequest<MeResponse>('/api/auth/me')
}
