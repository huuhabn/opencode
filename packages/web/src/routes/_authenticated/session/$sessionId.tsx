import { createFileRoute } from '@tanstack/react-router'
import { SessionFeature } from '@/features/session'

export const Route = createFileRoute('/_authenticated/session/$sessionId')({
  component: SessionRouteComponent,
})

function SessionRouteComponent() {
  const { sessionId } = Route.useParams()
  return <SessionFeature sessionId={sessionId} />
}
