import { createFileRoute } from '@tanstack/react-router'
import { ProvidersSettings } from '@/features/settings/providers'

export const Route = createFileRoute('/_authenticated/settings/providers')({
  component: ProvidersSettings,
})
