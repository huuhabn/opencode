import { createFileRoute } from '@tanstack/react-router'
import { ReactQueryPage } from '@/features/react-query-demo'
import { pokemonQueries } from '@/features/react-query-demo/api/queries'

export const Route = createFileRoute('/_authenticated/react-query/')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(pokemonQueries.detail(25)),
  component: ReactQueryPage,
})
