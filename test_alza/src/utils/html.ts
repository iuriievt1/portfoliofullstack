/**
 * decodeHtml:
 * API vrací stringy s HTML entitami (&nbsp;, &gt;, …). Pro zobrazení v UI je chceme dekódovat do normálního textu.
 */
export function decodeHtml(value: string): string {
  if (!value) return ''
  // Browser-friendly dekódování: použijeme DOM parser.
  const txt = document.createElement('textarea')
  txt.innerHTML = value
  return txt.value
}

/**
 * stripHtml:
 * Některá pole obsahují HTML tagy (např. <span class="link">…</span>). Pro jednoduché UI je odstraníme.
 */
export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '')
}
