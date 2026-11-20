import { useCallback, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { flushSync } from 'react-dom'
import { startThemeTransition } from '@/lib/theme-transition'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function ThemeModeToggle() {
  const { setTheme } = useTheme()

  const handleThemeToggle = useCallback(
    (event?: React.MouseEvent) => {
      const isDark = document.documentElement.classList.contains('dark')
      const nextMode = isDark ? 'light' : 'dark'
      startThemeTransition(() => {
        flushSync(() => setTheme(nextMode))
      }, event)
    },
    [setTheme]
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== 'd' ||
        !event.shiftKey ||
        !(event.metaKey || event.ctrlKey)
      ) {
        return
      }
      const target = event.target
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return
      }
      event.preventDefault()
      handleThemeToggle()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleThemeToggle])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='relative text-muted-foreground hover:text-foreground'
          onClick={handleThemeToggle}
        >
          <Sun className='size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
          <Moon className='absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
          <span className='sr-only'>Toggle dark mode</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Toggle theme (⌘⇧D)</TooltipContent>
    </Tooltip>
  )
}
