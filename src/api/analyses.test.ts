import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAnalysis, getAnalysis, listAnalyses } from './analyses'

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

  it('createAnalysis posts multipart file payload', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'an-new',
          org_id: 'org-1',
          user_id: 'user-1',
          status: 'succeeded',
          detections: [],
          image_content_type: 'image/png',
          image_s3_key: 'analyses/org-1/an-new/original.png',
          image_url: null,
          created_at: '2026-09-08T12:00:00Z',
          inference_ms: 900,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const file = new File(['png'], 'scan.png', { type: 'image/png' })
    const result = await createAnalysis(file)

    expect(result.id).toBe('an-new')
    const [, options] = vi.mocked(fetch).mock.calls[0]
    expect(options?.method).toBe('POST')
    expect(options?.body).toBeInstanceOf(FormData)
    expect((options?.body as FormData).get('file')).toBe(file)
    expect((options?.body as FormData).get('model_id')).toBeNull()
    const headers = options?.headers as Headers
    expect(headers.get('Content-Type')).toBeNull()
  })

  it('createAnalysis appends model_id when modelId is provided', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
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
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const file = new File(['png'], 'scan.png', { type: 'image/png' })
    await createAnalysis(file, 'yolo-convnext-recall')

    const [, options] = vi.mocked(fetch).mock.calls[0]
    const formData = options?.body as FormData
    expect(formData.get('model_id')).toBe('yolo-convnext-recall')
  })

  it('createAnalysis omits model_id when modelId is undefined', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
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
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const file = new File(['png'], 'scan.png', { type: 'image/png' })
    await createAnalysis(file, undefined)

    const [, options] = vi.mocked(fetch).mock.calls[0]
    expect((options?.body as FormData).has('model_id')).toBe(false)
  })
})
