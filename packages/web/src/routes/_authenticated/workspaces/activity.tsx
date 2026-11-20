import { createFileRoute } from '@tanstack/react-router'
import { WorkspaceActivityPage } from '@/features/workspaces/activity'

export const Route = createFileRoute('/_authenticated/workspaces/activity')({
  component: WorkspaceActivityPage,
})
