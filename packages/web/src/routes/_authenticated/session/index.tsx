import { createFileRoute } from '@tanstack/react-router'
import { SessionFeature } from '@/features/session'

export const Route = createFileRoute('/_authenticated/session/')({
  component: () => <SessionFeature />,
})
