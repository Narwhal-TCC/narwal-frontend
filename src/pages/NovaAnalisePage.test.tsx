import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FILE_TOO_LARGE_MESSAGE, INVALID_TYPE_MESSAGE } from '../domain/uploadValidation'
import { NovaAnalisePage } from './NovaAnalisePage'

vi.mock('../api/analyses', () => ({
  createAnalysis: vi.fn(),
}))

import { createAnalysis } from '../api/analyses'

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
})
