import { Suspense } from 'react'
import { DashboardPage } from '@/components/layout/dashboard-page'
import { PokemonInfo } from './components/pokemon-info'
import { PokemonSkeleton } from './components/pokemon-skeleton'

export function ReactQueryPage() {
  return (
    <DashboardPage
      title='React Query'
      description='Shared queryOptions, route prefetch, and a suspense query.'
    >
      <Suspense fallback={<PokemonSkeleton />}>
        <PokemonInfo />
      </Suspense>
    </DashboardPage>
  )
}
