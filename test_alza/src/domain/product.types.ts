export type AlzaProductApiItem = {
  id: number
  code?: string
  img?: string
  name?: string
  spec?: string
  price?: string
  cprice?: string | null
  priceWithoutVat?: string
  avail?: string
  avail_postfix?: string
  avail_color?: string
  rating?: number
  promos?: unknown
  order?: number
  url?: string
  advertising?: string
}

export type Product = {
  id: number
  name: string
  spec: string
  img: string
  price: string
  cprice?: string | null
  avail: string
  rating?: number
  order?: number
  url?: string
  advertising?: string
}
