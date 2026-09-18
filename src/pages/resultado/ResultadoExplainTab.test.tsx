import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResultadoExplainTab } from './ResultadoExplainTab'

describe('ResultadoExplainTab', () => {
  it('renders empty explanation state without fabricated AI text', () => {
    render(<ResultadoExplainTab />)

    expect(
      screen.getByRole('region', { name: /explicação/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Nenhuma explicação disponível.'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/explicação gerada por ia/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/sombra acústica/i)).not.toBeInTheDocument()
  })
})
