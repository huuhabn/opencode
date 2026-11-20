import i18n from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next'
import { getCookie, setCookie } from '@/lib/cookies'
import { loadI18nResource } from './load-resource'
import {
  defaultLocale,
  directionForLocale,
  LOCALE_COOKIE_NAME,
  normalizeLocale,
  supportedLocales,
  type Locale,
} from './locale'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export const initialNamespaces = [
  'common',
  'layout',
  'navigation',
  'platform',
  'model-provider',
] as const

export function getSavedLocale(): Locale {
  if (typeof document === 'undefined') return defaultLocale
  return normalizeLocale(getCookie(LOCALE_COOKIE_NAME))
}

function applyDocumentLocale(locale: string) {
  if (typeof document === 'undefined') return
  const next = normalizeLocale(locale)
  const direction = directionForLocale(next)
  document.documentElement.lang = next
  document.documentElement.dir = direction
}

export function setLocale(locale: string) {
  const next = normalizeLocale(locale)
  setCookie(LOCALE_COOKIE_NAME, next, COOKIE_MAX_AGE)
  applyDocumentLocale(next)
  return i18n.changeLanguage(next)
}

export const i18nReady = i18n
  .use(initReactI18next)
  .use(resourcesToBackend(loadI18nResource))
  .init({
    lng: getSavedLocale(),
    fallbackLng: defaultLocale,
    supportedLngs: [...supportedLocales],
    load: 'currentOnly',
    defaultNS: 'platform',
    ns: [...initialNamespaces],
    keySeparator: false,
    interpolation: { escapeValue: false },
    partialBundledLanguages: true,
    returnEmptyString: false,
    react: { useSuspense: false },
  })
  .then(() => {
    applyDocumentLocale(i18n.language)
    i18n.on('languageChanged', applyDocumentLocale)
    return i18n
  })

export default i18n
