import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { listModels } from './models'

const CATALOG_BODY = {
  models: [
    {
      id: 'yolo-convnext-balanced',
      label: 'YOLO + ConvNeXt (equilibrado)',
      description: '53 de 75 minas no teste, 11 falsos alarmes',
      is_default: true,
    },
    {
      id: 'yolo-convnext-recall',
      label: 'YOLO + ConvNeXt (recall)',
      description: '58 de 75 minas no teste, 25 falsos alarmes',
      is_default: false,
    },
    {
      id: 'two-stage-pt',
      label: 'RetinaNet + fusão (PyTorch)',
      description: '36 de 75 minas no teste, 7 falsos alarmes',
      is_default: false,
    },
  ],
}

describe('models API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('listModels parses catalog from GET /models', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(CATALOG_BODY), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const models = await listModels()

    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('/api/models')
    expect(models).toHaveLength(3)
    expect(models[0]).toEqual(CATALOG_BODY.models[0])
    expect(models[1].id).toBe('yolo-convnext-recall')
    expect(models[2].label).toBe('RetinaNet + fusão (PyTorch)')
  })
})
