import type { Product } from '../../domain/product.types'
import { RatingStars } from '../RatingStars/RatingStars'
import { BuyMenuButton } from '../BuyMenuButton/BuyMenuButton'
import styles from './ProductCard.module.css'

/**
 * ProductCard:
 * Čistě prezentační komponenta pro jeden produkt (UI).
 * Dostává už připravený Product objekt (business transformace je mimo – mapper).
 */
export function ProductCard(props: { item: Product }) {
  const p = props.item

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <div className={styles.name} title={p.name}>
          {p.name}
        </div>
        <div className={styles.spec}>{p.spec}</div>

        <div className={styles.freebies}>
          <div>+ ZDARMA</div>
          <div>blandit elit</div>
        </div>
      </div>

      <a className={styles.imageWrap} href={p.url ?? '#'} target="_blank" rel="noreferrer">
        <img className={styles.image} src={p.img} alt={p.name} loading="lazy" />
      </a>

      <div className={styles.bottom}>
        <RatingStars value={p.rating} />

        <div className={styles.priceRow}>
          <div className={styles.price}>{p.price}</div>
          {p.cprice ? <div className={styles.cprice}>{p.cprice}</div> : null}
        </div>

        <div className={styles.actions}>
          <BuyMenuButton />
        </div>

        <div className={styles.avail}>{p.avail}</div>
      </div>
    </article>
  )
}
