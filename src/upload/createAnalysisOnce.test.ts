import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createAnalysisOnce,
  resetCreateAnalysisOnce,
} from './createAnalysisOnce'

describe('createAnalysisOnce', () => {
  beforeEach(() => {
    resetCreateAnalysisOnce()
  })

  it('reuses the same promise for concurrent calls with the same file and options', async () => {
    const file = new File([new Uint8Array([1])], 'a.png', { type: 'image/png' })
    const create = vi.fn().mockResolvedValue({ id: '1' })
    const options = { campaignId: 'camp-1' }

    const p1 = createAnalysisOnce(file, create, options)
    const p2 = createAnalysisOnce(file, create, options)

    expect(p1).toBe(p2)
    await expect(p1).resolves.toEqual({ id: '1' })
    expect(create).toHaveBeenCalledTimes(1)
    expect(create).toHaveBeenCalledWith(file, options)
  })

  it('starts a new upload when the same file uses a different modelId', async () => {
    const file = new File([new Uint8Array([1])], 'a.png', { type: 'image/png' })
    const create = vi
      .fn()
      .mockResolvedValueOnce({ id: 'balanced' })
      .mockResolvedValueOnce({ id: 'recall' })

    await createAnalysisOnce(file, create, {
      campaignId: 'camp-1',
      modelId: 'yolo-convnext-balanced',
    })
    await createAnalysisOnce(file, create, {
      campaignId: 'camp-1',
      modelId: 'yolo-convnext-recall',
    })

    expect(create).toHaveBeenCalledTimes(2)
    expect(create).toHaveBeenNthCalledWith(1, file, {
      campaignId: 'camp-1',
      modelId: 'yolo-convnext-balanced',
    })
    expect(create).toHaveBeenNthCalledWith(2, file, {
      campaignId: 'camp-1',
      modelId: 'yolo-convnext-recall',
    })
  })

  it('does not dedupe the same file uploaded to different campaigns', async () => {
    const file = new File([new Uint8Array([1])], 'a.png', { type: 'image/png' })
    const create = vi
      .fn()
      .mockResolvedValueOnce({ id: 'camp-a' })
      .mockResolvedValueOnce({ id: 'camp-b' })

    await createAnalysisOnce(file, create, { campaignId: 'camp-a' })
    await createAnalysisOnce(file, create, { campaignId: 'camp-b' })

    expect(create).toHaveBeenCalledTimes(2)
  })
})
