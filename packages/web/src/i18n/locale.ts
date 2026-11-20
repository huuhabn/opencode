import { languages } from './languages'

export type Locale = (typeof languages)[number]['value']

export const defaultLocale = 'en-US' satisfies Locale

export const supportedLocales = languages
  .filter((language) => language.supported)
  .map((language) => language.value)

export const LOCALE_COOKIE_NAME = 'locale'
export const DIRECTION_COOKIE_NAME = 'dir'

const rtlLocales = new Set<Locale>(['ar-TN', 'fa-IR'])

export function directionForLocale(
  language: string | undefined
): 'ltr' | 'rtl' {
  return rtlLocales.has(normalizeLocale(language)) ? 'rtl' : 'ltr'
}

const legacyLocales: Record<string, Locale> = {
  en_US: 'en-US',
  ja_JP: 'ja-JP',
  zh_Hans: 'zh-Hans',
}

export function normalizeLocale(language: string | undefined): Locale {
  if (!language) return defaultLocale
  const canonical = legacyLocales[language] ?? language
  return (
    supportedLocales.find((locale) => locale === canonical) ?? defaultLocale
  )
}
