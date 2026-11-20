import { ChevronDownIcon } from '@radix-ui/react-icons'
import { fonts } from '@/config/fonts'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useFont } from '@/context/font-provider'
import { buttonVariants } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AppearancePreferences } from '@/components/appearance-preferences'

export function AppearanceForm() {
  const { font, setFont } = useFont()
  const { t } = useTranslation('platform')

  return (
    <div className='space-y-8'>
      <AppearancePreferences idPrefix='settings' showLanguage />
      <div className='space-y-2'>
        <Label htmlFor='appearance-font'>
          {t('appearance.font', { defaultValue: 'Font' })}
        </Label>
        <div className='relative w-max'>
          <select
            id='appearance-font'
            value={font}
            onChange={(event) =>
              setFont(event.target.value as (typeof fonts)[number])
            }
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-50 appearance-none font-normal capitalize',
              'dark:bg-background dark:hover:bg-background'
            )}
          >
            {fonts.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <ChevronDownIcon className='absolute inset-e-3 top-2.5 h-4 w-4 opacity-50' />
        </div>
        <p className='text-sm text-muted-foreground'>
          {t('appearance.fontDescription', {
            defaultValue: 'Set the font you want to use in the dashboard.',
          })}
        </p>
      </div>
    </div>
  )
}
