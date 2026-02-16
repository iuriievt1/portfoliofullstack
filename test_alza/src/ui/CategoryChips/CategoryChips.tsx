import styles from './CategoryChips.module.css'

const CATEGORIES = [
  'Macbook',
  'Herní',
  'Kancelářské',
  'Profesionální',
  'Stylové',
  'Základní',
  'Dotykové',
  'Na splátky',
  'VR Ready',
  'IRIS Graphics',
  'Brašny, batohy',
  'Příslušenství'
]

/**
 * CategoryChips:
 * Prezentační komponenta – statické „kategorie“ dle wireframu.
 */
export function CategoryChips() {
  return (
    <div className={styles.wrap} aria-label="Kategorie">
      {CATEGORIES.map((c) => (
        <button key={c} className={styles.chip} type="button">
          {c}
        </button>
      ))}
    </div>
  )
}
