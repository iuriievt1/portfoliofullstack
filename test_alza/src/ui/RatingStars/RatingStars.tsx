import styles from './RatingStars.module.css'

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/**
 * RatingStars:
 * Malý UI prvek pro zobrazení ratingu (0–5) hvězdičkami.
 * V zadání je rating v JSON jako number (např. 4.644).
 */
export function RatingStars(props: { value?: number }) {
  const v = clamp(props.value ?? 0, 0, 5)
  const full = Math.floor(v)
  const half = v - full >= 0.5 ? 1 : 0
  const empty = 5 - full - half

  return (
    <div className={styles.stars} aria-label={`Hodnocení ${v.toFixed(1)} z 5`}>
      {'★'.repeat(full)}
      {half ? '☆' : ''}
      {'☆'.repeat(empty)}
    </div>
  )
}
