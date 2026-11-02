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

vi.mock('../api/campaigns', () => ({
  listCampaigns: vi.fn(),
}))

vi.mock('../models/useModels', () => ({
  useModels: vi.fn(),
}))

import { createAnalysis } from '../api/analyses'
import { listCampaigns } from '../api/campaigns'
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
  {
    id: 'yolo-fusion-mobilevit',
    label: 'YOLO A + fusão ConvNeXt/MobileViTv2',
    description:
      'Mesmo detector da v3, com classificador ConvNeXt + MobileViTv2 nos recortes.',
    is_default: false,
  },
]

const SAMPLE_CAMPAIGN = {
  id: 'camp-1',
  name: 'Campanha Simulada - Costa da Prata',
  area: { min_lat: 38.5, min_lon: -10.2, max_lat: 39.1, max_lon: -9.4 },
  simulated: true,
  analyses_count: 2,
  created_at: '2026-01-01T00:00:00.000Z',
}

const OTHER_CAMPAIGN = {
  id: 'camp-2',
  name: 'Campanha B',
  area: { min_lat: 40, min_lon: -11, max_lat: 41, max_lon: -10 },
  simulated: false,
  analyses_count: 0,
  created_at: '2026-02-01T00:00:00.000Z',
}

function mockCatalogLoaded() {
  vi.mocked(useModels).mockReturnValue({
    models: CATALOG,
    defaultId: 'yolo-convnext-balanced',
    labelFor: (id) => CATALOG.find((m) => m.id === id)?.label ?? id ?? '',
    error: null,
    isLoading: false,
  })
}

function mockCampaignsLoaded(campaigns: typeof SAMPLE_CAMPAIGN[] = [SAMPLE_CAMPAIGN]) {
  vi.mocked(listCampaigns).mockResolvedValue(campaigns)
}

