import type { AlzaProductApiItem, Product } from './product.types'
import { decodeHtml, stripHtml } from '../utils/html'

const FALLBACK_IMG =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
      <rect width="100%" height="100%" fill="#f0f2f5"/>
      <path d="M160 320l90-120 60 80 40-50 130 160H160z" fill="#c9ced6"/>
      <circle cx="460" cy="170" r="45" fill="#c9ced6"/>
    </svg>`
  )

export function mapApiProduct(p: AlzaProductApiItem): Product {
  return {
    id: p.id,
    name: decodeHtml(p.name ?? 'Název zboží'),
    spec: decodeHtml(p.spec ?? ''),
    img: p.img ?? FALLBACK_IMG,
    // ceny chceme v UI jako čistý text (bez HTML) – bezpečnější než innerHTML
    price: decodeHtml(stripHtml(p.price ?? '')),
    cprice: p.cprice ? decodeHtml(stripHtml(p.cprice)) : null,
    avail: decodeHtml(stripHtml([p.avail, p.avail_postfix].filter(Boolean).join(' '))),
    rating: typeof p.rating === 'number' ? p.rating : undefined,
    order: typeof p.order === 'number' ? p.order : undefined,
    url: p.url,
    advertising: p.advertising ? decodeHtml(p.advertising) : undefined
  }
}
