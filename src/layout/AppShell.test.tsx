import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppShell } from './AppShell'

vi.mock('./Sidebar', () => ({
  Sidebar: () => <aside data-testid="sidebar-mock" />,
}))

function renderAppShell() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<div>Page content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AppShell', () => {
  it('renders wave footer at full SVG height without wrapper opacity fade', () => {
    renderAppShell()

    const waveWrapper = screen.getByRole('main').querySelector('[aria-hidden="true"]')
    expect(waveWrapper).not.toBeNull()
    expect(waveWrapper!.className).toContain('h-[260px]')
    expect(waveWrapper!.className).not.toContain('opacity-')
  })
})
