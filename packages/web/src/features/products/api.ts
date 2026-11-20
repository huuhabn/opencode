import { mutationOptions, queryOptions } from '@tanstack/react-query'
import type { Product, ProductInput } from './types'

const seed: Product[] = [
  {
    id: 1,
    name: 'Dashboard Pro',
    description: 'Analytics workspace for product and revenue teams.',
    category: 'Electronics',
    price: 49,
    photo_url: 'https://picsum.photos/id/1/80/80',
    created_at: '2024-11-02T00:00:00.000Z',
    updated_at: '2025-03-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Oak Desk Lamp',
    description: 'Warm task lamp with a dimmer and brass fittings.',
    category: 'Furniture',
    price: 89,
    photo_url: 'https://picsum.photos/id/20/80/80',
    created_at: '2024-08-14T00:00:00.000Z',
    updated_at: '2025-01-20T00:00:00.000Z',
  },
  {
    id: 3,
    name: 'Merino Crewneck',
    description: 'Lightweight merino sweater for everyday wear.',
    category: 'Clothing',
    price: 72,
    photo_url: 'https://picsum.photos/id/29/80/80',
    created_at: '2024-06-01T00:00:00.000Z',
    updated_at: '2025-02-11T00:00:00.000Z',
  },
  {
    id: 4,
    name: 'Field Notes',
    description: 'Pocket notebook set with dotted pages.',
    category: 'Books',
    price: 16,
    photo_url: 'https://picsum.photos/id/24/80/80',
    created_at: '2024-04-18T00:00:00.000Z',
    updated_at: '2025-02-02T00:00:00.000Z',
  },
  {
    id: 5,
    name: 'Studio Monitor',
    description: 'Compact nearfield speaker for a desk setup.',
    category: 'Electronics',
    price: 220,
    photo_url: 'https://picsum.photos/id/36/80/80',
    created_at: '2023-12-09T00:00:00.000Z',
    updated_at: '2025-01-08T00:00:00.000Z',
  },
  {
    id: 6,
    name: 'Linen Throw',
    description: 'Stonewashed linen throw for a sofa or bed.',
    category: 'Furniture',
    price: 64,
    photo_url: 'https://picsum.photos/id/42/80/80',
    created_at: '2024-01-22T00:00:00.000Z',
    updated_at: '2025-03-12T00:00:00.000Z',
  },
]

let records = seed.map((product) => ({ ...product }))
let nextId = records.length + 1

function snapshot() {
  return records.map((product) => ({ ...product }))
}

export const productQueries = {
  all: () => ['products'] as const,
  list: () =>
    queryOptions({
      queryKey: [...productQueries.all(), 'list'] as const,
      queryFn: async () => snapshot(),
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: [...productQueries.all(), 'detail', id] as const,
      queryFn: async () =>
        snapshot().find((product) => product.id === id) ?? null,
    }),
}

export const productMutations = {
  create: () =>
    mutationOptions({
      mutationFn: async (input: ProductInput) => {
        const now = new Date().toISOString()
        const product: Product = {
          id: nextId++,
          name: input.name,
          description: input.description,
          category: input.category,
          price: input.price,
          photo_url:
            input.photo_url || `https://picsum.photos/id/${nextId + 10}/80/80`,
          created_at: now,
          updated_at: now,
        }
        records = [product, ...records]
        return product
      },
    }),
  update: () =>
    mutationOptions({
      mutationFn: async ({
        id,
        values,
      }: {
        id: number
        values: ProductInput
      }) => {
        const current = records.find((product) => product.id === id)
        if (!current) throw new Error('Product not found')
        const next: Product = {
          ...current,
          ...values,
          photo_url: values.photo_url || current.photo_url,
          updated_at: new Date().toISOString(),
        }
        records = records.map((product) => (product.id === id ? next : product))
        return next
      },
    }),
  delete: () =>
    mutationOptions({
      mutationFn: async (id: number) => {
        records = records.filter((product) => product.id !== id)
      },
    }),
}
