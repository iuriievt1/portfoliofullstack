import type { Product } from '../../domain/product.types'
import { ProductCard } from '../ProductCard/ProductCard'
import styles from './ProductGrid.module.css'

function SkeletonCard() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <div className={styles.skelLine} />
      <div className={styles.skelLineShort} />
      <div className={styles.skelImage} />
      <div className={styles.skelLine} />
      <div className={styles.skelLineShort} />
    </div>
  )
}

/**
 * ProductGrid:
 * Grid produktů dle wireframu (karty opakované v řadách).
 * Loading stav: skeletony.
 */
export function ProductGrid(props: { items: Product[]; loading: boolean }) {
  if (props.loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {props.items.map((p) => (
        <ProductCard key={p.id} item={p} />
      ))}
    </div>
  )
}
