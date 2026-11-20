import { createFileRoute } from '@tanstack/react-router'
import { OnboardingWizardPage } from '@/features/onboarding/wizard'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingWizardPage,
})
