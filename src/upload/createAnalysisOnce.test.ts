import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createAnalysisOnce,
  resetCreateAnalysisOnce,
} from './createAnalysisOnce'

describe('createAnalysisOnce', () => {
  beforeEach(() => {
    resetCreateAnalysisOnce()
  })

  it('reuses the same promise for concurrent calls with the same file', async () => {
    const file = new File([new Uint8Array([1])], 'a.png', { type: 'image/png' })
    const create = vi.fn().mockResolvedValue({ id: '1' })

    const p1 = createAnalysisOnce(file, create)
    const p2 = createAnalysisOnce(file, create)

    expect(p1).toBe(p2)
    await expect(p1).resolves.toEqual({ id: '1' })
    expect(create).toHaveBeenCalledTimes(1)
  })
})
