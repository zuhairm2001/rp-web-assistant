export interface Product {
  id: number
  name: string
  slug: string
  permalink: string
  description: string
  short_description: string
  price: string
  regular_price: string
  sale_price: string
  price_html: string
  on_sale: boolean
  stock_quantity: number | null
  stock_status: "instock" | "outofstock" | "onbackorder"
  manage_stock: boolean
  categories: Array<{
    id: number
    name: string
    slug: string
  }>
  images: Array<{
    id: number
    src: string
    name: string
    alt: string
    date_created: string
    date_modified: string
  }>
  attributes: Array<unknown>
  status: "draft" | "pending" | "private" | "publish"
  type: "simple" | "grouped" | "external" | "variable"
}

export interface ProductSearchResult {
  products: Product[]
  total: number
  query: string
}

export interface ServiceInfo {
  id: string
  name: string
  description: string
  features: string[]
  pricing?: {
    type: "fixed" | "variable" | "quote"
    amount?: number
    currency?: string
  }
  contact?: {
    email?: string
    phone?: string
    form_url?: string
  }
}
