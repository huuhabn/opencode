import { useTranslation } from 'react-i18next'
import { ContentSection } from '../components/content-section'
import { AppearanceForm } from './appearance-form'

export function SettingsAppearance() {
  const { t } = useTranslation('platform')

  return (
    <ContentSection
      title={t('Appearance', { defaultValue: 'Appearance' })}
      desc={t('appearance.pageDescription', {
        defaultValue:
          'Customize language, theme, sidebar, layout, and text direction.',
      })}
    >
      <AppearanceForm />
    </ContentSection>
  )
}
