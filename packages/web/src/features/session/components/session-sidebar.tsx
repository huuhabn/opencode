import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Settings,
  PanelLeftClose,
  HelpCircle,
  Trash2,
  MoreHorizontal,
  Bot,
  ChevronsUpDown,
  Sparkles,
  X,
  Edit2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useSessionsList,
  useDeleteSession,
  useCreateSession,
  useUpdateSession,
  type SessionInfo,
} from '../api'

interface SessionSidebarProps {
  currentSessionId?: string
  onCollapse?: () => void
}

export function SessionSidebar({ currentSessionId, onCollapse }: SessionSidebarProps) {
  const { t } = useTranslation(['model-provider', 'common'])
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showSearchInput, setShowSearchInput] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<SessionInfo | null>(null)
  const [sessionToRename, setSessionToRename] = useState<SessionInfo | null>(null)
  const [renameTitle, setRenameTitle] = useState('')

  // Accordion open/collapse states
  const [isTopicsOpen, setIsTopicsOpen] = useState(true)
  const [isTodayOpen, setIsTodayOpen] = useState(true)
  const [isYesterdayOpen, setIsYesterdayOpen] = useState(true)
  const [isOlderOpen, setIsOlderOpen] = useState(false)

  const { data: sessions = [], isLoading } = useSessionsList()
  const deleteSessionMutation = useDeleteSession()
  const createSessionMutation = useCreateSession()
  const updateSessionMutation = useUpdateSession()

  const filteredSessions = useMemo(() => {
    if (!search.trim()) return sessions
    const q = search.trim().toLowerCase()
    return sessions.filter((s) => {
      const title = s.title || ''
      return title.toLowerCase().includes(q)
    })
  }, [sessions, search])

  // Group sessions by date
  const groups = useMemo(() => {
    const today: SessionInfo[] = []
    const yesterday: SessionInfo[] = []
    const older: SessionInfo[] = []

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const startOfYesterday = startOfToday - 86400000

    filteredSessions.forEach((s) => {
      const created = s.time?.created ? new Date(s.time.created).getTime() : 0
      if (created >= startOfToday) {
        today.push(s)
      } else if (created >= startOfYesterday) {
        yesterday.push(s)
      } else {
        older.push(s)
      }
    })

    return { today, yesterday, older }
  }, [filteredSessions])

  const handleCreateNewSession = async () => {
    try {
      const newSession = await createSessionMutation.mutateAsync()
      toast.success(t('session.newSessionSuccess', 'New conversation started'))
      if (newSession?.id) {
        navigate({ to: '/session/$sessionId', params: { sessionId: newSession.id } })
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('common.error', 'An error occurred'))
    }
  }

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return
    try {
      await deleteSessionMutation.mutateAsync(sessionToDelete.id)
      toast.success(t('session.deleteSuccess', 'Conversation deleted'))
      if (currentSessionId === sessionToDelete.id) {
        navigate({ to: '/session' })
      }
      setSessionToDelete(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('common.error', 'An error occurred'))
    }
  }

  const handleRenameSubmit = async () => {
    if (!sessionToRename || !renameTitle.trim()) return
    try {
      await updateSessionMutation.mutateAsync({
        sessionID: sessionToRename.id,
        title: renameTitle.trim(),
      })
      toast.success(t('common.saved', 'Saved'))
      setSessionToRename(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('common.error', 'An error occurred'))
    }
  }

  return (
    <div className='flex h-full w-full flex-col border-r border-border/50 bg-background/95 select-text min-h-0 overflow-hidden'>
      {/* Top Header: Avatar + Lobe AI + Collapse + Settings */}
      <div className='flex h-12 shrink-0 items-center justify-between border-b border-border/50 px-3'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type='button'
              className='flex items-center gap-2 rounded-lg px-1.5 py-1 text-xs font-semibold hover:bg-muted/60 transition-colors'
            >
              <div className='flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 text-white shadow-xs'>
                <Bot className='h-3.5 w-3.5' />
              </div>
              <span className='font-bold text-sm tracking-tight text-foreground'>Lobe AI</span>
              <ChevronsUpDown className='h-3 w-3 text-muted-foreground' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='w-48 text-xs'>
            <DropdownMenuItem asChild>
              <Link to='/settings/workspaces'>
                <Settings className='h-3.5 w-3.5 mr-2' />
                <span>{t('settings.workspaces.title', 'Workspaces')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to='/settings/projects'>
                <Sparkles className='h-3.5 w-3.5 mr-2' />
                <span>{t('settings.projects.title', 'Projects')}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className='flex items-center gap-0.5'>
          {onCollapse && (
            <Button
              variant='ghost'
              size='icon'
              onClick={onCollapse}
              className='h-7 w-7 text-muted-foreground hover:text-foreground'
              title='Collapse sidebar'
            >
              <PanelLeftClose className='h-3.5 w-3.5' />
            </Button>
          )}
          <Button
            variant='ghost'
            size='icon'
            asChild
            className='h-7 w-7 text-muted-foreground hover:text-foreground'
            title='Settings'
          >
            <Link to='/settings/workspaces'>
              <Settings className='h-3.5 w-3.5' />
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className='p-2 space-y-1 shrink-0'>
        {/* New Session Button */}
        <button
          type='button'
          onClick={handleCreateNewSession}
          disabled={createSessionMutation.isPending}
          className='flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors'
        >
          <Plus className='h-4 w-4 text-muted-foreground' />
          <span>{t('session.newSession', 'New Session')}</span>
        </button>

        {/* Search Action */}
        <button
          type='button'
          onClick={() => setShowSearchInput((prev) => !prev)}
          className='flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors'
        >
          <Search className='h-4 w-4 text-muted-foreground' />
          <span>{t('session.search', 'Search')}</span>
        </button>

        {showSearchInput && (
          <div className='px-1 py-1 relative'>
            <Input
              autoFocus
              placeholder={t('common.search', 'Search sessions...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='h-7 text-xs bg-muted/40 pr-6'
            />
            {search && (
              <button
                type='button'
                onClick={() => setSearch('')}
                className='absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground'
              >
                <X className='h-3.5 w-3.5' />
              </button>
            )}
          </div>
        )}

        {/* Tasks and Goals */}
        <button
          type='button'
          onClick={() => navigate({ to: '/tasks' })}
          className='flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors'
        >
          <CheckSquare className='h-4 w-4 text-muted-foreground' />
          <span>{t('session.tasksGoals', 'Tasks and goals')}</span>
        </button>
      </div>

      {/* Collapsible Session List with Native Scrolling */}
      <div className='flex-1 min-h-0 overflow-y-auto px-2 py-1'>
        {isLoading ? (
          <div className='space-y-2 p-2'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='h-7 rounded-md bg-muted/40 animate-pulse' />
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className='p-6 text-center text-xs text-muted-foreground'>
            {t('session.noSessions', 'No conversations yet')}
          </div>
        ) : (
          <div className='space-y-3 pb-4'>
            {/* Topics Section */}
            <div>
              <button
                type='button'
                onClick={() => setIsTopicsOpen(!isTopicsOpen)}
                className='flex w-full items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground'
              >
                <div className='flex items-center gap-1.5'>
                  <span>{t('session.topics', 'Topics')}</span>
                  <span className='text-[10px] text-muted-foreground/70'>{filteredSessions.length}</span>
                </div>
                {isTopicsOpen ? (
                  <ChevronDown className='h-3 w-3' />
                ) : (
                  <ChevronRight className='h-3 w-3' />
                )}
              </button>
            </div>

            {/* Today Group */}
            {groups.today.length > 0 && (
              <div>
                <button
                  type='button'
                  onClick={() => setIsTodayOpen(!isTodayOpen)}
                  className='flex w-full items-center justify-between px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground'
                >
                  <span>{t('session.today', 'Today')}</span>
                  {isTodayOpen ? (
                    <ChevronDown className='h-3 w-3' />
                  ) : (
                    <ChevronRight className='h-3 w-3' />
                  )}
                </button>
                {isTodayOpen && (
                  <div className='mt-1 space-y-0.5'>
                    {groups.today.map((s) => (
                      <SessionItemRow
                        key={s.id}
                        session={s}
                        isActive={s.id === currentSessionId}
                        onRename={() => {
                          setRenameTitle(s.title || '')
                          setSessionToRename(s)
                        }}
                        onDelete={() => setSessionToDelete(s)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Yesterday Group */}
            {groups.yesterday.length > 0 && (
              <div>
                <button
                  type='button'
                  onClick={() => setIsYesterdayOpen(!isYesterdayOpen)}
                  className='flex w-full items-center justify-between px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground'
                >
                  <span>{t('session.yesterday', 'Yesterday')}</span>
                  {isYesterdayOpen ? (
                    <ChevronDown className='h-3 w-3' />
                  ) : (
                    <ChevronRight className='h-3 w-3' />
                  )}
                </button>
                {isYesterdayOpen && (
                  <div className='mt-1 space-y-0.5'>
                    {groups.yesterday.map((s) => (
                      <SessionItemRow
                        key={s.id}
                        session={s}
                        isActive={s.id === currentSessionId}
                        onRename={() => {
                          setRenameTitle(s.title || '')
                          setSessionToRename(s)
                        }}
                        onDelete={() => setSessionToDelete(s)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Older Group */}
            {groups.older.length > 0 && (
              <div>
                <button
                  type='button'
                  onClick={() => setIsOlderOpen(!isOlderOpen)}
                  className='flex w-full items-center justify-between px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground'
                >
                  <span>2025</span>
                  {isOlderOpen ? (
                    <ChevronDown className='h-3 w-3' />
                  ) : (
                    <ChevronRight className='h-3 w-3' />
                  )}
                </button>
                {isOlderOpen && (
                  <div className='mt-1 space-y-0.5'>
                    {groups.older.map((s) => (
                      <SessionItemRow
                        key={s.id}
                        session={s}
                        isActive={s.id === currentSessionId}
                        onRename={() => {
                          setRenameTitle(s.title || '')
                          setSessionToRename(s)
                        }}
                        onDelete={() => setSessionToDelete(s)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer: Help Button */}
      <div className='flex h-10 shrink-0 items-center border-t border-border/50 px-3'>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7 text-muted-foreground hover:text-foreground'
          title={t('session.help', 'Help & documentation')}
          asChild
        >
          <Link to='/help-center'>
            <HelpCircle className='h-4 w-4' />
          </Link>
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{t('session.deleteConfirm', 'Delete this session?')}</DialogTitle>
            <DialogDescription>
              {t(
                'session.deleteWarning',
                'All messages and context in this session will be permanently deleted.'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              onClick={() => setSessionToDelete(null)}
              disabled={deleteSessionMutation.isPending}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteConfirm}
              disabled={deleteSessionMutation.isPending}
            >
              {deleteSessionMutation.isPending ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={!!sessionToRename} onOpenChange={(open) => !open && setSessionToRename(null)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{t('session.rename', 'Rename conversation')}</DialogTitle>
          </DialogHeader>
          <div className='py-2'>
            <Input
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              placeholder='Enter conversation title...'
              className='text-sm'
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setSessionToRename(null)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleRenameSubmit}
              disabled={updateSessionMutation.isPending || !renameTitle.trim()}
            >
              {t('common.save', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SessionItemRow({
  session,
  isActive,
  onRename,
  onDelete,
}: {
  session: SessionInfo
  isActive: boolean
  onRename: () => void
  onDelete: () => void
}) {
  const { t } = useTranslation(['model-provider', 'common'])
  const title = session.title || t('session.untitled', 'New Conversation')

  return (
    <div
      className={`group relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
        isActive
          ? 'bg-muted font-medium text-foreground'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      }`}
    >
      <Link
        to='/session/$sessionId'
        params={{ sessionId: session.id }}
        className='flex-1 truncate pr-2'
        title={title}
      >
        {title}
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='h-5 w-5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground'
          >
            <MoreHorizontal className='h-3 w-3' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-32 text-xs'>
          <DropdownMenuItem onClick={onRename}>
            <Edit2 className='h-3 w-3 mr-2' />
            <span>{t('session.rename', 'Rename')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className='text-destructive focus:text-destructive'
            onClick={onDelete}
          >
            <Trash2 className='h-3 w-3 mr-2' />
            <span>{t('common.delete', 'Delete')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
