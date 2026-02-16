import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RatingStars } from './RatingStars'

describe('RatingStars', () => {
  it('renders aria label', () => {
    render(<RatingStars value={4.6} />)
    expect(screen.getByLabelText(/Hodnocení/)).toBeTruthy()
  })
})
