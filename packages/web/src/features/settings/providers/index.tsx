import { useState, useMemo } from 'react'
import {
  Bot,
  RefreshCw,
  Search,
  AlertCircle,
  Server,
  X,
  Plus,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ProviderCard, type ProviderItem } from './components/provider-card'
import { ManageKeysSheet } from './components/manage-keys-sheet'
import { ServerConfigDialog } from './components/server-config-dialog'
import { AllProvidersDialog } from './components/all-providers-dialog'
import { useIntegrations, useCredentials, providerQueryKeys } from './api'
import { getServerConfig } from '@/lib/agent-platform-client'
import { popularProviders } from './catalog/order'

// Fallback catalog of major providers in case the server list is cold
const KNOWN_PROVIDERS: ProviderItem[] = [
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'google', name: 'Gemini' },
  { id: 'opencode-go', name: 'OpenCode Go' },
  { id: 'opencode', name: 'OpenCode' },
  { id: 'github-copilot', name: 'GitHub Copilot' },
  { id: 'groq', name: 'Groq' },
  { id: 'openrouter', name: 'OpenRouter' },
  { id: 'deepseek', name: 'DeepSeek' },
  { id: 'mistral', name: 'Mistral AI' },
  { id: 'togetherai', name: 'Together AI' },
  { id: 'xai', name: 'xAI' },
  { id: 'cohere', name: 'Cohere' },
  { id: 'vercel', name: 'Vercel AI' },
  { id: 'ollama', name: 'Ollama' },
  { id: 'lmstudio', name: 'LM Studio' },
  { id: 'bedrock', name: 'AWS Bedrock' },
  { id: 'azure', name: 'Azure OpenAI' },
]

