import { useState } from 'react'
import { Server, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
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
import {
  getServerConfig,
  setServerConfig,
  verifyServerConnection,
} from '@/lib/agent-platform-client'
import { providerQueryKeys } from '../api'

interface ServerConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ServerConfigDialog({
  open,
  onOpenChange,
}: ServerConfigDialogProps) {
  const { t } = useTranslation(['model-provider', 'common'])
  const current = getServerConfig()
  const [url, setUrl] = useState(current.serverUrl)
  const [password, setPassword] = useState(current.serverPassword)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyStatus, setVerifyStatus] = useState<{
    ok: boolean
    message: string
  } | null>(null)

  const queryClient = useQueryClient()

  const handleTest = async () => {
    setIsVerifying(true)
    setVerifyStatus(null)
    const res = await verifyServerConnection(url, password)
    setIsVerifying(false)
    setVerifyStatus(res)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerConfig(url, password)
    toast.success(t('modelProvider.serverSaved', 'OpenCode Server settings saved'))
    queryClient.invalidateQueries({ queryKey: providerQueryKeys.integrations })
    queryClient.invalidateQueries({ queryKey: providerQueryKeys.credentials })
    queryClient.invalidateQueries({ queryKey: providerQueryKeys.models })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[460px]'>
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Server className='h-5 w-5 text-primary' />
              {t('modelProvider.serverSettingsTitle', 'OpenCode Server Connection')}
            </DialogTitle>
            <DialogDescription>
              {t(
                'modelProvider.serverSettingsDesc',
                'Configure the connection to your local or remote OpenCode backend server.'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='server-url'>{t('modelProvider.serverUrl')} *</Label>
              <Input
                id='server-url'
                placeholder='http://127.0.0.1:49375'
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setVerifyStatus(null)
                }}
                required
              />
              <span className='text-[11px] text-muted-foreground'>
                {t(
                  'modelProvider.serverUrlHelp',
                  'Default port for OpenCode service is typically 49375 or 4096.'
                )}
              </span>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='server-password'>
                {t('modelProvider.serverPassword')}
              </Label>
              <Input
                id='server-password'
                type='password'
                placeholder={t(
                  'modelProvider.serverPasswordPlaceholder',
                  'Enter server password'
                )}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setVerifyStatus(null)
                }}
              />
              <span className='text-[11px] text-muted-foreground'>
                {t('modelProvider.serverPasswordHelp', 'Obtain via')}{' '}
                <code className='rounded bg-muted px-1 font-mono text-[10px]'>
                  bun run dev service get password
                </code>
              </span>
            </div>

            {verifyStatus && (
              <div
                className={`flex items-start gap-2 rounded-md p-2.5 text-xs ${
                  verifyStatus.ok
                    ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border border-destructive/30 bg-destructive/10 text-destructive'
                }`}
              >
                {verifyStatus.ok ? (
                  <CheckCircle2 className='h-4 w-4 shrink-0 text-emerald-500' />
                ) : (
                  <AlertCircle className='h-4 w-4 shrink-0' />
                )}
                <span>{verifyStatus.message}</span>
              </div>
            )}
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={handleTest}
              disabled={isVerifying || !url.trim()}
              className='mr-auto'
            >
              {isVerifying ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              {t('modelProvider.testConnection')}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              {t('common:operation.cancel', 'Cancel')}
            </Button>
            <Button type='submit'>
              {t('common:operation.save', 'Save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
