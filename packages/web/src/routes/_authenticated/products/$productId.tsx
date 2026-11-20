import { createFileRoute } from '@tanstack/react-router'
import { ProductDetailPage } from '@/features/products/product-page'

export const Route = createFileRoute('/_authenticated/products/$productId')({
  component: ProductRoute,
})

function ProductRoute() {
  const { productId } = Route.useParams()
  return <ProductDetailPage productId={productId} />
}
