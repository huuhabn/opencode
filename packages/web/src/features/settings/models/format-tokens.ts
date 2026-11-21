import i18n from '@/i18n'

export function formatTokens(count?: number): string {
  if (!count) {
    return i18n.t('modelProvider.tokensStandard', {
      ns: 'model-provider',
      defaultValue: 'Standard',
    })
  }
  if (count >= 1_000_000) {
    const val = (count / 1_000_000).toFixed(0)
    return i18n.t('modelProvider.tokensM', {
      ns: 'model-provider',
      count: val,
      defaultValue: `${val}M tokens`,
    })
  }
  if (count >= 1_000) {
    const val = Math.round(count / 1_000)
    return i18n.t('modelProvider.tokensK', {
      ns: 'model-provider',
      count: val,
      defaultValue: `${val}k tokens`,
    })
  }
  return i18n.t('modelProvider.tokensCount', {
    ns: 'model-provider',
    count,
    defaultValue: `${count} tokens`,
  })
}
