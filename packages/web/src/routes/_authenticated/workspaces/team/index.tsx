import { createFileRoute } from '@tanstack/react-router'
import { TeamPage } from '@/features/workspaces/team-page'

export const Route = createFileRoute('/_authenticated/workspaces/team/')({
  component: TeamPage,
})
