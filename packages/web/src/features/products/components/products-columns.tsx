import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { PRODUCT_CATEGORIES, type Product } from '../types'
import { ProductRowActions } from './product-row-actions'

export const categoryFilterOptions = PRODUCT_CATEGORIES.map((category) => ({
  label: category,
  value: category,
}))

export const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: 'photo_url',
    header: 'Image',
    cell: ({ row }) => (
      <img
        src={row.original.photo_url}
        alt=''
        className='size-10 rounded-md object-cover'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48'>{row.original.name}</LongText>
    ),
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Category' />
    ),
    cell: ({ row }) => (
      <Badge variant='outline' className='capitalize'>
        {row.original.category}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return (value as string[]).includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ row }) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(row.original.price),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <LongText className='max-w-64 text-muted-foreground'>
        {row.original.description}
      </LongText>
    ),
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => <ProductRowActions product={row.original} />,
  },
]
