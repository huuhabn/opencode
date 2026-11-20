import { Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDirection } from '@/context/direction-provider'
import { useLayout } from '@/context/layout-provider'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { AppearancePreferences } from '@/components/appearance-preferences'
import { useSidebar } from './ui/sidebar'

export function ConfigDrawer() {
  const { setOpen } = useSidebar()
  const { resetDir } = useDirection()
  const { resetTheme } = useTheme()
  const { resetLayout } = useLayout()
  const { t } = useTranslation('platform')

  const handleReset = () => {
    setOpen(true)
    resetDir()
    resetTheme()
    resetLayout()
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size='icon'
          variant='ghost'
          aria-label={t('appearance.openSettings', {
            defaultValue: 'Open theme settings',
          })}
          className='rounded-full'
        >
          <Settings aria-hidden='true' />
        </Button>
      </SheetTrigger>
      <SheetContent className='flex flex-col'>
        <SheetHeader className='pb-0 text-start'>
          <SheetTitle>
            {t('appearance.themeSettings', { defaultValue: 'Theme Settings' })}
          </SheetTitle>
          <SheetDescription>
            {t('appearance.themeSettingsDescription', {
              defaultValue:
                'Adjust the appearance and layout to suit your preferences.',
            })}
          </SheetDescription>
        </SheetHeader>
        <div className='space-y-6 overflow-y-auto px-4'>
          <AppearancePreferences idPrefix='drawer' responsive />
        </div>
        <SheetFooter className='gap-2'>
          <Button
            variant='destructive'
            onClick={handleReset}
            aria-label={t('appearance.resetAll', {
              defaultValue: 'Reset all settings to default values',
            })}
          >
            {t('appearance.reset', { defaultValue: 'Reset' })}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
