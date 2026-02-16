import { useMemo, useState } from 'react'
import type { Product } from '../../domain/product.types'
import styles from './ProductCarousel.module.css'
import { RatingStars } from '../RatingStars/RatingStars'

function CarouselSkeleton() {
  return (
    <div className={styles.row}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={styles.skelCard} aria-hidden="true" />
      ))}
    </div>
  )
}

/**
 * ProductCarousel:
 * Jednoduchý „nekonečný“ carousel dle zadání:
 * - šipky posouvají index
 * - nekonečná smyčka přes modulo
 * - pro jednoduchost renderujeme vždy 5 položek (wireframe desktop)
 */
export function ProductCarousel(props: { items: Product[]; loading: boolean }) {
  const [index, setIndex] = useState(0)
  const visibleCount = 5
  const len = props.items.length

  const visible = useMemo(() => {
    if (len === 0) return []
    const out: Product[] = []
    for (let i = 0; i < Math.min(visibleCount, len); i++) {
      out.push(props.items[(index + i) % len])
    }
    return out
  }, [index, len, props.items])

  if (props.loading) return <CarouselSkeleton />

  return (
    <div className={styles.carousel}>
      <button
        type="button"
        className={styles.arrow}
        aria-label="Předchozí"
        onClick={() => setIndex((i) => (len === 0 ? 0 : (i - 1 + len) % len))}
      >
        ‹
      </button>

      <div className={styles.row}>
        {visible.map((p) => (
          <a key={p.id} className={styles.card} href={p.url ?? '#'} target="_blank" rel="noreferrer">
            <div className={styles.imgWrap}>
              <img className={styles.img} src={p.img} alt={p.name} loading="lazy" />
            </div>
            <div className={styles.name}>{p.name}</div>
            <RatingStars value={p.rating} />
            <div className={styles.desc}>{p.spec}</div>
            <div className={styles.price}>{p.price}</div>
          </a>
        ))}
      </div>

      <button
        type="button"
        className={styles.arrow}
        aria-label="Další"
        onClick={() => setIndex((i) => (len === 0 ? 0 : (i + 1) % len))}
      >
        ›
      </button>
    </div>
  )
}
