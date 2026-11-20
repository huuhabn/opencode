export type Product = {
  id: number
  name: string
  description: string
  category: string
  price: number
  photo_url: string
  created_at: string
  updated_at: string
}

export type ProductInput = {
  name: string
  description: string
  category: string
  price: number
  photo_url?: string
}

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Furniture',
  'Clothing',
  'Books',
] as const
