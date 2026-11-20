import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeModeToggle } from './theme-mode-toggle'
import { ThemeSelector } from './theme-selector'

/** Light/dark toggle, color theme, and display language. */
export function ThemeControls() {
  return (
    <>
      <LanguageSwitcher />
      <ThemeModeToggle />
      <div className='hidden sm:block'>
        <ThemeSelector />
      </div>
    </>
  )
}
