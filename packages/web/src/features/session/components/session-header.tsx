import { useState } from 'react'
import {
  MoreHorizontal,
  Share2,
  LayoutGrid,
  PanelRightClose,
  PanelRightOpen,
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
  const { t } = useTranslation(['model-provider', 'common'])
  const navigate = useNavigate()
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const updateSessionMutation = useUpdateSession()
  const forkSessionMutation = useForkSession()

  const title = session?.title || t('session.untitled', 'New Conversation')

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

        {/* Right Actions: Share, Grid/Split, Inspector toggle */}
        <div className='flex items-center gap-1 shrink-0'>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleShare}
            className='h-8 w-8 text-muted-foreground hover:text-foreground'
            title={t('session.share', 'Share')}
          >
            <Share2 className='h-4 w-4' />
          </Button>

          <Button
            variant='ghost'
            size='icon'
            onClick={() => toast.info('Grid layout mode')}
            className='h-8 w-8 text-muted-foreground hover:text-foreground'
            title='Grid view'
          >
            <LayoutGrid className='h-4 w-4' />
          </Button>

          {onToggleInspector && (
            <Button
              variant='ghost'
              size='icon'
              onClick={onToggleInspector}
              className='h-8 w-8 text-muted-foreground hover:text-foreground'
              title={isInspectorOpen ? 'Collapse inspector' : 'Open inspector'}
            >
              {isInspectorOpen ? (
                <PanelRightClose className='h-4 w-4' />
              ) : (
                <PanelRightOpen className='h-4 w-4' />
              )}
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
