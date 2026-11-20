import { createContext, useContext, useLayoutEffect, useState } from 'react'
import { getCookie, setCookie } from '@/lib/cookies'
import { DEFAULT_THEME, THEMES } from './theme.config'

const COOKIE_NAME = 'active_theme'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

type ThemeContextType = {
  activeTheme: string
  setActiveTheme: (theme: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function resolveTheme(initialTheme?: string) {
  const saved = getCookie(COOKIE_NAME)
  if (saved && THEMES.some((theme) => theme.value === saved)) return saved
  return initialTheme || DEFAULT_THEME
}

export function ActiveThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode
  initialTheme?: string
}) {
  const [activeTheme, setActiveThemeState] = useState(() =>
    resolveTheme(initialTheme)
  )

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme)
  }, [activeTheme])

  const setActiveTheme = (theme: string) => {
    setCookie(COOKIE_NAME, theme, COOKIE_MAX_AGE)
    setActiveThemeState(theme)
  }

  return (
    <ThemeContext.Provider value={{ activeTheme, setActiveTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useThemeConfig() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useThemeConfig must be used within an ActiveThemeProvider')
  }
  return context
}
