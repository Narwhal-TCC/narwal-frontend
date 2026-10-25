import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/client'
import { useModels } from './useModels'

vi.mock('../api/models', () => ({
  listModels: vi.fn(),
}))

import { listModels } from '../api/models'

const CATALOG = [
  {
    id: 'yolo-convnext-balanced',
    label: 'YOLO + ConvNeXt (equilibrado)',
    description:
      'Recomendado no dia a dia: equilibra achar minas e limitar falsos alarmes.',
    is_default: true,
  },
  {
    id: 'yolo-convnext-recall',
    label: 'YOLO + ConvNeXt (recall)',
    description:
      'Prioriza não deixar minas passarem; tende a gerar mais pontos para revisar.',
    is_default: false,
  },
  {
    id: 'two-stage-pt',
    label: 'RetinaNet + fusão (PyTorch)',
    description:
      'Versão anterior: menos falsos alarmes, porém localiza menos minas. Indicado para comparar com análises antigas.',
    is_default: false,
  },
]

describe('useModels', () => {
  beforeEach(() => {
    vi.mocked(listModels).mockReset()
  })

  it('exposes catalog, defaultId, and labelFor for known ids', async () => {
    vi.mocked(listModels).mockResolvedValue(CATALOG)

    const { result } = renderHook(() => useModels())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.models).toEqual(CATALOG)
    expect(result.current.defaultId).toBe('yolo-convnext-balanced')
    expect(result.current.labelFor('yolo-convnext-recall')).toBe(
      'YOLO + ConvNeXt (recall)',
    )
    expect(result.current.error).toBeNull()
  })

  it('labelFor returns raw id when id is not in the catalog', async () => {
    vi.mocked(listModels).mockResolvedValue(CATALOG)

    const { result } = renderHook(() => useModels())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.labelFor('removed-model-id')).toBe('removed-model-id')
  })

  it('labelFor returns raw id when catalog failed to load', async () => {
    vi.mocked(listModels).mockRejectedValue(
      new ApiError('UNAUTHORIZED', 'Sessão expirada.', 401),
    )

    const { result } = renderHook(() => useModels())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.models).toEqual([])
    expect(result.current.error?.code).toBe('UNAUTHORIZED')
    expect(result.current.labelFor('yolo-convnext-balanced')).toBe(
      'yolo-convnext-balanced',
    )
  })
})
