import { describe, expect, it } from 'vitest'
import { parseCzk } from './price'

describe('parseCzk', () => {
  it('parses common czk format', () => {
    expect(parseCzk('2&nbsp;199 Kč')).toBe(2199)
  })

  it('returns 0 for invalid', () => {
    expect(parseCzk('')).toBe(0)
  })
})
