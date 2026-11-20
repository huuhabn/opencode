import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ManageKeysSheet } from './manage-keys-sheet'
import { ProviderIcon } from './provider-icon'
import type { CredentialEntryItem } from './account-list'

export interface ProviderItem {
  id: string
  name: string
  description?: string
  methods?: Array<{ type: string; id?: string }>
}

interface ProviderCardProps {
  provider: ProviderItem
  credentials: CredentialEntryItem[]
}

export function ProviderCard({ provider, credentials }: ProviderCardProps) {
  const { t } = useTranslation(['model-provider', 'common'])
  const [sheetOpen, setSheetOpen] = useState(false)

  const isConnected = credentials.length > 0
  const storageKey = `opencode_provider_enabled_${provider.id}`

  const [isEnabled, setIsEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(`opencode_provider_enabled_${provider.id}`)
      if (saved !== null) {
        return Boolean(JSON.parse(saved))
      }
    } catch {
      // fallback
    }
    return isConnected
  })

  const handleToggle = (checked: boolean) => {
    if (!isConnected && checked) {
      setSheetOpen(true)
      return
    }
    setIsEnabled(checked)
    try {
      localStorage.setItem(storageKey, JSON.stringify(checked))
    } catch {
      // ignore
    }
  }

  // Use "Gemini" for Google as requested
  const displayName =
    provider.id.toLowerCase() === 'google' ||
    provider.id.toLowerCase().includes('gemini') ||
    provider.name.toLowerCase().includes('google')
      ? 'Gemini'
      : provider.name

  return (
    <>
      <Card
        onClick={() => setSheetOpen(true)}
        className='group relative flex flex-row cursor-pointer items-center gap-2.5 rounded-xl border border-border/70 bg-card p-2.5 transition-all duration-200 hover:border-primary/40 hover:shadow-xs'
      >
        {/* [Icon 36px] */}
        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/30 p-1 transition-colors group-hover:bg-muted/50'>
          <ProviderIcon providerId={provider.id} size={22} />
        </div>

        {/* 2 dòng: [Tên Provider] + [Toggle Switch] bên trên, bên dưới [Badge trạng thái] */}
        <div className='flex min-w-0 flex-1 flex-col justify-center'>
          {/* Dòng 1: [Tên Provider] + [Toggle Switch] */}
          <div className='flex items-center justify-between gap-1.5'>
            <h3
              className='truncate text-sm font-semibold text-foreground leading-tight'
              title={displayName}
            >
              {displayName}
            </h3>

            <div
              className='shrink-0'
              onClick={(e) => e.stopPropagation()}
            >
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggle}
                className='scale-80 origin-right data-[state=checked]:bg-primary'
              />
            </div>
          </div>

          {/* Dòng 2: [Badge trạng thái (Connected / Not configured)] */}
          <div className='mt-1 flex items-center'>
            {isConnected ? (
              <div className='inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400'>
                <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                <span className='truncate'>
                  {credentials.length}{' '}
                  {t('modelProvider.connected', 'Connected')}
                </span>
              </div>
            ) : (
              <div className='inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground'>
                <span className='truncate'>
                  {t('modelProvider.notConfigured', 'Not configured')}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      <ManageKeysSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        provider={{
          ...provider,
          name: displayName,
        }}
        credentials={credentials}
      />
    </>
  )
}
