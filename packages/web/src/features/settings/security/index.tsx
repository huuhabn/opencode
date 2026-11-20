import { useState } from 'react'
import { Monitor, Smartphone, Tablet, ShieldCheck, ShieldAlert, LogOut, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { INITIAL_SESSIONS, INITIAL_LOGIN_ACTIVITY, type SessionItem } from './data'

export function SecuritySettings() {
  const [sessions, setSessions] = useState<SessionItem[]>(INITIAL_SESSIONS)
  const [isRevokeOtherOpen, setIsRevokeOtherOpen] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleRevokeSingle = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    toast.success('Session logged out successfully')
  }

  const handleRevokeAllOthers = () => {
    if (!confirmPassword.trim()) {
      toast.error('Please enter your password to confirm session revocation')
      return
    }
    setSessions((prev) => prev.filter((s) => s.isCurrent))
    setIsRevokeOtherOpen(false)
    setConfirmPassword('')
    toast.success('All other browser sessions have been logged out')
  }

  const getDeviceIcon = (device: SessionItem['device']) => {
    switch (device) {
      case 'mobile':
        return <Smartphone className='size-5 text-primary' />
      case 'tablet':
        return <Tablet className='size-5 text-primary' />
      default:
        return <Monitor className='size-5 text-primary' />
    }
  }

  return (
    <div className='space-y-6 w-full'>
      <div>
        <h2 className='text-lg font-semibold tracking-tight'>Security & Active Sessions</h2>
        <p className='text-sm text-muted-foreground'>
          Manage devices currently signed into your account and review recent authentication events.
        </p>
      </div>

      {/* ACTIVE SESSIONS CARD */}
      <Card className='shadow-sm'>
        <CardHeader className='flex flex-row items-start justify-between pb-3'>
          <div>
            <CardTitle className='text-base flex items-center gap-2'>
              <ShieldCheck className='size-4 text-emerald-500' />
              Signed-in Devices ({sessions.length})
            </CardTitle>
            <CardDescription>
              If you notice any unfamiliar devices or locations, revoke them immediately and update your password.
            </CardDescription>
          </div>
          {sessions.length > 1 && (
            <Button
              variant='outline'
              size='sm'
              className='text-destructive hover:text-destructive'
              onClick={() => setIsRevokeOtherOpen(true)}
            >
              <LogOut className='size-4 mr-1.5' /> Log out other devices
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className='flex items-center justify-between p-3.5 border rounded-lg bg-card shadow-2xs flex-wrap gap-3'
              >
                <div className='flex items-center gap-3.5'>
                  <div className='p-2.5 rounded-full bg-muted/60'>
                    {getDeviceIcon(sess.device)}
                  </div>
                  <div className='space-y-0.5'>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-sm'>
                        {sess.browser} on {sess.os}
                      </span>
                      {sess.isCurrent && (
                        <Badge className='text-[10px] bg-emerald-500/10 text-emerald-600 font-semibold'>
                          This Device
                        </Badge>
                      )}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {sess.ipAddress} • {sess.location} •{' '}
                      <span className={sess.isCurrent ? 'text-emerald-600 font-medium' : ''}>
                        {sess.lastActive}
                      </span>
                    </p>
                  </div>
                </div>

                {!sess.isCurrent && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-xs text-destructive hover:text-destructive'
                    onClick={() => handleRevokeSingle(sess.id)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* LOGIN ACTIVITY HISTORY */}
      <Card className='shadow-sm'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base'>Recent Login Activity</CardTitle>
          <CardDescription>
            Historical logs of successful and failed authentication attempts over the last 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Time (UTC)</TableHead>
                <TableHead>Client & OS</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Auth Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INITIAL_LOGIN_ACTIVITY.map((act) => (
                <TableRow key={act.id}>
                  <TableCell>
                    {act.status === 'success' ? (
                      <Badge variant='secondary' className='text-[10px] gap-1 bg-emerald-500/10 text-emerald-600'>
                        <CheckCircle2 className='size-3 text-emerald-500' /> Success
                      </Badge>
                    ) : (
                      <Badge variant='secondary' className='text-[10px] gap-1 bg-rose-500/10 text-rose-600'>
                        <XCircle className='size-3 text-rose-500' /> Failed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className='text-xs font-mono'>{act.timestamp}</TableCell>
                  <TableCell className='text-xs font-medium'>{act.device}</TableCell>
                  <TableCell className='text-xs font-mono text-muted-foreground'>{act.ipAddress}</TableCell>
                  <TableCell className='text-xs text-muted-foreground'>{act.location}</TableCell>
                  <TableCell className='text-xs capitalize'>{act.authMethod.replace('_', ' ')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* REVOKE ALL CONFIRMATION DIALOG */}
      <Dialog open={isRevokeOtherOpen} onOpenChange={setIsRevokeOtherOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-destructive'>
              <ShieldAlert className='size-5' />
              Log Out of Other Sessions?
            </DialogTitle>
            <DialogDescription>
              Please enter your account password to confirm that you want to sign out of all other browsers and devices.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-2 py-2'>
            <Label htmlFor='pwd-confirm' className='text-xs'>Your Password</Label>
            <Input
              id='pwd-confirm'
              type='password'
              placeholder='Enter your password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsRevokeOtherOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleRevokeAllOthers}>
              Log out other devices
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
