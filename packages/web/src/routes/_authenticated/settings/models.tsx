import { createFileRoute } from '@tanstack/react-router'
import { ModelsSettings } from '@/features/settings/models'

export const Route = createFileRoute('/_authenticated/settings/models')({
  component: ModelsSettings,
})
