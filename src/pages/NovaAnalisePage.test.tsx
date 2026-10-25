import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useEffect } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/client'
import { FILE_TOO_LARGE_MESSAGE, INVALID_TYPE_MESSAGE } from '../domain/uploadValidation'
import { resetCreateAnalysisOnce } from '../upload/createAnalysisOnce'
import { LoadingPage } from './LoadingPage'
import { NovaAnalisePage } from './NovaAnalisePage'

vi.mock('../api/analyses', () => ({
  createAnalysis: vi.fn(),
}))

vi.mock('../models/useModels', () => ({
  useModels: vi.fn(),
}))

import { createAnalysis } from '../api/analyses'
import { useModels } from '../models/useModels'

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
  {
    id: 'yolo-fusion-v3',
    label: 'YOLO A + fusão ConvNeXt/EdgeNeXt (v3)',
    description:
      'Variação mais nova do detector: localiza mais minas que o legado, com mais falsos alarmes que o equilibrado.',
    is_default: false,
  },
]

function mockCatalogLoaded() {
  vi.mocked(useModels).mockReturnValue({
    models: CATALOG,
    defaultId: 'yolo-convnext-balanced',
    labelFor: (id) => CATALOG.find((m) => m.id === id)?.label ?? id ?? '',
    error: null,
    isLoading: false,
  })
}

function LoadingWithNavigationCapture({
  onNavigationState,
}: {
  onNavigationState: (state: unknown) => void
}) {
  const location = useLocation()
  useEffect(() => {
    onNavigationState(location.state)
  }, [location.state, onNavigationState])
  return <LoadingPage />
}

function renderNova(initialPath = '/analises/nova') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/analises/nova" element={<NovaAnalisePage />} />
        <Route path="/analises/loading" element={<div>Loading Page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

function createFile(name: string, type: string, sizeBytes: number): File {
  const content = new Uint8Array(sizeBytes)
  return new File([content], name, { type })
}

describe('NovaAnalisePage', () => {
  beforeEach(() => {
    vi.mocked(createAnalysis).mockReset()
    mockCatalogLoaded()
  })

  it('rejects a non-image file type', async () => {
    renderNova()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(input, {
      target: { files: [createFile('notes.txt', 'text/plain', 1024)] },
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(INVALID_TYPE_MESSAGE)
    expect(createAnalysis).not.toHaveBeenCalled()
  })

  it('rejects a file larger than 10 MB', async () => {
    renderNova()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(input, {
      target: {
        files: [createFile('large.png', 'image/png', 10 * 1024 * 1024 + 1)],
      },
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(FILE_TOO_LARGE_MESSAGE)
    expect(createAnalysis).not.toHaveBeenCalled()
  })

  it('renders editable collection metadata fields', () => {
    renderNova()

    fireEvent.click(screen.getByText('Informações adicionais'))

    const coordinates = screen.getByLabelText('Coordenadas')
    const collectedAt = screen.getByLabelText('Data e hora da coleta')
    const campaign = screen.getByLabelText('Campanha')

    expect(coordinates).toHaveValue('')
    expect(collectedAt).toHaveAttribute('type', 'datetime-local')
    expect(collectedAt).toHaveValue('')
    expect(campaign).toHaveValue('')

    fireEvent.change(coordinates, { target: { value: "24°00'S 44°00'W" } })
    fireEvent.change(campaign, { target: { value: 'Campanha teste' } })

    expect(coordinates).toHaveValue("24°00'S 44°00'W")
    expect(campaign).toHaveValue('Campanha teste')
  })

  it('accepts a valid PNG and navigates to loading', async () => {
    renderNova()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(input, {
      target: { files: [createFile('sonar.png', 'image/png', 1024)] },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar análise' }))

    await waitFor(() => {
      expect(screen.getByText('Loading Page')).toBeInTheDocument()
    })
  })

  it('preselects the default model and shows its description', async () => {
    renderNova()

    const select = screen.getByLabelText('Modelo') as HTMLSelectElement
    await waitFor(() => {
      expect(select.value).toBe('yolo-convnext-balanced')
    })
    expect(
      screen.getByText('53 de 75 minas localizadas · 11 falsos alarmes'),
    ).toBeInTheDocument()
    expect(screen.getByText('Detalhe na avaliação de referência')).toBeInTheDocument()
    expect(select).toHaveTextContent('YOLO + ConvNeXt (equilibrado)')
  })

  it('updates description when another model is selected', async () => {
    renderNova()

    const select = screen.getByLabelText('Modelo')
    await waitFor(() => {
      expect(select).toHaveValue('yolo-convnext-balanced')
    })

    fireEvent.change(select, { target: { value: 'yolo-convnext-recall' } })

    expect(
      screen.getByText('58 de 75 minas localizadas · 25 falsos alarmes'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('53 de 75 minas localizadas · 11 falsos alarmes'),
    ).not.toBeInTheDocument()
  })

  it('shows fusion v3 benchmark and confusion matrix when selected', async () => {
    renderNova()

    const select = screen.getByLabelText('Modelo')
    await waitFor(() => {
      expect(select).toHaveValue('yolo-convnext-balanced')
    })

    fireEvent.change(select, { target: { value: 'yolo-fusion-v3' } })

    expect(
      screen.getByText('50 de 75 minas localizadas · 21 falsos alarmes'),
    ).toBeInTheDocument()
    expect(screen.getByText('Detalhe na avaliação de referência')).toBeInTheDocument()
  })

  it('disables the select with Modelo padrão when catalog fails', async () => {
    vi.mocked(useModels).mockReturnValue({
      models: [],
      defaultId: null,
      labelFor: (id) => id ?? '',
      error: new ApiError('UNAUTHORIZED', 'Sessão expirada.', 401),
      isLoading: false,
    })

    renderNova()

    const select = screen.getByLabelText('Modelo') as HTMLSelectElement
    expect(select).toBeDisabled()
    expect(select).toHaveDisplayValue('Modelo padrão')
  })

  it('omits modelId from loading navigation when catalog fails on submit', async () => {
    vi.mocked(useModels).mockReturnValue({
      models: [],
      defaultId: null,
      labelFor: (id) => id ?? '',
      error: new ApiError('UNKNOWN_ERROR', 'Falha ao carregar modelos.', 500),
      isLoading: false,
    })

    const file = createFile('sonar.png', 'image/png', 1024)
    vi.mocked(createAnalysis).mockResolvedValue({
      id: 'analysis-no-model',
      org_id: 'org',
      user_id: 'user',
      status: 'succeeded',
      detections: [],
      image_content_type: 'image/png',
      image_s3_key: 'key',
      image_url: null,
      created_at: new Date().toISOString(),
      inference_ms: 100,
    })

    resetCreateAnalysisOnce()
    let navigationState: unknown

    render(
      <MemoryRouter initialEntries={['/analises/nova']}>
        <Routes>
          <Route path="/analises/nova" element={<NovaAnalisePage />} />
          <Route
            path="/analises/loading"
            element={
              <LoadingWithNavigationCapture
                onNavigationState={(state) => {
                  navigationState = state
                }}
              />
            }
          />
          <Route path="/analises/:id" element={<div>Result Page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar análise' }))

    await waitFor(() => {
      expect(createAnalysis).toHaveBeenCalledTimes(1)
    })

    const state = navigationState as { file?: File; modelId?: string }
    expect(state.file).toBe(file)
    expect(state.modelId).toBeUndefined()
    expect(createAnalysis).toHaveBeenCalledWith(file, undefined)
    expect(createAnalysis).not.toHaveBeenCalledWith(
      file,
      'yolo-convnext-balanced',
    )
  })
})
