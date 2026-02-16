import { useMemo, useState } from 'react'
import { CategoryChips } from '../ui/CategoryChips/CategoryChips'
import { ProductCarousel } from '../ui/ProductCarousel/ProductCarousel'
import { SortTabs, type SortKey } from '../ui/SortTabs/SortTabs'
import { ProductGrid } from '../ui/ProductGrid/ProductGrid'
import { useProducts } from '../hooks/useProducts'
import { parseCzk } from '../utils/price'
import styles from './NotebookPage.module.css'
import { AlertBanner } from '../ui/AlertBanner/AlertBanner'

export function NotebookPage() {
  const { products, loading, error, usedFallback } = useProducts()
  const [sort, setSort] = useState<SortKey>('TOP')

  const sorted = useMemo(() => {
    const arr = [...products]

    switch (sort) {
      case 'TOP':
        // „TOP“: pro demo řadíme dle ratingu sestupně
        return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      case 'BESTSELLERS':
        // „Nejprodávanější“: pokud existuje "order", použijeme ho, jinak necháme původní pořadí
        return arr.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
      case 'CHEAPEST':
        return arr.sort((a, b) => parseCzk(a.price) - parseCzk(b.price))
      case 'MOST_EXPENSIVE':
        return arr.sort((a, b) => parseCzk(b.price) - parseCzk(a.price))
      default:
        return arr
    }
  }, [products, sort])

  const carouselItems = useMemo(() => {
    // Carousel „Nejprodávanější“: vezmeme prvních 12 produktů (už případně seřazených)
    const base = [...products].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
    return base.slice(0, Math.min(12, base.length))
  }, [products])

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Notebooky</h1>

        {usedFallback && (
          <AlertBanner
            tone="warning"
            title="Poznámka k REST službě"
            text="Volání REST endpointu proběhlo, ale prohlížeč odpověď zablokoval (typicky CORS/403). Pro možnost předvedení aplikace byly použity lokální demo produkty."
          />
        )}

        {error && (
          <AlertBanner
            tone="danger"
            title="Chyba při načtení dat"
            text={error}
          />
        )}

        <section className={styles.section}>
          <CategoryChips />
        </section>

        <section className={styles.section}>
          <div className={styles.sectionTitle}>Nejprodávanější</div>
          <ProductCarousel items={carouselItems} loading={loading} />
        </section>

        <section className={styles.section}>
          <SortTabs value={sort} onChange={setSort} />
          <ProductGrid items={sorted} loading={loading} />
        </section>
      </div>
    </div>
  )
}
