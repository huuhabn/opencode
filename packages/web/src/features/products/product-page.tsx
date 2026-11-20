import { useQuery } from '@tanstack/react-query'
import { DashboardPage } from '@/components/layout/dashboard-page'
import { productQueries } from './api'
import { ProductFormPage } from './components/product-form'

export function ProductDetailPage({ productId }: { productId: string }) {
  const isNew = productId === 'new'
  const id = Number(productId)
  const { data, isLoading, isError } = useQuery({
    ...productQueries.detail(id),
    enabled: !isNew && Number.isFinite(id),
  })

  if (isNew) return <ProductFormPage product={null} />

  if (!Number.isFinite(id)) {
    return (
      <DashboardPage title='Product not found'>
        <p className='text-sm text-muted-foreground'>
          That product does not exist.
        </p>
      </DashboardPage>
    )
  }

  if (isLoading) {
    return (
      <DashboardPage title='Edit Product'>
        <p className='text-sm text-muted-foreground'>Loading product...</p>
      </DashboardPage>
    )
  }

  if (isError || !data) {
    return (
      <DashboardPage title='Product not found'>
        <p className='text-sm text-muted-foreground'>
          That product does not exist.
        </p>
      </DashboardPage>
    )
  }

  return <ProductFormPage product={data} />
}
