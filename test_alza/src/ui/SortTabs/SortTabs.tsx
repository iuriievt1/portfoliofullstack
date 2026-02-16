import styles from './SortTabs.module.css'

export type SortKey = 'TOP' | 'BESTSELLERS' | 'CHEAPEST' | 'MOST_EXPENSIVE'

const TABS: { key: SortKey; label: string }[] = [
  { key: 'TOP', label: 'TOP' },
  { key: 'BESTSELLERS', label: 'Nejprodávanější' },
  { key: 'CHEAPEST', label: 'Od nejlevnějšího' },
  { key: 'MOST_EXPENSIVE', label: 'Od nejdražšího' }
]

/**
 * SortTabs:
 * Prezentační komponenta, která drží pouze UI logiku (výběr tabů).
 * Business logika řazení je v NotebookPage (useMemo).
 */
export function SortTabs(props: { value: SortKey; onChange: (v: SortKey) => void }) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Řazení">
      {TABS.map((t) => {
        const active = props.value === t.key
        return (
          <button
            key={t.key}
            className={`${styles.tab} ${active ? styles.active : ''}`}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => props.onChange(t.key)}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
