import { createFileRoute } from '@tanstack/react-router'
import { AgentSettings } from '@/features/settings/agent'

export const Route = createFileRoute('/_authenticated/settings/agent')({
  component: AgentSettings,
})
