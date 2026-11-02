import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './client'
import {
  createCampaign,
  getCampaign,
  getCampaignPoints,
  listCampaigns,
  updateCampaign,
} from './campaigns'

const SAMPLE_CAMPAIGN = {
  id: 'camp-1',
  name: 'Campanha Simulada',
  area: {
    min_lat: 38.0,
    min_lon: -9.5,
    max_lat: 39.0,
    max_lon: -8.5,
  },
  simulated: true,
  analyses_count: 2,
  created_at: '2026-09-08T12:00:00Z',
}

describe('campaigns API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('listCampaigns calls GET /api/campaigns and parses the list', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify([SAMPLE_CAMPAIGN]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await listCampaigns()

    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('/api/campaigns')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('camp-1')
    expect(result[0].area.min_lat).toBe(38.0)
  })

  it('getCampaign calls GET /api/campaigns/{id}', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(SAMPLE_CAMPAIGN), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await getCampaign('camp-1')

    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('/api/campaigns/camp-1')
    expect(result.id).toBe('camp-1')
  })

  it('createCampaign POSTs JSON to /api/campaigns', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(SAMPLE_CAMPAIGN), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const body = {
      name: 'Nova',
      area: SAMPLE_CAMPAIGN.area,
      simulated: false,
    }
    await createCampaign(body)

    const [url, options] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('/api/campaigns')
    expect(options?.method).toBe('POST')
    expect(JSON.parse(options?.body as string)).toEqual(body)
  })

  it('updateCampaign PATCHes JSON to /api/campaigns/{id}', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ...SAMPLE_CAMPAIGN, name: 'Renomeada' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await updateCampaign('camp-1', { name: 'Renomeada' })

    const [url, options] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('/api/campaigns/camp-1')
    expect(options?.method).toBe('PATCH')
    expect(JSON.parse(options?.body as string)).toEqual({ name: 'Renomeada' })
  })

  it('updateCampaign throws ApiError with message from error body', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ code: 'VALIDATION_ERROR', message: 'Nome inválido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    await expect(updateCampaign('camp-1', { name: '' })).rejects.toMatchObject({
      message: 'Nome inválido.',
      status: 400,
    } satisfies Partial<ApiError>)
  })

  it('getCampaign throws ApiError with message from error body', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ code: 'CAMPAIGN_NOT_FOUND', message: 'Campanha ausente.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    await expect(getCampaign('missing')).rejects.toMatchObject({
      message: 'Campanha ausente.',
      status: 404,
    } satisfies Partial<ApiError>)
  })

  it('createCampaign throws ApiError with message from error body', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ code: 'DUPLICATE_NAME', message: 'Nome já existe.' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    await expect(
      createCampaign({
        name: 'Dup',
        area: SAMPLE_CAMPAIGN.area,
        simulated: true,
      }),
    ).rejects.toMatchObject({
      message: 'Nome já existe.',
      status: 409,
    } satisfies Partial<ApiError>)
  })

  it('getCampaignPoints calls GET /api/campaigns/{id}/points', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          campaign: SAMPLE_CAMPAIGN,
          points: [
            {
              analysis_id: 'an-1',
              lat: 38.5,
              lon: -9.0,
              location_source: 'simulated',
              primary_class: 'MILCO',
              primary_confidence: 0.9,
              milco_detection_count: 1,
              detection_count: 1,
              created_at: '2026-09-08T12:00:00Z',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const result = await getCampaignPoints('camp-1')

    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('/api/campaigns/camp-1/points')
    expect(result.campaign.id).toBe('camp-1')
    expect(result.points).toHaveLength(1)
    expect(result.points[0].analysis_id).toBe('an-1')
  })
})
