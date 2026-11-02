import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createAnalysis,
  getAnalysis,
  getOrgStats,
  listAnalyses,
} from './analyses'

const ANALYSIS_RESULT_BODY = {
  id: 'an-new',
  org_id: 'org-1',
  user_id: 'user-1',
  status: 'succeeded',
  detections: [],
  image_content_type: 'image/png',
  image_s3_key: 'key',
  image_url: null,
  created_at: '2026-09-08T12:00:00Z',
  inference_ms: 900,
}

function mockCreateAnalysisResponse() {
  vi.mocked(fetch).mockResolvedValue(
    new Response(JSON.stringify(ANALYSIS_RESULT_BODY), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
}

function formDataFromLastFetch(): FormData {
  const [, options] = vi.mocked(fetch).mock.calls.at(-1)!
  return options?.body as FormData
}

describe('analyses API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('listAnalyses returns paginated summaries', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: 'an-1',
              org_id: 'org-1',
              user_id: 'user-1',
              status: 'succeeded',
              created_at: '2026-09-08T12:00:00Z',
              inference_ms: 1200,
              detection_count: 2,
            },
          ],
          limit: 50,
          offset: 0,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const result = await listAnalyses(50, 0)

    expect(result.items).toHaveLength(1)
    expect(result.items[0].id).toBe('an-1')
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('/api/analyses?limit=50&offset=0')
  })

  it('getAnalysis returns full analysis result', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'an-1',
          org_id: 'org-1',
          user_id: 'user-1',
          status: 'succeeded',
          detections: [],
          image_content_type: 'image/png',
          image_s3_key: 'analyses/org-1/an-1/original.png',
          image_url: null,
          created_at: '2026-09-08T12:00:00Z',
          inference_ms: 1200,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const result = await getAnalysis('an-1')

    expect(result.id).toBe('an-1')
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('/api/analyses/an-1')
  })

  it('createAnalysis posts multipart file payload with campaign_id', async () => {
    mockCreateAnalysisResponse()

    const file = new File(['png'], 'scan.png', { type: 'image/png' })
    const result = await createAnalysis(file, { campaignId: 'camp-1' })

    expect(result.id).toBe('an-new')
    const [, options] = vi.mocked(fetch).mock.calls[0]
    expect(options?.method).toBe('POST')
    expect(options?.body).toBeInstanceOf(FormData)
    const formData = options?.body as FormData
    expect(formData.get('file')).toBe(file)
    expect(formData.get('campaign_id')).toBe('camp-1')
    expect(formData.get('model_id')).toBeNull()
    const headers = options?.headers as Headers
    expect(headers.get('Content-Type')).toBeNull()
  })

  it('createAnalysis appends model_id when modelId is provided', async () => {
    mockCreateAnalysisResponse()

    const file = new File(['png'], 'scan.png', { type: 'image/png' })
    await createAnalysis(file, {
      campaignId: 'camp-1',
      modelId: 'yolo-convnext-recall',
    })

    expect(formDataFromLastFetch().get('model_id')).toBe('yolo-convnext-recall')
  })

  it('createAnalysis omits model_id when modelId is undefined', async () => {
    mockCreateAnalysisResponse()

    const file = new File(['png'], 'scan.png', { type: 'image/png' })
    await createAnalysis(file, { campaignId: 'camp-1' })

    expect(formDataFromLastFetch().has('model_id')).toBe(false)
  })

  it('createAnalysis omits latitude and longitude when not provided', async () => {
    mockCreateAnalysisResponse()

    const file = new File(['png'], 'scan.png', { type: 'image/png' })
    await createAnalysis(file, { campaignId: 'camp-1' })

    const formData = formDataFromLastFetch()
    expect(formData.has('latitude')).toBe(false)
    expect(formData.has('longitude')).toBe(false)
  })

  it('createAnalysis sends latitude and longitude when both are provided', async () => {
    mockCreateAnalysisResponse()

    const file = new File(['png'], 'scan.png', { type: 'image/png' })
    await createAnalysis(file, {
      campaignId: 'camp-1',
      latitude: 38.5,
      longitude: -9.1,
    })

    const formData = formDataFromLastFetch()
    expect(formData.get('latitude')).toBe('38.5')
    expect(formData.get('longitude')).toBe('-9.1')
  })

  it('createAnalysis never sends coordinates or campaign_name fields', async () => {
    mockCreateAnalysisResponse()

    const file = new File(['png'], 'scan.png', { type: 'image/png' })
    await createAnalysis(file, {
      campaignId: 'camp-1',
      latitude: 38.5,
      longitude: -9.1,
      modelId: 'yolo-convnext-recall',
    })

    const formData = formDataFromLastFetch()
    expect(formData.has('coordinates')).toBe(false)
    expect(formData.has('campaign_name')).toBe(false)
  })

  it('getOrgStats calls GET /api/analyses/stats and parses active_campaign', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          analyses_count: 3,
          milco_detections_count: 1,
          last_analysis: null,
          active_campaign: { id: 'camp-1', name: 'Campanha Simulada' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const stats = await getOrgStats()

    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('/api/analyses/stats')
    expect(stats.active_campaign?.id).toBe('camp-1')
    expect(stats.active_campaign?.name).toBe('Campanha Simulada')
  })
})
