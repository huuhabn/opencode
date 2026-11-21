import { createFileRoute } from '@tanstack/react-router'
import { ProjectsSettings } from '@/features/settings/projects'

export const Route = createFileRoute('/_authenticated/settings/projects')({
  component: ProjectsSettings,
})
