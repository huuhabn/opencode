import { useMemo, useState } from 'react'
import {
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Edit2,
  Trash2,
  Copy,
  GitFork,
  RefreshCw,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useModels } from '@/features/settings/models/api'
import { useUpdateSession, useForkSession, type SessionInfo } from '../api'

interface SessionHeaderProps {
  session: SessionInfo | null
  isRefreshing?: boolean
  isSidebarOpen?: boolean
  isInspectorOpen?: boolean
  onToggleSidebar?: () => void
  onToggleInspector?: () => void
  onRefresh?: () => void
  onDelete?: () => void
}

export function SessionHeader({
  session,
  isRefreshing,
  isSidebarOpen = true,
  isInspectorOpen = true,
  onToggleSidebar,
  onToggleInspector,
  onRefresh,
  onDelete,
}: SessionHeaderProps) {
  const { t, i18n } = useTranslation(['model-provider', 'common'])
  const navigate = useNavigate()
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const updateSessionMutation = useUpdateSession()
  const forkSessionMutation = useForkSession()
  const { data: models = [] } = useModels()

  const title = session?.title || t('session.untitled', 'New Conversation')

  // Same usage summary as packages/gui-plugins SessionContextUsage: tokens + % of context + cost.
  const contextUsage = useMemo(() => {
    const tokens = session?.tokens
    const total =
      (tokens?.input ?? 0) +
      (tokens?.output ?? 0) +
      (tokens?.reasoning ?? 0) +
      (tokens?.cache?.read ?? 0) +
      (tokens?.cache?.write ?? 0)
    const modelId =
      session?.model && typeof session.model !== 'string' ? session.model.id : undefined
    const model = modelId ? models.find((m) => m.id === modelId) : undefined
    const limit = model?.limit?.context ?? 128_000
    const usage = limit > 0 ? Math.min(Math.round((total / limit) * 100), 100) : 0
    const tokensLabel = new Intl.NumberFormat(i18n.language, {
      notation: 'compact',
      maximumFractionDigits: 0,
    })
      .format(total)
      .toLocaleLowerCase(i18n.language)
    const cost = session?.cost ?? 0
    const costLabel = new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'USD',
    }).format(cost)
    return { total, usage, tokensLabel, cost, costLabel, showCost: cost > 0 }
  }, [session?.tokens, session?.model, session?.cost, models, i18n.language])

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href)
        toast.success(t('session.shareSuccess', 'Session link copied to clipboard'))
      }
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleOpenRename = () => {
    if (!session) return
    setNewTitle(title)
    setIsRenameOpen(true)
  }

  const handleRenameSubmit = async () => {
    if (!session || !newTitle.trim()) return
    try {
      await updateSessionMutation.mutateAsync({
        sessionID: session.id,
        title: newTitle.trim(),
      })
      toast.success(t('common.saved', 'Saved'))
      setIsRenameOpen(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('common.error', 'An error occurred'))
    }
  }

  const handleFork = async () => {
    if (!session) return
    try {
      const forked = await forkSessionMutation.mutateAsync(session.id)
      toast.success(t('session.forkSuccess', 'Session forked successfully'))
      if (forked?.id) {
        navigate({ to: '/session/$sessionId', params: { sessionId: forked.id } })
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('common.error', 'An error occurred'))
    }
  }

  return (
    <>
      <div className='flex h-12 shrink-0 items-center justify-between border-b border-border/50 bg-background/95 px-3 select-text z-10'>
        {/* Left: Sidebar Toggle + Title + ... Dropdown */}
        <div className='flex items-center gap-1.5 min-w-0'>
          {onToggleSidebar && (
            <Button
              variant='ghost'
              size='icon'
              onClick={onToggleSidebar}
              className='h-7 w-7 text-muted-foreground hover:text-foreground shrink-0'
              title={isSidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className='h-4 w-4' />
              ) : (
                <PanelLeftOpen className='h-4 w-4' />
              )}
            </Button>
          )}

          <h2
            className='font-semibold text-sm text-foreground truncate max-w-xs sm:max-w-md pl-1'
            title={title}
          >
            {title}
          </h2>

          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7 text-muted-foreground hover:text-foreground'
                  title='More options'
                >
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='w-44 text-xs'>
                <DropdownMenuItem onClick={handleOpenRename}>
                  <Edit2 className='h-3.5 w-3.5 mr-2' />
                  <span>{t('session.rename', 'Rename')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleFork} disabled={forkSessionMutation.isPending}>
                  <GitFork className='h-3.5 w-3.5 mr-2' />
                  <span>{t('session.fork', 'Fork session')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Copy className='h-3.5 w-3.5 mr-2' />
                  <span>{t('session.share', 'Copy Link')}</span>
                </DropdownMenuItem>
                {onRefresh && (
                  <DropdownMenuItem onClick={onRefresh} disabled={isRefreshing}>
                    <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{t('common.refresh', 'Refresh')}</span>
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className='text-destructive focus:text-destructive'
                      onClick={onDelete}
                    >
                      <Trash2 className='h-3.5 w-3.5 mr-2' />
                      <span>{t('common.delete', 'Delete')}</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Right: Toggle session context — same flow as gui-plugins SessionContextUsage */}
        <div className='flex items-center gap-1 shrink-0'>
          {session && onToggleInspector && (
            <Button
              type='button'
              variant='ghost'
              onClick={onToggleInspector}
              aria-expanded={isInspectorOpen}
              aria-label={t('session.toggleContext', 'Toggle session context')}
              title={t('session.toggleContext', 'Toggle session context')}
              className='h-8 shrink-0 gap-2 px-1.5 text-muted-foreground hover:text-foreground'
            >
              <span className='flex items-center gap-2 whitespace-nowrap'>
                <ContextUsageRing percentage={contextUsage.usage} />
                <span className='text-xs tabular-nums'>{contextUsage.tokensLabel}</span>
                {contextUsage.showCost && (
                  <>
                    <span aria-hidden='true' className='flex w-1.5 shrink-0 items-center justify-center'>
                      ·
                    </span>
                    <span className='text-xs tabular-nums'>{contextUsage.costLabel}</span>
                  </>
                )}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{t('session.rename', 'Rename conversation')}</DialogTitle>
          </DialogHeader>
          <div className='py-2'>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder='Enter conversation title...'
              className='text-sm'
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsRenameOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleRenameSubmit}
              disabled={updateSessionMutation.isPending || !newTitle.trim()}
            >
              {t('common.save', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ContextUsageRing({ percentage }: { percentage: number }) {
  const size = 16
  const stroke = 2
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(Math.max(percentage, 0), 100) / 100) * circumference

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className='shrink-0 -rotate-90'
      aria-hidden='true'
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        stroke='currentColor'
        strokeWidth={stroke}
        className='opacity-20'
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        stroke='currentColor'
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap='round'
      />
    </svg>
  )
}
