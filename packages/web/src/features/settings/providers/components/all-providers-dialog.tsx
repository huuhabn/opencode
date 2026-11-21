import { useState, useMemo } from 'react'
import { Search, X, Check, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProviderIcon } from './provider-icon'
import type { ProviderItem } from './provider-card'

interface AllProvidersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  providers: ProviderItem[]
  connectedProviderIds: Set<string>
  onSelectProvider: (provider: ProviderItem) => void
}

function getProviderCategory(id: string): { label: string; variant: 'default' | 'secondary' | 'outline' } {
  const norm = id.toLowerCase()
  if (norm.includes('ollama') || norm.includes('local') || norm.includes('lmstudio')) {
    return { label: 'Local', variant: 'secondary' }
  }
  if (norm.includes('openrouter') || norm.includes('groq') || norm.includes('together') || norm.includes('fireworks')) {
    return { label: 'Aggregator', variant: 'outline' }
  }
  if (norm.includes('openai') || norm.includes('anthropic') || norm.includes('google') || norm.includes('gemini')) {
    return { label: 'Frontier', variant: 'default' }
  }
  return { label: 'Cloud', variant: 'outline' }
}

export function AllProvidersDialog({
  open,
  onOpenChange,
  providers,
  connectedProviderIds,
  onSelectProvider,
}: AllProvidersDialogProps) {
  const { t } = useTranslation(['model-provider', 'common'])
  const [query, setQuery] = useState('')

  const filteredProviders = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return providers

    return providers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    )
  }, [providers, query])

  const handleSelect = (provider: ProviderItem) => {
    onSelectProvider(provider)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden'>
        <DialogHeader className='px-6 pt-6 pb-4 border-b border-border/60'>
          <DialogTitle className='text-lg font-semibold'>
            {t('modelProvider.allProvidersCatalog', 'Explore All AI Providers')}
          </DialogTitle>
          <DialogDescription className='text-xs text-muted-foreground'>
            {t(
              'modelProvider.browseAllProvidersDesc',
              'Search and connect to any supported AI provider or local inference engine.'
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className='px-6 py-3 border-b border-border/40 bg-muted/20'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              type='search'
              placeholder={t(
                'modelProvider.searchProvidersPlaceholder',
                'Search provider by name, ID or type...'
              )}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='pl-9 pr-8 h-10 text-sm bg-background'
              autoFocus
            />
            {query && (
              <button
                type='button'
                onClick={() => setQuery('')}
                className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1'
              >
                <X className='h-3.5 w-3.5' />
              </button>
            )}
          </div>
        </div>

        {/* Providers List */}
        <div className='flex-1 overflow-y-auto px-6 py-4 space-y-2 min-h-0 select-text'>
          {filteredProviders.length === 0 ? (
            <div className='text-center py-12 text-muted-foreground text-sm'>
              {t('modelProvider.noProvidersFound', 'No providers found matching your search.')}
            </div>
          ) : (
            filteredProviders.map((provider) => {
              const isConnected = connectedProviderIds.has(provider.id)
              const category = getProviderCategory(provider.id)

              return (
                <div
                  key={provider.id}
                  onClick={() => handleSelect(provider)}
                  className='group flex items-center justify-between p-3 rounded-lg border border-border/60 hover:border-primary/50 hover:bg-muted/40 transition-colors cursor-pointer'
                >
                  <div className='flex items-center gap-3.5 min-w-0'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/80 shadow-xs'>
                      <ProviderIcon providerId={provider.id} size={22} />
                    </div>
                    <div className='min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium text-sm text-foreground truncate'>
                          {provider.name}
                        </span>
                        <Badge
                          variant={category.variant}
                          className='text-[10px] h-4 px-1.5 font-normal'
                        >
                          {category.label}
                        </Badge>
                        {isConnected && (
                          <Badge
                            variant='outline'
                            className='text-[10px] h-4 px-1.5 gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-normal'
                          >
                            <Check className='h-2.5 w-2.5' />
                            {t('modelProvider.connected', 'Connected')}
                          </Badge>
                        )}
                      </div>
                      <p className='text-xs text-muted-foreground truncate font-mono mt-0.5'>
                        {provider.id}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 shrink-0'>
                    <Button
                      size='sm'
                      variant={isConnected ? 'outline' : 'default'}
                      className='h-8 text-xs gap-1.5'
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelect(provider)
                      }}
                    >
                      {isConnected ? (
                        t('modelProvider.manage', 'Manage')
                      ) : (
                        <>
                          <Plus className='h-3.5 w-3.5' />
                          {t('modelProvider.connect', 'Connect')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer info */}
        <div className='px-6 py-3 border-t border-border/60 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground'>
          <span>
            {t('modelProvider.totalProviders', {
              count: filteredProviders.length,
              defaultValue: `${filteredProviders.length} providers available`,
            })}
          </span>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 text-xs text-muted-foreground hover:text-foreground'
            onClick={() => onOpenChange(false)}
          >
            {t('common:operation.close', 'Close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
