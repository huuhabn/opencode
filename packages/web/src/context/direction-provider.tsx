import { createContext, useContext, useEffect, useState } from 'react'
import { DirectionProvider as RdxDirProvider } from '@radix-ui/react-direction'
import i18n, {
  DIRECTION_COOKIE_NAME,
  directionForLocale,
  getSavedLocale,
} from '@/i18n'
import { setCookie, removeCookie } from '@/lib/cookies'

export type Direction = 'ltr' | 'rtl'

const DIRECTION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

type DirectionContextType = {
  defaultDir: Direction
  dir: Direction
  setDir: (dir: Direction) => void
  resetDir: () => void
}

const DirectionContext = createContext<DirectionContextType | null>(null)

export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const [dir, _setDir] = useState<Direction>(() =>
    directionForLocale(getSavedLocale())
  )
  const defaultDir = directionForLocale(i18n.resolvedLanguage ?? i18n.language)

  useEffect(() => {
    const next = directionForLocale(getSavedLocale())
    // eslint-disable-next-line react-hooks/set-state-in-effect
    _setDir(next)
    setCookie(DIRECTION_COOKIE_NAME, next, DIRECTION_COOKIE_MAX_AGE)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir)
  }, [dir])

  useEffect(() => {
    let ignoreInitial = !i18n.isInitialized
    const apply = (language: string) => {
      if (ignoreInitial) {
        ignoreInitial = false
        return
      }
      const next = directionForLocale(language)
      _setDir(next)
      setCookie(DIRECTION_COOKIE_NAME, next, DIRECTION_COOKIE_MAX_AGE)
    }
    i18n.on('languageChanged', apply)
    return () => {
      i18n.off('languageChanged', apply)
    }
  }, [])

  const setDir = (dir: Direction) => {
    _setDir(dir)
    setCookie(DIRECTION_COOKIE_NAME, dir, DIRECTION_COOKIE_MAX_AGE)
  }

  const resetDir = () => {
    _setDir(defaultDir)
    removeCookie(DIRECTION_COOKIE_NAME)
  }

  return (
    <DirectionContext
      value={{
        defaultDir,
        dir,
        setDir,
        resetDir,
      }}
    >
      <RdxDirProvider dir={dir}>{children}</RdxDirProvider>
    </DirectionContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDirection() {
  const context = useContext(DirectionContext)
  if (!context) {
    throw new Error('useDirection must be used within a DirectionProvider')
  }
  return context
}
