import type { Product } from '../domain/product.types'

const IMG =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
      <rect width="100%" height="100%" fill="#f0f2f5"/>
      <path d="M160 320l90-120 60 80 40-50 130 160H160z" fill="#c9ced6"/>
      <circle cx="460" cy="170" r="45" fill="#c9ced6"/>
    </svg>`
  )

export const MOCK_PRODUCTS: Product[] = Array.from({ length: 25 }).map((_, idx) => {
  const price = 13490 + idx * 420
  const rating = 3.6 + (idx % 5) * 0.3
  return {
    id: 100000 + idx,
    name: `Notebook ${idx + 1} – demo produkt`,
    spec: '15.6" IPS, Intel/AMD, 16GB RAM, 512GB SSD, Wi‑Fi 6',
    img: IMG,
    price: `${price.toLocaleString('cs-CZ')} Kč`,
    cprice: idx % 3 === 0 ? `${(price + 1500).toLocaleString('cs-CZ')} Kč` : null,
    avail: 'Skladem > 5 ks',
    rating,
    order: idx + 1,
    url: '#',
    advertising: idx % 4 === 0 ? 'Tento týden zakoupilo 16 zákazníků' : undefined
  }
})
