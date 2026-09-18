import { describe, expect, it } from 'vitest'
import { formatDeteccaoCount } from './ptPlural'

describe('formatDeteccaoCount', () => {
  it('uses singular for one detection', () => {
    expect(formatDeteccaoCount(1)).toBe('1 detecção')
  })

  it('uses plural for zero and many', () => {
    expect(formatDeteccaoCount(0)).toBe('0 detecções')
    expect(formatDeteccaoCount(2)).toBe('2 detecções')
  })
})
