import { useState, useMemo } from 'react'
import { Sparkles, Search, RefreshCw, AlertCircle, Filter, Server, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { ModelInfo } from '@opencode/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ModelCard } from './components/model-card'
import { useModels, useDefaultModel } from './api'
import { ServerConfigDialog } from '../providers/components/server-config-dialog'
import { getServerConfig } from '@/lib/agent-platform-client'

export function ModelsSettings() {
  const { t } = useTranslation(['model-provider', 'common'])
  const [search, setSearch] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<string>('all')
  const [serverConfigOpen, setServerConfigOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const {
    data: modelsData,
    isLoading,
    isError,
    error: modelsError,
    refetch,
  } = useModels()
  const { data: defaultModelData } = useDefaultModel()

  const serverConfig = getServerConfig()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
      toast.success(t('modelProvider.modelsRefreshedSuccess', 'Models refreshed successfully'))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to refresh models')
    } finally {
      setIsRefreshing(false)
    }
  }
  const isAuthError =
    modelsError instanceof Error &&
    modelsError.message.toLowerCase().includes('authentication')

  const models: ModelInfo[] = useMemo(() => {
    if (!modelsData) return []
    if (Array.isArray(modelsData)) return modelsData
    return []
  }, [modelsData])

  // Extract unique providers for the filter dropdown
  const providerOptions = useMemo(() => {
    const set = new Set<string>()
    for (const m of models) {
      if (m.providerID) set.add(m.providerID)
    }
    return Array.from(set).sort()
  }, [models])

  const filteredModels = useMemo(() => {
    let result = models

    if (selectedProvider !== 'all') {
      result = result.filter((m) => m.providerID === selectedProvider)
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.providerID.toLowerCase().includes(q)
      )
    }

    return result
  }, [models, selectedProvider, search])

  const defaultModelID = defaultModelData?.modelID || defaultModelData?.id

  return (
    <div className='w-full space-y-6 pb-12'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-5'>
        <div>
          <h2 className='text-xl font-bold tracking-tight'>
            {t('modelProvider.aiModelsCatalog', 'AI Models Catalog')}
          </h2>
          <p className='text-sm text-muted-foreground mt-0.5'>
            {t(
              'modelProvider.aiModelsCatalogDesc',
              'Browse and inspect all AI models discovered from your connected providers.'
            )}
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='gap-2 text-xs'
            onClick={() => setServerConfigOpen(true)}
          >
            <Server className='h-3.5 w-3.5' />
            {t('modelProvider.serverSettings', 'Server Settings')}
          </Button>

          <Button
            variant='outline'
            size='sm'
            className='gap-2 text-xs'
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing || isLoading ? 'animate-spin' : ''}`}
            />
            {t('modelProvider.refresh', 'Refresh')}
          </Button>
        </div>
      </div>

      {/* Server Auth Warning Banner */}
      {isAuthError && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>
            {t(
              'modelProvider.serverAuthError',
              'Server requires authentication password'
            )}
          </AlertTitle>
          <AlertDescription className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs mt-1'>
            <span>
              {t('modelProvider.serverAuthErrorDesc')}{' '}
              <code className='rounded bg-destructive/20 px-1 py-0.5 font-mono text-[11px]'>
                bun run dev service get password
              </code>
            </span>
            <Button
              size='sm'
              variant='outline'
              className='h-7 bg-background text-foreground'
              onClick={() => setServerConfigOpen(true)}
            >
              {t('modelProvider.serverSettings', 'Server Settings')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* General Error Banner */}
      {isError && !isAuthError && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>
            {t('modelProvider.serverConnectionError', 'Server Connection Error')}
          </AlertTitle>
          <AlertDescription className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs mt-1'>
            <span>
              Could not load models from OpenCode server at{' '}
              <strong className='font-mono'>{serverConfig.serverUrl}</strong>.
            </span>
            <Button
              size='sm'
              variant='outline'
              className='h-7 bg-background text-foreground'
              onClick={() => setServerConfigOpen(true)}
            >
              {t('modelProvider.serverSettings', 'Server Settings')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters Bar */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground' />
          <Input
            type='search'
            name='ai-model-search-query'
            id='ai-model-search-query'
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            spellCheck={false}
            data-1p-ignore
            data-lpignore='true'
            data-bwignore='true'
            data-form-type='other'
            placeholder={t(
              'modelProvider.searchModelsPlaceholder',
              'Search models by name or ID...'
            )}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='ps-9 pe-8 h-9 text-xs'
          />
          {search && (
            <button
              type='button'
              onClick={() => setSearch('')}
              className='absolute inset-y-0 end-2.5 my-auto flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground'
              title='Clear search'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <Filter className='h-4 w-4 text-muted-foreground hidden sm:block' />
          <Select
            value={selectedProvider}
            onValueChange={setSelectedProvider}
          >
            <SelectTrigger className='w-[180px] h-9 text-xs'>
              <SelectValue
                placeholder={t(
                  'modelProvider.filterByProvider',
                  'Filter by provider'
                )}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>
                {t('modelProvider.filterAllProviders', 'All Providers')}
              </SelectItem>
              {providerOptions.map((prov) => (
                <SelectItem key={prov} value={prov} className='capitalize'>
                  {prov}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Models Grid - Compact */}
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
        {filteredModels.map((model) => (
          <ModelCard
            key={`${model.providerID}/${model.id}`}
            model={model}
            isDefault={defaultModelID === model.id}
          />
        ))}
      </div>

      {filteredModels.length === 0 && !isLoading && (
        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-border/70 p-12 text-center text-muted-foreground'>
          <Sparkles className='mb-2 h-10 w-10 text-muted-foreground/60' />
          <p className='text-sm font-medium'>
            {t(
              'modelProvider.noModelsFound',
              'No models found matching your search.'
            )}
          </p>
        </div>
      )}

      <ServerConfigDialog
        open={serverConfigOpen}
        onOpenChange={setServerConfigOpen}
      />
    </div>
  )
}
