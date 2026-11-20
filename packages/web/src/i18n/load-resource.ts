import { normalizeLocale } from './locale'

type LocaleResourceModule = {
  loadResource: (
    namespace: string
  ) => Promise<{ default: Record<string, unknown> }>
}

const loaders = import.meta.glob<LocaleResourceModule>(
  './locale-resources/*.ts'
)

export async function loadI18nResource(language: string, namespace: string) {
  const locale = normalizeLocale(language)
  const load = loaders[`./locale-resources/${locale}.ts`]
  if (!load) throw new Error(`Unsupported locale: ${locale}`)
  const module = await load()
  const resource = await module.loadResource(namespace)
  return resource.default
}
