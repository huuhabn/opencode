import { useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useConnectKey } from '../api'
import { testApiKey, type TestKeyResult } from '../lib/test-key'
import { ProviderIcon } from './provider-icon'

interface ConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  integrationID: string
  integrationName: string
}

export function ConnectDialog({
  open,
  onOpenChange,
  integrationID,
  integrationName,
}: ConnectDialogProps) {
  const { t } = useTranslation(['model-provider', 'common'])
  const [key, setKey] = useState('')
  const [label, setLabel] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestKeyResult | null>(null)

  const connectKey = useConnectKey()

  const handleTestKey = async () => {
    if (!key.trim()) {
      toast.error(
        t('modelProvider.apiKeyTestEmptyError', 'Please enter an API Key to test')
      )
      return
    }
    setIsTesting(true)
    setTestResult(null)
    const res = await testApiKey(integrationID, key)
    setIsTesting(false)
    setTestResult(res)
    if (res.ok) {
      toast.success(res.message)
    } else {
      toast.error(res.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!key.trim()) {
      toast.error(
        t('modelProvider.apiKeyEmptyError', 'API Key cannot be empty')
      )
      return
    }

    try {
      await connectKey.mutateAsync({
        integrationID,
        key: key.trim(),
        label: label.trim() || undefined,
      })
      toast.success(
        t('modelProvider.connectedSuccess', {
          defaultValue: `Connected ${integrationName} successfully`,
          name: integrationName,
        })
      )
      setKey('')
      setLabel('')
      setTestResult(null)
      onOpenChange(false)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : `Failed to connect ${integrationName}`
      )
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setTestResult(null)
        }
        onOpenChange(next)
      }}
    >
      <DialogContent className='sm:max-w-[440px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <ProviderIcon providerId={integrationID} size={22} />
              {t('modelProvider.connectProvider', {
                name: integrationName,
                defaultValue: `Connect ${integrationName}`,
              })}
            </DialogTitle>
            <DialogDescription>
              {t('modelProvider.connectProviderDesc', {
                name: integrationName,
                defaultValue: `Enter your API Key to enable ${integrationName} models in your platform.`,
              })}
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='api-key'>{t('modelProvider.apiKey')} *</Label>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={handleTestKey}
                  disabled={isTesting || !key.trim()}
                  className='h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground'
                >
                  {isTesting ? (
                    <Loader2 className='mr-1 h-3 w-3 animate-spin' />
                  ) : (
                    <Play className='mr-1 h-3 w-3 fill-current text-emerald-500' />
                  )}
                  {t('modelProvider.testKey')}
                </Button>
              </div>
              <Input
                id='api-key'
                type='password'
                placeholder='sk-...'
                value={key}
                onChange={(e) => {
                  setKey(e.target.value)
                  setTestResult(null)
                }}
                autoComplete='off'
                autoFocus
                required
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='account-label'>
                {t('modelProvider.accountLabel')}
              </Label>
              <Input
                id='account-label'
                placeholder={t(
                  'modelProvider.accountLabelPlaceholder',
                  'e.g. Work, Personal, Production'
                )}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            {testResult && (
              <div
                className={`flex items-start gap-2 rounded-md p-2.5 text-xs ${
                  testResult.ok
                    ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border border-destructive/30 bg-destructive/10 text-destructive'
                }`}
              >
                {testResult.ok ? (
                  <CheckCircle2 className='h-4 w-4 shrink-0 text-emerald-500' />
                ) : (
                  <AlertCircle className='h-4 w-4 shrink-0' />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              {t('common:operation.cancel', 'Cancel')}
            </Button>
            <Button type='submit' disabled={connectKey.isPending}>
              {connectKey.isPending && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              {t('modelProvider.saveKey')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
