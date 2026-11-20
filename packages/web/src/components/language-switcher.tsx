import { setLocale } from '@/i18n'
import { languages } from '@/i18n/languages'
import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation('common')
  const current = i18n.resolvedLanguage ?? i18n.language

  return (
    <Select value={current} onValueChange={(value) => void setLocale(value)}>
      <SelectTrigger
        aria-label={t('language.displayLanguage')}
        className='h-8 w-40'
      >
        <Languages />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align='end'>
        {languages.map((language) => (
          <SelectItem key={language.value} value={language.value}>
            {language.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
