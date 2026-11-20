import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardPage } from '@/components/layout/dashboard-page'
import { productQueries } from './api'
import { ProductsTable } from './components/products-table'

export function ProductsPage() {
  const { data, isLoading, isError } = useQuery(productQueries.list())

  return (
    <DashboardPage
      title='Products'
      description='Manage products.'
      action={
        <Button asChild>
          <Link to='/products/$productId' params={{ productId: 'new' }}>
            <Plus className='size-4' /> Add New
          </Link>
        </Button>
      }
    >
      {isLoading ? (
        <p className='text-sm text-muted-foreground'>Loading products...</p>
      ) : isError ? (
        <p className='text-sm text-destructive'>Couldn't load products.</p>
      ) : (
        <ProductsTable data={data ?? []} />
      )}
    </DashboardPage>
  )
}
