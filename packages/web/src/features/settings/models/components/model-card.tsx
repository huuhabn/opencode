import { Eye, Wrench, Brain, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ModelInfo } from '@opencode/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProviderIcon } from '../../providers/components/provider-icon'

interface ModelCardProps {
  model: ModelInfo
  isDefault?: boolean
}

export function ModelCard({ model, isDefault }: ModelCardProps) {
  const { t } = useTranslation(['model-provider', 'common'])

  const formatTokens = (count?: number): string => {
    if (!count) return t('modelProvider.tokensStandard', 'Standard')
    if (count >= 1_000_000) {
      const val = (count / 1_000_000).toFixed(0)
      return t('modelProvider.tokensM', {
        count: val,
        defaultValue: `${val}M tokens`,
      })
    }
    if (count >= 1_000) {
      const val = Math.round(count / 1_000)
      return t('modelProvider.tokensK', {
        count: val,
        defaultValue: `${val}k tokens`,
      })
    }
    return t('modelProvider.tokensCount', {
      count,
      defaultValue: `${count} tokens`,
    })
  }
  const hasVision = model.capabilities?.input?.includes('image')
  const hasTools = Boolean(model.capabilities?.tools)
  const hasReasoning = (model.variants?.length ?? 0) > 0
  const isFree = Boolean(
    model.cost?.length && !model.cost.some((c) => c.input > 0 || c.output > 0)
  )

  const tokenLabel = isFree
    ? t('modelProvider.free', 'Free')
    : formatTokens(model.limit?.context)

  return (
    <Card
      className={`group relative flex flex-col justify-between gap-2.5 overflow-hidden p-3 transition-all hover:border-primary/40 hover:shadow-xs ${
        isDefault ? 'border-primary/60 bg-primary/[0.02]' : ''
      }`}
    >
      <div className='flex items-start justify-between gap-2'>
        <div className='flex items-center gap-2.5 min-w-0 flex-1'>
          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 p-1 transition-colors group-hover:bg-muted/60'>
            <ProviderIcon providerId={model.providerID} size={20} />
          </div>

          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-1.5 flex-wrap'>
              <h4
                className='truncate text-xs font-semibold leading-tight sm:text-sm'
                title={model.name}
              >
                {model.name}
              </h4>
              {isDefault && (
                <Badge
                  variant='outline'
                  className='border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] py-0 px-1 gap-0.5 shrink-0 h-4'
                >
                  <Star className='h-2.5 w-2.5 fill-current' />
                  {t('modelProvider.defaultBadge', 'Default')}
                </Badge>
              )}
            </div>
            <span className='truncate text-[11px] text-muted-foreground block capitalize mt-0.5'>
              {model.providerID}
            </span>
          </div>
        </div>

        <Badge
          variant={isFree ? 'secondary' : 'outline'}
          className='text-[10px] shrink-0 font-mono py-0 h-5 px-1.5'
        >
          {tokenLabel}
        </Badge>
      </div>

      <div className='flex items-center justify-between border-t border-border/40 pt-2 text-[10px] text-muted-foreground'>
        <div className='flex items-center gap-1 flex-wrap'>
          {hasTools && (
            <span
              className='inline-flex items-center gap-0.5 rounded bg-muted/50 px-1.5 py-0.5 font-medium'
              title={t('modelProvider.tools', 'Tools')}
            >
              <Wrench className='h-2.5 w-2.5' />
              <span>{t('modelProvider.tools', 'Tools')}</span>
            </span>
          )}
          {hasVision && (
            <span
              className='inline-flex items-center gap-0.5 rounded bg-muted/50 px-1.5 py-0.5 font-medium'
              title={t('modelProvider.vision', 'Vision')}
            >
              <Eye className='h-2.5 w-2.5' />
              <span>{t('modelProvider.vision', 'Vision')}</span>
            </span>
          )}
          {hasReasoning && (
            <span
              className='inline-flex items-center gap-0.5 rounded bg-muted/50 px-1.5 py-0.5 font-medium'
              title={t('modelProvider.reasoning', 'Reasoning')}
            >
              <Brain className='h-2.5 w-2.5' />
              <span>{t('modelProvider.reasoning', 'Reasoning')}</span>
            </span>
          )}
        </div>

        <span className='font-mono text-[10px] text-muted-foreground shrink-0 ms-auto'>
          {formatTokens(model.limit?.context)}
        </span>
      </div>
    </Card>
  )
}