export function ProvidersSettings() {
  const { t } = useTranslation(['model-provider', 'common'])
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [serverConfigOpen, setServerConfigOpen] = useState(false)
  const [allProvidersDialogOpen, setAllProvidersDialogOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeProviderForSheet, setActiveProviderForSheet] = useState<ProviderItem | null>(null)

  const {
    data: integrations,
    isLoading: isIntegrationsLoading,
    isError: isIntegrationsError,
    error: integrationsError,
    refetch,
  } = useIntegrations()
  const { data: credentials = [] } = useCredentials()

  const serverConfig = getServerConfig()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: providerQueryKeys.integrations }),
        queryClient.invalidateQueries({ queryKey: providerQueryKeys.credentials }),
        queryClient.invalidateQueries({ queryKey: providerQueryKeys.models }),
        refetch(),
      ])
      toast.success(t('modelProvider.refreshedSuccess', 'Providers refreshed successfully'))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to refresh providers')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Group credentials by integrationID
  const credentialsByIntegration = useMemo(() => {
    const map = new Map<string, typeof credentials>()
    if (Array.isArray(credentials)) {
      for (const cred of credentials) {
        const list = map.get(cred.integrationID) || []
        list.push(cred)
        map.set(cred.integrationID, list)
      }
    }
    return map
  }, [credentials])

  // Set of connected integration IDs
  const connectedProviderIds = useMemo(() => {
    const ids = new Set<string>()
    for (const [id, creds] of credentialsByIntegration.entries()) {
      if (creds && creds.length > 0) {
        ids.add(id)
      }
    }
    return ids
  }, [credentialsByIntegration])

  // Complete master catalog of all available providers
  const allProvidersMap = useMemo(() => {
    const map = new Map<string, ProviderItem>()

    // Load standard known providers
    for (const kp of KNOWN_PROVIDERS) {
      map.set(kp.id, kp)
    }

    // Overlay dynamically loaded integrations from OpenCode server
    if (integrations && Array.isArray(integrations)) {
      for (const item of integrations) {
        const displayName =
          item.id === 'google' ? 'Gemini' : item.name || item.id
        map.set(item.id, {
          id: item.id,
          name: displayName,
          description: item.description,
          methods: item.methods,
        })
      }
    }

    return map
  }, [integrations])

  const allProvidersList = useMemo(() => {
    return Array.from(allProvidersMap.values())
  }, [allProvidersMap])

  // 1. Connected Providers (always displayed prominently)
  const connectedProviders = useMemo(() => {
    const list: ProviderItem[] = []
    for (const id of connectedProviderIds) {
      const p = allProvidersMap.get(id) || { id, name: id }
      list.push(p)
    }
    return list
  }, [connectedProviderIds, allProvidersMap])

  // 2. Popular Providers (that are not already connected)
  const popularUnconnectedProviders = useMemo(() => {
    const list: ProviderItem[] = []
    for (const id of popularProviders) {
      if (!connectedProviderIds.has(id)) {
        const p = allProvidersMap.get(id) || {
          id,
          name: id === 'google' ? 'Gemini' : id,
        }
        list.push(p)
      }
    }
    return list
  }, [connectedProviderIds, allProvidersMap])

  // Search filtering
  const query = search.toLowerCase().trim()

  const filteredConnected = useMemo(() => {
    if (!query) return connectedProviders
    return connectedProviders.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query)
    )
  }, [connectedProviders, query])

  const filteredPopular = useMemo(() => {
    if (!query) return popularUnconnectedProviders
    return popularUnconnectedProviders.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query)
    )
  }, [popularUnconnectedProviders, query])

  const isAuthError =
    integrationsError instanceof Error &&
    integrationsError.message.toLowerCase().includes('authentication')

  const hasAnyResults = filteredConnected.length > 0 || filteredPopular.length > 0

  return (
    <div className='w-full space-y-7 pb-12'>
      {/* Page Title & Top Action Toolbar */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-5'>
        <div>
          <h2 className='text-xl font-bold tracking-tight'>
            {t('modelProvider.aiProvidersTitle', 'AI Model Providers')}
          </h2>
          <p className='text-sm text-muted-foreground mt-0.5'>
            {t(
              'modelProvider.aiProvidersDesc',
              'Connect your API keys from Anthropic, OpenAI, Google, and other AI services.'
            )}
          </p>
        </div>

        <div className='flex items-center gap-2 flex-wrap'>
          {/* Add Provider Button - opens catalog */}
          <Button
            size='sm'
            className='gap-1.5 text-xs h-8 font-medium'
            onClick={() => setAllProvidersDialogOpen(true)}
          >
            <Plus className='h-3.5 w-3.5' />
            {t('modelProvider.addProvider', 'Add Provider')}
          </Button>

          <Button
            variant='outline'
            size='sm'
            className='gap-1.5 text-xs h-8'
            onClick={() => setServerConfigOpen(true)}
          >
            <Server className='h-3.5 w-3.5' />
            {t('modelProvider.serverSettings', 'Server Settings')}
          </Button>

          <Button
            variant='outline'
            size='sm'
            className='gap-1.5 text-xs h-8'
            onClick={handleRefresh}
            disabled={isRefreshing || isIntegrationsLoading}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                isRefreshing || isIntegrationsLoading ? 'animate-spin' : ''
              }`}
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
              'OpenCode Server requires authentication password'
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

      {/* General Connection Error Banner */}
      {isIntegrationsError && !isAuthError && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>
            {t('modelProvider.serverConnectionError', 'Server Connection Error')}
          </AlertTitle>
          <AlertDescription className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs mt-1'>
            <span>
              Could not connect to OpenCode server at{' '}
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

      {/* Search Filter Bar */}
      <div className='flex items-center justify-between gap-3'>
        <div className='relative w-full max-w-sm'>
          <Search className='pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground' />
          <Input
            type='search'
            name='ai-provider-search-query'
            id='ai-provider-search-query'
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            spellCheck={false}
            data-1p-ignore
            data-lpignore='true'
            data-bwignore='true'
            data-form-type='other'
            placeholder={t(
              'modelProvider.searchProviders',
              'Search connected & popular providers...'
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
      </div>

      {/* SECTION 1: Connected Providers */}
      {filteredConnected.length > 0 && (
        <div className='space-y-3.5'>
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1.5'>
              <CheckCircle2 className='h-4 w-4 text-emerald-500' />
              <h3 className='text-sm font-semibold tracking-tight text-foreground'>
                {t('modelProvider.connectedProviders', 'Connected Providers')}
              </h3>
            </div>
            <Badge
              variant='secondary'
              className='h-5 px-1.5 text-[11px] font-normal border border-border/50'
            >
              {filteredConnected.length}
            </Badge>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'>
            {filteredConnected.map((provider) => {
              const creds = credentialsByIntegration.get(provider.id) || []
              return (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  credentials={creds}
                  onOpenSettings={() => setActiveProviderForSheet(provider)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: Popular Providers */}
      {(filteredPopular.length > 0 || !query) && (
        <div className='space-y-3.5 pt-1'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1.5'>
              <Sparkles className='h-4 w-4 text-amber-500' />
              <h3 className='text-sm font-semibold tracking-tight text-foreground'>
                {t('modelProvider.popularProviders', 'Popular Providers')}
              </h3>
            </div>
            <span className='text-xs text-muted-foreground hidden sm:inline'>
              {t(
                'modelProvider.popularProvidersDesc',
                'Quickly connect to popular foundation AI models and platforms.'
              )}
            </span>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'>
            {filteredPopular.map((provider) => {
              const creds = credentialsByIntegration.get(provider.id) || []
              return (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  credentials={creds}
                  onOpenSettings={() => setActiveProviderForSheet(provider)}
                />
              )
            })}

            {/* Special Card: + Add Other Provider at the end of the list */}
            {!query && (
              <Card
                onClick={() => setAllProvidersDialogOpen(true)}
                className='group flex flex-row items-center justify-center p-6 border-dashed border-border/80 hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer text-left'
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-border group-hover:border-primary/60 group-hover:bg-primary/10 transition-colors mb-2'>
                  <Plus className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors' />
                </div>
                <span className='text-xs font-semibold text-foreground group-hover:text-primary transition-colors'>
                  {t('modelProvider.addOtherProvider', 'Add Other Provider')}
                </span>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Empty State when Search yields no results */}
      {!hasAnyResults && (
        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-border/70 p-12 text-center text-muted-foreground'>
          <Bot className='mb-2 h-10 w-10 text-muted-foreground/60' />
          <p className='text-sm font-medium'>
            {t(
              'modelProvider.noProvidersFound',
              'No providers found matching your search.'
            )}
          </p>
          <Button
            variant='outline'
            size='sm'
            className='mt-3 gap-1.5 text-xs'
            onClick={() => setAllProvidersDialogOpen(true)}
          >
            <Search className='h-3.5 w-3.5' />
            {t(
              'modelProvider.searchInAllCatalog',
              'Search all providers in catalog'
            )}
          </Button>
        </div>
      )}

      {/* Lifted ManageKeysSheet: only 1 instance exists in DOM */}
      {activeProviderForSheet && (
        <ManageKeysSheet
          open={Boolean(activeProviderForSheet)}
          onOpenChange={(open) => {
            if (!open) setActiveProviderForSheet(null)
          }}
          provider={activeProviderForSheet}
          credentials={credentialsByIntegration.get(activeProviderForSheet.id) || []}
        />
      )}

      {/* All Providers Catalog Search Dialog */}
      <AllProvidersDialog
        open={allProvidersDialogOpen}
        onOpenChange={setAllProvidersDialogOpen}
        providers={allProvidersList}
        connectedProviderIds={connectedProviderIds}
        onSelectProvider={(p) => setActiveProviderForSheet(p)}
      />

      {/* Server Config Dialog */}
      <ServerConfigDialog
        open={serverConfigOpen}
        onOpenChange={setServerConfigOpen}
      />
    </div>
  )
}
