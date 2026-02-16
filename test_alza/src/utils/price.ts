import { decodeHtml } from './html'

/**
 * parseCzk:
 * Z API přichází cena jako text, často s &nbsp; a "Kč".
 * Tady to převedeme na číslo (Kč), aby šlo řadit (nejlevnější / nejdražší).
 */
export function parseCzk(priceHtml: string): number {
  const decoded = decodeHtml(priceHtml ?? '')
  // Ponecháme pouze čísla a oddělovače
  const digits = decoded.replace(/[^\d,.-]/g, '').replace(',', '.')
  const n = Number.parseFloat(digits)
  return Number.isFinite(n) ? n : 0
}

/**
 * formatCzk:
 * Pro konzistentní zobrazení ceny, pokud by některé produkty neměly "price" ve správném tvaru.
 */
export function formatCzk(value: number): string {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(value)
}
