import { useState } from 'react'
import { Check, CheckCircle2, MoreVertical, Pencil, Trash2, Play, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useActivateCredential,
  useRemoveCredential,
  useUpdateCredential,
} from '../api'
import { testApiKey } from '../lib/test-key'

export interface CredentialEntryItem {
  id: string
  integrationID: string
  label: string
  active?: boolean
  value?: {
    type?: string
    key?: string
  }
}

interface AccountListProps {
  credentials: CredentialEntryItem[]
  integrationName: string
}

export function AccountList({
  credentials,
  integrationName,
}: AccountListProps) {
  const activateCred = useActivateCredential()
  const removeCred = useRemoveCredential()
  const updateCred = useUpdateCredential()

  const [renameTarget, setRenameTarget] = useState<CredentialEntryItem | null>(
    null
  )
  const [deleteTarget, setDeleteTarget] = useState<CredentialEntryItem | null>(
    null
  )
  const [newLabel, setNewLabel] = useState('')
  const [testingId, setTestingId] = useState<string | null>(null)

  const handleTestAccount = async (account: CredentialEntryItem) => {
    const rawKey = account.value?.key
    if (!rawKey) {
      toast.info('API key secret is not accessible for testing.')
      return
    }
    setTestingId(account.id)
    toast.loading(`Testing ${integrationName} connection...`, { id: `test-${account.id}` })
    const res = await testApiKey(account.integrationID, rawKey)
    setTestingId(null)
    if (res.ok) {
      toast.success(res.message, { id: `test-${account.id}` })
    } else {
      toast.error(res.message, { id: `test-${account.id}` })
    }
  }

  const handleActivate = async (id: string, label: string) => {
    try {
      await activateCred.mutateAsync(id)
      toast.success(`Switched active account to "${label}"`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to switch account'
      )
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await removeCred.mutateAsync(deleteTarget.id)
      toast.success(`Removed connection "${deleteTarget.label}"`)
      setDeleteTarget(null)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to remove connection'
      )
    }
  }

  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!renameTarget || !newLabel.trim()) return
    try {
      await updateCred.mutateAsync({
        credentialID: renameTarget.id,
        label: newLabel.trim(),
      })
      toast.success('Account renamed successfully')
      setRenameTarget(null)
      setNewLabel('')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to rename account'
      )
    }
  }

  if (credentials.length === 0) {
    return (
      <div className='py-2 text-xs text-muted-foreground italic'>
        No accounts connected yet.
      </div>
    )
  }

  return (
    <>
      <div className='space-y-2 pt-2'>
        {credentials.map((account) => (
          <div
            key={account.id}
            className='flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm'
          >
            <div className='flex items-center gap-2'>
              {account.active ? (
                <CheckCircle2 className='h-4 w-4 text-emerald-500' />
              ) : (
                <div className='h-4 w-4 rounded-full border border-muted-foreground/40' />
              )}
              <span className='font-medium'>{account.label || 'Default'}</span>
              {account.active && (
                <Badge
                  variant='outline'
                  className='border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400'
                >
                  Active
                </Badge>
              )}
            </div>

            <div className='flex items-center gap-1'>
              {!account.active && (
                <Button
                  size='sm'
                  variant='ghost'
                  className='h-7 text-xs text-muted-foreground hover:text-foreground'
                  onClick={() => handleActivate(account.id, account.label)}
                  disabled={activateCred.isPending}
                >
                  <Check className='mr-1 h-3 w-3' />
                  Use
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size='icon' variant='ghost' className='h-7 w-7'>
                    <MoreVertical className='h-3.5 w-3.5' />
                    <span className='sr-only'>Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-40'>
                  {account.value?.key && (
                    <DropdownMenuItem
                      onClick={() => handleTestAccount(account)}
                      disabled={testingId === account.id}
                    >
                      {testingId === account.id ? (
                        <Loader2 className='mr-2 h-3.5 w-3.5 animate-spin' />
                      ) : (
                        <Play className='mr-2 h-3.5 w-3.5 fill-current' />
                      )}
                      Test Connection
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      setRenameTarget(account)
                      setNewLabel(account.label)
                    }}
                  >
                    <Pencil className='mr-2 h-3.5 w-3.5' />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className='text-destructive focus:text-destructive'
                    onClick={() => setDeleteTarget(account)}
                  >
                    <Trash2 className='mr-2 h-3.5 w-3.5' />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Rename Dialog */}
      <Dialog
        open={renameTarget !== null}
        onOpenChange={(open) => !open && setRenameTarget(null)}
      >
        <DialogContent className='sm:max-w-[400px]'>
          <form onSubmit={handleSaveRename}>
            <DialogHeader>
              <DialogTitle>Rename Account</DialogTitle>
              <DialogDescription>
                Change the label for this {integrationName} credential.
              </DialogDescription>
            </DialogHeader>

            <div className='py-4'>
              <Label htmlFor='edit-label' className='mb-2 block'>
                Account Label
              </Label>
              <Input
                id='edit-label'
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                autoFocus
                required
              />
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setRenameTarget(null)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={updateCred.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && !removeCred.isPending && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Connection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove connection &quot;{deleteTarget?.label}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeCred.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: 'destructive' })}
              onClick={(e) => {
                e.preventDefault()
                handleConfirmDelete()
              }}
              disabled={removeCred.isPending}
            >
              {removeCred.isPending && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