function NavigationStateCapture({
  onNavigationState,
}: {
  onNavigationState: (state: unknown) => void
}) {
  const location = useLocation()
  useEffect(() => {
    onNavigationState(location.state)
  }, [location.state, onNavigationState])
  return <div>Loading Page</div>
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
    vi.mocked(listCampaigns).mockReset()
    mockCatalogLoaded()
    mockCampaignsLoaded()
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

  it('lists campaigns from the API and preselects when exactly one exists', async () => {
    renderNova()

    await waitFor(() => {
      expect(listCampaigns).toHaveBeenCalled()
    })

    const select = screen.getByLabelText('Campanha') as HTMLSelectElement
    expect(select).toHaveValue('camp-1')
    expect(select).toHaveTextContent('Campanha Simulada - Costa da Prata')
  })

  it('does not preselect when multiple campaigns exist', async () => {
    mockCampaignsLoaded([SAMPLE_CAMPAIGN, OTHER_CAMPAIGN])
    renderNova()

    await waitFor(() => {
      expect(screen.getByLabelText('Campanha')).toBeInTheDocument()
    })

    const select = screen.getByLabelText('Campanha') as HTMLSelectElement
    expect(select).toHaveValue('')
  })

  it('disables submit and shows message when org has no campaigns', async () => {
    mockCampaignsLoaded([])
    renderNova()

    expect(await screen.findByText('Nenhuma campanha cadastrada')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar análise' })).toBeDisabled()
  })

  it('disables submit and shows error when campaign list fails', async () => {
    vi.mocked(listCampaigns).mockRejectedValue(
      new ApiError('UNKNOWN_ERROR', 'Falha ao carregar campanhas.', 500),
    )
    renderNova()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha ao carregar campanhas.',
    )
    expect(screen.getByRole('button', { name: 'Iniciar análise' })).toBeDisabled()
  })

  it('blocks submit when only latitude is filled', async () => {
    renderNova()
    await waitFor(() => {
      expect(screen.getByLabelText('Campanha')).toHaveValue('camp-1')
    })

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, {
      target: { files: [createFile('sonar.png', 'image/png', 1024)] },
    })

    fireEvent.change(screen.getByLabelText('Latitude'), { target: { value: '38.7' } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar análise' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Informe latitude e longitude juntas',
    )
    expect(screen.queryByText('Loading Page')).not.toBeInTheDocument()
  })

  it('blocks submit when coordinates are non-numeric', async () => {
    renderNova()
    await waitFor(() => {
      expect(screen.getByLabelText('Campanha')).toHaveValue('camp-1')
    })

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, {
      target: { files: [createFile('sonar.png', 'image/png', 1024)] },
    })

    fireEvent.change(screen.getByLabelText('Latitude'), { target: { value: 'abc' } })
    fireEvent.change(screen.getByLabelText('Longitude'), { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar análise' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Coordenadas inválidas')
  })

  it('navigates with campaign only when lat and lon are empty', async () => {
    let navigationState: unknown
    render(
      <MemoryRouter initialEntries={['/analises/nova']}>
        <Routes>
          <Route path="/analises/nova" element={<NovaAnalisePage />} />
          <Route
            path="/analises/loading"
            element={
              <NavigationStateCapture
                onNavigationState={(state) => {
                  navigationState = state
                }}
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Campanha')).toHaveValue('camp-1')
    })

    const file = createFile('sonar.png', 'image/png', 1024)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar análise' }))

    await waitFor(() => {
      expect(navigationState).toBeDefined()
    })

    const state = navigationState as {
      file?: File
      modelId?: string
      campaignId?: string
      latitude?: number
      longitude?: number
    }
    expect(state.file).toBe(file)
    expect(state.campaignId).toBe('camp-1')
    expect(state.modelId).toBe('yolo-convnext-balanced')
    expect(state.latitude).toBeUndefined()
    expect(state.longitude).toBeUndefined()
  })

  it('navigates with campaign and position when both lat and lon are filled', async () => {
    let navigationState: unknown
    render(
      <MemoryRouter initialEntries={['/analises/nova']}>
        <Routes>
          <Route path="/analises/nova" element={<NovaAnalisePage />} />
          <Route
            path="/analises/loading"
            element={
              <NavigationStateCapture
                onNavigationState={(state) => {
                  navigationState = state
                }}
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Campanha')).toHaveValue('camp-1')
    })

    const file = createFile('sonar.png', 'image/png', 1024)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.change(screen.getByLabelText('Latitude'), { target: { value: '38.76543' } })
    fireEvent.change(screen.getByLabelText('Longitude'), { target: { value: '-9.87654' } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar análise' }))

    await waitFor(() => {
      expect(navigationState).toBeDefined()
    })

    const state = navigationState as {
      campaignId?: string
      latitude?: number
      longitude?: number
    }
    expect(state.campaignId).toBe('camp-1')
    expect(state.latitude).toBe(38.76543)
    expect(state.longitude).toBe(-9.87654)
  })

  it('accepts a valid PNG and navigates to loading', async () => {
    renderNova()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await waitFor(() => {
      expect(screen.getByLabelText('Campanha')).toHaveValue('camp-1')
    })

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

  it('shows classifier-only summary without confusion matrix for mobilevit fusion', async () => {
    renderNova()

    const select = screen.getByLabelText('Modelo')
    await waitFor(() => {
      expect(select).toHaveValue('yolo-convnext-balanced')
    })

    fireEvent.change(select, { target: { value: 'yolo-fusion-mobilevit' } })

    expect(
      screen.getByText(
        'Classificador: 72 de 75 MILCO e 25 de 34 NOMBO corretos nos recortes de teste',
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Detalhe na avaliação de referência'),
    ).not.toBeInTheDocument()
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

    await waitFor(() => {
      expect(screen.getByLabelText('Campanha')).toHaveValue('camp-1')
    })

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar análise' }))

    await waitFor(() => {
      expect(createAnalysis).toHaveBeenCalledTimes(1)
    })

    const state = navigationState as {
      file?: File
      modelId?: string
      campaignId?: string
    }
    expect(state.file).toBe(file)
    expect(state.modelId).toBeUndefined()
    expect(state.campaignId).toBe('camp-1')
    expect(createAnalysis).toHaveBeenCalledWith(file, {
      campaignId: '',
      modelId: undefined,
    })
    expect(createAnalysis).not.toHaveBeenCalledWith(file, {
      campaignId: '',
      modelId: 'yolo-convnext-balanced',
    })
  })
})
