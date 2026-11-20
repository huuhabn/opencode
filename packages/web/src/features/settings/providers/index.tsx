import { useState, useMemo } from 'react'
import { Bot, RefreshCw, Search, AlertCircle, Server } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ProviderCard } from './components/provider-card'
import { ServerConfigDialog } from './components/server-config-dialog'
import { useIntegrations, useCredentials } from './api'
import { getServerConfig } from '@/lib/agent-platform-client'

// Fallback catalog of major providers in case the server list is cold
const KNOWN_PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'google', name: 'Gemini' },
  { id: 'groq', name: 'Groq' },
  { id: 'openrouter', name: 'OpenRouter' },
  { id: 'deepseek', name: 'DeepSeek' },
  { id: 'mistral', name: 'Mistral AI' },
  { id: 'togetherai', name: 'Together AI' },
  { id: 'xai', name: 'xAI' },
  { id: 'cohere', name: 'Cohere' },
]

export function ProvidersSettings() {
  const { t } = useTranslation(['model-provider', 'common'])
  const [search, setSearch] = useState('')
  const [serverConfigOpen, setServerConfigOpen] = useState(false)

  const {
    data: integrations,
    isLoading: isIntegrationsLoading,
    isError: isIntegrationsError,
    error: integrationsError,
    refetch,
  } = useIntegrations()
  const { data: credentials = [] } = useCredentials()

  const serverConfig = getServerConfig()

  const providerList = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>()

    // Load standard known providers
    for (const kp of KNOWN_PROVIDERS) {
      map.set(kp.id, kp)
    }

    // Overlay dynamically loaded integrations from OpenCode
    if (integrations && Array.isArray(integrations)) {
      for (const item of integrations) {
        const displayName =
          item.id === 'google' ? 'Gemini' : item.name || item.id
        map.set(item.id, {
          id: item.id,
          name: displayName,
        })
      }
    }

    const all = Array.from(map.values())
    if (!search.trim()) return all

    const query = search.toLowerCase().trim()
    return all.filter((p) => p.name.toLowerCase().includes(query))
  }, [integrations, search])

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

  const isAuthError =
    integrationsError instanceof Error &&
    integrationsError.message.toLowerCase().includes('authentication')

  return (
    <div className='min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden scroll-smooth pe-2 sm:pe-4 pb-12 space-y-6'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-lg font-semibold tracking-tight'>
            {t('modelProvider.aiProvidersTitle', 'AI Model Providers')}
          </h2>
          <p className='text-sm text-muted-foreground'>
            {t(
              'modelProvider.aiProvidersDesc',
              'Connect your API keys from Anthropic, OpenAI, Google, and other AI services.'
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
            onClick={() => refetch()}
            disabled={isIntegrationsLoading}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                isIntegrationsLoading ? 'animate-spin' : ''
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
                opencode service get password
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

      {/* Search Filter */}
      <div className='relative max-w-sm'>
        <Search className='absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground' />
        <Input
          placeholder={t(
            'modelProvider.searchProviders',
            'Search providers...'
          )}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='ps-9 h-9 text-xs'
        />
      </div>

      {/* Providers Grid - 4 Columns on Large Screens */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'>
        {providerList.map((provider) => {
          const creds = credentialsByIntegration.get(provider.id) || []
          return (
            <ProviderCard
              key={provider.id}
              provider={provider}
              credentials={creds}
            />
          )
        })}
      </div>

      {providerList.length === 0 && (
        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-border/70 p-12 text-center text-muted-foreground'>
          <Bot className='mb-2 h-10 w-10 text-muted-foreground/60' />
          <p className='text-sm font-medium'>
            {t(
              'modelProvider.noProvidersFound',
              'No providers found matching your search.'
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
