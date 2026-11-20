import { useState, useMemo } from 'react'
import {
  Activity,
  UserPlus,
  Shield,
  Key,
  Webhook,
  Zap,
  Building,
  Settings,
  Download,
  Filter,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'
import { DashboardPage } from '@/components/layout/dashboard-page'
import { useCurrentWorkspace } from '@/features/workspaces/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { INITIAL_ACTIVITY_LOGS, type ActivityLogItem } from './data'

export function WorkspaceActivityPage() {
  const currentWorkspace = useCurrentWorkspace()
  const [logs] = useState<ActivityLogItem[]>(INITIAL_ACTIVITY_LOGS)
  const [filterAction, setFilterAction] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesAction = filterAction === 'all' || log.action === filterAction
      const matchesQuery =
        searchQuery === '' ||
        log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actor.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesAction && matchesQuery
    })
  }, [logs, filterAction, searchQuery])

  const getActionIcon = (action: ActivityLogItem['action']) => {
    switch (action) {
      case 'plan_upgraded':
        return <Zap className='size-4 text-amber-500' />
      case 'api_key_created':
        return <Key className='size-4 text-primary' />
      case 'webhook_added':
        return <Webhook className='size-4 text-indigo-500' />
      case 'member_invited':
        return <UserPlus className='size-4 text-emerald-500' />
      case 'role_updated':
        return <Shield className='size-4 text-blue-500' />
      case 'workspace_created':
        return <Building className='size-4 text-purple-500' />
      default:
        return <Settings className='size-4 text-muted-foreground' />
    }
  }

  const getActionBadgeColor = (action: ActivityLogItem['action']) => {
    switch (action) {
      case 'plan_upgraded':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      case 'api_key_created':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'webhook_added':
        return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
      case 'member_invited':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      case 'role_updated':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <DashboardPage
      title='Activity & Audit Log'
      description={`Review all administrative modifications, membership updates, and security events for ${currentWorkspace?.name ?? 'workspace'}.`}
    >
      <div className='space-y-6'>
        {/* FILTERS TOOLBAR */}
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-3 w-full sm:w-auto'>
            <div className='relative w-full sm:w-72'>
              <Search className='absolute left-2.5 top-2.5 size-4 text-muted-foreground' />
              <Input
                placeholder='Search events or members...'
                className='pl-8 text-xs'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className='w-44 text-xs h-9'>
                <Filter className='size-3.5 mr-1.5' />
                <SelectValue placeholder='All Events' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Events</SelectItem>
                <SelectItem value='plan_upgraded'>Billing & Plans</SelectItem>
                <SelectItem value='member_invited'>Member Invites</SelectItem>
                <SelectItem value='role_updated'>Role Changes</SelectItem>
                <SelectItem value='api_key_created'>API Keys</SelectItem>
                <SelectItem value='webhook_added'>Webhooks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant='outline'
            size='sm'
            onClick={() => toast.info('Exporting workspace audit trail to CSV...')}
            className='shrink-0'
          >
            <Download className='size-3.5 mr-1.5' /> Export Trail (CSV)
          </Button>
        </div>

        {/* TIMELINE FEED */}
        <Card className='shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base flex items-center gap-2'>
              <Activity className='size-4 text-primary' /> Workspace Event Stream ({filteredLogs.length})
            </CardTitle>
            <CardDescription>
              Audit trail retained according to your current workspace subscription plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <p className='text-center py-10 text-muted-foreground text-sm'>
                No matching events found for current filter.
              </p>
            ) : (
              <div className='relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border'>
                {filteredLogs.map((log) => {
                  const initials = log.actor.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)

                  return (
                    <div key={log.id} className='relative flex items-start gap-4'>
                      {/* Timeline dot with icon */}
                      <div className='absolute -left-6 mt-1 flex size-6 items-center justify-center rounded-full bg-background border-2 border-primary/30 ring-4 ring-background'>
                        {getActionIcon(log.action)}
                      </div>

                      {/* Content block */}
                      <div className='flex-1 rounded-lg border bg-card p-4 shadow-2xs space-y-2'>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-1'>
                          <div className='flex items-center gap-2'>
                            <span className='font-semibold text-sm'>{log.title}</span>
                            <Badge
                              variant='outline'
                              className={`text-[10px] capitalize ${getActionBadgeColor(log.action)}`}
                            >
                              {log.action.replace('_', ' ')}
                            </Badge>
                          </div>
                          <span className='text-xs text-muted-foreground' title={log.timestamp}>
                            {log.relativeTime}
                          </span>
                        </div>

                        <p className='text-xs text-muted-foreground leading-relaxed'>
                          {log.description}
                        </p>

                        <div className='flex items-center gap-2 pt-1 border-t text-[11px] text-muted-foreground'>
                          <Avatar className='size-5'>
                            <AvatarFallback className='text-[9px] bg-primary/10 text-primary'>
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            Triggered by <strong className='text-foreground font-medium'>{log.actor.name}</strong> ({log.actor.email})
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardPage>
  )
}
