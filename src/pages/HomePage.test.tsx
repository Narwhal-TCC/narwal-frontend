import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HomePage } from './HomePage'

vi.mock('../api/analyses', () => ({
  listAnalyses: vi.fn(),
  getAnalysis: vi.fn(),
}))

import { getAnalysis, listAnalyses } from '../api/analyses'

function renderHome(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analises/nova" element={<div>Nova Análise Page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(listAnalyses).mockReset()
    vi.mocked(getAnalysis).mockReset()
  })

  it('shows zero KPIs when the org has no analyses', async () => {
    vi.mocked(listAnalyses).mockResolvedValue({ items: [], limit: 50, offset: 0 })

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('Análises realizadas').closest('div')).toHaveTextContent('0')
    })
    expect(screen.getByText('Detecções MILCO').closest('div')).toHaveTextContent('0')
    expect(screen.getByText('Última análise').closest('div')).toHaveTextContent('Nenhuma')
    expect(screen.getByText('Santos 2026')).toBeInTheDocument()
  })

  it('shows populated counts and survives a single enrich failure', async () => {
    const now = new Date(Date.now() - 30_000).toISOString()
    vi.mocked(listAnalyses).mockResolvedValue({
      items: [
        {
          id: 'an-1',
          org_id: 'org-1',
          user_id: 'user-1',
          status: 'succeeded',
          created_at: now,
          inference_ms: 1000,
          detection_count: 2,
        },
        {
          id: 'an-2',
          org_id: 'org-1',
          user_id: 'user-1',
          status: 'succeeded',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          inference_ms: 900,
          detection_count: 1,
        },
      ],
      limit: 50,
      offset: 0,
    })
    vi.mocked(getAnalysis).mockImplementation(async (id: string) => {
      if (id === 'an-2') {
        throw new Error('network')
      }
      return {
        id: 'an-1',
        org_id: 'org-1',
        user_id: 'user-1',
        status: 'succeeded',
        detections: [
          { x1: 0, y1: 0, x2: 1, y2: 1, confidence: 0.9, label: 'MILCO' },
          { x1: 1, y1: 1, x2: 2, y2: 2, confidence: 0.5, label: 'NOMBO' },
        ],
        image_content_type: 'image/png',
        image_s3_key: 'key',
        image_url: null,
        created_at: now,
        inference_ms: 1000,
      }
    })

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('Análises realizadas').closest('div')).toHaveTextContent('2')
    })
    expect(screen.getByText('Detecções MILCO').closest('div')).toHaveTextContent('1')
    expect(screen.getByText('Última análise').closest('div')).toHaveTextContent('agora')
    expect(screen.getByText('Campanha ativa').closest('div')).toHaveTextContent('Santos 2026')
  })

  it('navigates to nova análise when CTA is clicked', async () => {
    vi.mocked(listAnalyses).mockResolvedValue({ items: [], limit: 50, offset: 0 })

    renderHome()

    fireEvent.click(await screen.findByRole('link', { name: /Nova análise/i }))

    expect(await screen.findByText('Nova Análise Page')).toBeInTheDocument()
  })
})
