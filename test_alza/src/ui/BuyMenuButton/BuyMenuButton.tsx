import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './BuyMenuButton.module.css'

const ITEMS = ['Koupit zrychleně', 'Porovnat', 'Hlídat', 'Přidat do seznamu'] as const

type MenuPos = {
  top: number
  left: number
  width: number
  openUp: boolean
}

/**
 * BuyMenuButton:
 * Rozbalovací tlačítko „Koupit“ dle zadání.
 *
 * Fix pro „menu se ořezává“:
 * - menu renderujeme do document.body přes React portal
 * - pozicujeme ho jako `position: fixed` podle `getBoundingClientRect()`
 * => menu už neomezuje `overflow: hidden` rodičovských komponent (např. ProductCard).
 */
export function BuyMenuButton(props: { onAction?: (label: string) => void }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<MenuPos | null>(null)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const menuId = useMemo(() => `buy-menu-${Math.random().toString(16).slice(2)}`, [])

  function close() {
    setOpen(false)
  }

  function recalcPosition() {
    const btn = buttonRef.current
    if (!btn) return

    const rect = btn.getBoundingClientRect()
    const menuWidth = 190

    // Preferujeme zarovnání doprava (podle wireframe).
    let left = rect.right - menuWidth

    // Pokud by menu ujíždělo mimo viewport, upravíme.
    const padding = 8
    left = Math.max(padding, Math.min(left, window.innerWidth - menuWidth - padding))

    // Zjistíme, zda je pod tlačítkem místo (jinak otevřeme nahoru).
    const estimatedMenuHeight = 4 + ITEMS.length * 42 + 4
    const spaceBelow = window.innerHeight - rect.bottom
    const openUp = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight

    const top = openUp ? rect.top - 6 : rect.bottom + 6

    setPos({
      top,
      left,
      width: menuWidth,
      openUp
    })
  }

  useLayoutEffect(() => {
    if (!open) return
    recalcPosition()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return

    function onDocClick(e: MouseEvent) {
      const root = rootRef.current
      const menuEl = document.getElementById(menuId)
      if (!root) return
      const target = e.target
      if (!(target instanceof Node)) return

      // Klik mimo tlačítko i mimo menu => zavřít.
      if (!root.contains(target) && !(menuEl && menuEl.contains(target))) close()
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }

    function onRecalc() {
      recalcPosition()
    }

    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onRecalc, true)
    window.addEventListener('resize', onRecalc)

    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onRecalc, true)
      window.removeEventListener('resize', onRecalc)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, menuId])

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        Koupit <span className={styles.chevron} aria-hidden="true">▾</span>
      </button>

      {open && pos
        ? createPortal(
            <div
              id={menuId}
              className={`${styles.menu} ${pos.openUp ? styles.openUp : ''}`}
              role="menu"
              style={{
                top: pos.openUp ? pos.top : pos.top,
                left: pos.left,
                width: pos.width
              }}
            >
              {ITEMS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className={styles.menuItem}
                  role="menuitem"
                  onClick={() => {
                    props.onAction?.(label)
                    close()
                  }}
                >
                  {label}
                </button>
              ))}
            </div>,
            document.body
          )
        : null}
    </div>
  )
}
