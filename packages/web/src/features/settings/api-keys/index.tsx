import { useState } from 'react'
import { Key, Plus, Copy, Trash2, Check, Shield, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { INITIAL_API_KEYS, type ApiKeyItem } from './data'

export function ApiKeysSettings() {
  const [keys, setKeys] = useState<ApiKeyItem[]>(INITIAL_API_KEYS)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [selectedScopes, setSelectedScopes] = useState<('read' | 'write' | 'admin')[]>(['read'])
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null)
  const [hasCopied, setHasCopied] = useState(false)

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Please provide a name for this API key')
      return
    }

    const randomSuffix = Array.from({ length: 24 }, () =>
      Math.floor(Math.random() * 36).toString(36)
    ).join('')
    const fullSecretKey = `sk_live_${randomSuffix}`
    const prefix = `sk_live_${randomSuffix.slice(0, 6)}...`

    const newKey: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name: newKeyName.trim(),
      prefix,
      scopes: selectedScopes,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsedAt: 'Never',
      expiresAt: '2027-11-20',
    }

    setKeys((prev) => [newKey, ...prev])
    setGeneratedSecret(fullSecretKey)
    setNewKeyName('')
    setSelectedScopes(['read'])
  }

  const handleCopySecret = () => {
    if (!generatedSecret) return
    navigator.clipboard.writeText(generatedSecret)
    setHasCopied(true)
    toast.success('API key copied to clipboard')
    setTimeout(() => setHasCopied(false), 2500)
  }

  const handleDeleteKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id))
    toast.success('API key revoked successfully')
  }

  return (
    <div className='min-h-0 w-full flex-1 overflow-y-auto scroll-smooth pe-4 pb-12 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-semibold tracking-tight'>Workspace API Keys</h2>
          <p className='text-sm text-muted-foreground'>
            Authenticate programmatic requests to our REST and GraphQL APIs. Keep secrets confidential.
          </p>
        </div>
        <Button onClick={() => { setIsCreateOpen(true); setGeneratedSecret(null); }} size='sm'>
          <Plus className='size-4 mr-1.5' /> Generate Key
        </Button>
      </div>

      <Card className='shadow-sm'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base'>Active Keys</CardTitle>
          <CardDescription>
            Keys with Write or Admin permission should be protected in production environment secrets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key Name</TableHead>
                <TableHead>Secret Prefix</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className='text-right'>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='text-center py-8 text-muted-foreground'>
                    No active API keys found. Click "Generate Key" to create your first credential.
                  </TableCell>
                </TableRow>
              ) : (
                keys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className='font-medium text-xs flex items-center gap-2'>
                      <Key className='size-3.5 text-primary' />
                      {k.name}
                    </TableCell>
                    <TableCell className='font-mono text-xs text-muted-foreground'>
                      {k.prefix}
                    </TableCell>
                    <TableCell>
                      <div className='flex gap-1'>
                        {k.scopes.map((scope) => (
                          <Badge key={scope} variant='outline' className='text-[10px] capitalize'>
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className='text-xs text-muted-foreground'>{k.createdAt}</TableCell>
                    <TableCell className='text-xs text-muted-foreground'>{k.lastUsedAt}</TableCell>
                    <TableCell className='text-right'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 text-destructive hover:text-destructive'
                        onClick={() => handleDeleteKey(k.id)}
                      >
                        <Trash2 className='size-3.5 mr-1' /> Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CREATE API KEY MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Shield className='size-5 text-primary' />
              {generatedSecret ? 'API Key Created' : 'Create New API Key'}
            </DialogTitle>
            <DialogDescription>
              {generatedSecret
                ? 'Make sure to copy your API key now. You will not be able to see it again!'
                : 'Enter a name and specify permissions for this API credential.'}
            </DialogDescription>
          </DialogHeader>

          {generatedSecret ? (
            <div className='space-y-4 py-3'>
              <div className='rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 flex items-start gap-2.5 text-emerald-700 dark:text-emerald-400 text-xs'>
                <AlertTriangle className='size-4 shrink-0 mt-0.5' />
                <span>
                  For security reasons, this secret is only shown once. Save it to your vault immediately.
                </span>
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs'>Your Full Secret Key</Label>
                <div className='flex gap-2'>
                  <Input readOnly value={generatedSecret} className='font-mono text-xs bg-muted/50' />
                  <Button size='sm' onClick={handleCopySecret} className='gap-1.5 shrink-0'>
                    {hasCopied ? <Check className='size-4 text-emerald-400' /> : <Copy className='size-4' />}
                    {hasCopied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className='space-y-4 py-2'>
              <div className='space-y-1.5'>
                <Label htmlFor='key-name' className='text-xs'>Key Description / Name</Label>
                <Input
                  id='key-name'
                  placeholder='e.g. Next.js Production Worker'
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>

              <div className='space-y-2'>
                <Label className='text-xs'>Permission Scopes</Label>
                <div className='grid gap-2 border rounded-md p-3'>
                  <label className='flex items-center gap-2.5 text-xs cursor-pointer'>
                    <Checkbox
                      checked={selectedScopes.includes('read')}
                      onCheckedChange={(checked) =>
                        setSelectedScopes((prev) =>
                          checked ? [...prev, 'read'] : prev.filter((s) => s !== 'read')
                        )
                      }
                    />
                    <div>
                      <p className='font-semibold'>Read access</p>
                      <p className='text-muted-foreground text-[11px]'>Can query resources, users, and tasks</p>
                    </div>
                  </label>
                  <label className='flex items-center gap-2.5 text-xs cursor-pointer'>
                    <Checkbox
                      checked={selectedScopes.includes('write')}
                      onCheckedChange={(checked) =>
                        setSelectedScopes((prev) =>
                          checked ? [...prev, 'write'] : prev.filter((s) => s !== 'write')
                        )
                      }
                    />
                    <div>
                      <p className='font-semibold'>Write access</p>
                      <p className='text-muted-foreground text-[11px]'>Can create, update, and mutate data</p>
                    </div>
                  </label>
                  <label className='flex items-center gap-2.5 text-xs cursor-pointer'>
                    <Checkbox
                      checked={selectedScopes.includes('admin')}
                      onCheckedChange={(checked) =>
                        setSelectedScopes((prev) =>
                          checked ? [...prev, 'admin'] : prev.filter((s) => s !== 'admin')
                        )
                      }
                    />
                    <div>
                      <p className='font-semibold'>Admin access</p>
                      <p className='text-muted-foreground text-[11px]'>Full control over billing and team settings</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {generatedSecret ? (
              <Button onClick={() => setIsCreateOpen(false)} className='w-full'>
                Done
              </Button>
            ) : (
              <Button onClick={handleCreateKey} className='w-full'>
                Create Key
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
