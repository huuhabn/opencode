import { useState, useMemo } from 'react'
import {
  FolderGit2,
  Trash2,
  Search,
  FolderKanban,
  Clock,
  RefreshCw,
  AlertTriangle,
  FolderMinus,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useWorkspaceInventory,
  useDeleteWorkspace,
  useDeleteUnusedWorkspaces,
  type WorkspaceItem,
} from './api'

export function WorkspacesSettings() {
  const { t } = useTranslation(['model-provider', 'common'])
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceItem | null>(null)
  const [deleteUnusedDialogOpen, setDeleteUnusedDialogOpen] = useState(false)

  const { data, isLoading, refetch, isFetching } = useWorkspaceInventory(selectedProject)
  const deleteWorkspaceMutation = useDeleteWorkspace()
  const deleteUnusedMutation = useDeleteUnusedWorkspaces()

  const projects = data?.projects ?? []
  const workspaces = data?.workspaces ?? []

  const filteredWorkspaces = useMemo(() => {
    return workspaces.filter((item) => {
      if (!search.trim()) return true
      const q = search.trim().toLowerCase()
      return (
        item.directory.toLowerCase().includes(q) ||
        item.projectName.toLowerCase().includes(q)
      )
    })
  }, [workspaces, search])

  const unusedCount = useMemo(() => {
    return workspaces.filter((w) => w.sessionCount === 0).length
  }, [workspaces])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await deleteWorkspaceMutation.mutateAsync({
        projectID: deleteTarget.projectID,
        directory: deleteTarget.directory,
      })
      toast.success(t('settings.workspaces.deleteSuccess', 'Workspace deleted successfully'))
      setDeleteTarget(null)
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : t('common.error', 'An error occurred')
      )
    }
  }

  const handleDeleteUnusedConfirm = async () => {
    try {
      await deleteUnusedMutation.mutateAsync(workspaces)
      toast.success(
        t('settings.workspaces.deleteUnusedSuccess', 'Unused workspaces removed successfully')
      )
      setDeleteUnusedDialogOpen(false)
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : t('common.error', 'An error occurred')
      )
    }
  }

  const getDirName = (dir: string) => {
    return dir.split('/').filter(Boolean).pop() || dir
  }

  return (
    <div className='w-full space-y-6 pb-12 select-text'>
      {/* Header Bar */}
      <div className='flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-3'>
        <div>
          <div className='flex items-center gap-2'>
            <FolderGit2 className='h-5 w-5 text-primary' />
            <h2 className='text-lg font-bold tracking-tight'>
              {t('settings.workspaces.title', 'Workspaces')}
            </h2>
          </div>
          <p className='text-xs text-muted-foreground mt-0.5'>
            {t(
              'settings.workspaces.description',
              'Review worktrees, manage disk usage, and clean up inactive workspaces.'
            )}
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => refetch()}
            disabled={isFetching}
            className='h-8 text-xs gap-1.5'
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            {t('common.refresh', 'Refresh')}
          </Button>

          {unusedCount > 0 && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setDeleteUnusedDialogOpen(true)}
              className='h-8 text-xs gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/30'
            >
              <FolderMinus className='h-3.5 w-3.5' />
              {t('settings.workspaces.deleteWithoutSessions', 'Delete unused workspaces')} ({unusedCount})
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='relative w-full sm:w-72'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder={t(
              'settings.workspaces.search.placeholder',
              'Filter workspaces by name or path...'
            )}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-9 pl-9 text-xs'
          />
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-xs text-muted-foreground whitespace-nowrap'>
            {t('session.project', 'Project')}:
          </span>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className='h-9 w-48 text-xs'>
              <SelectValue placeholder={t('settings.workspaces.filter.all', 'All Projects')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>
                {t('settings.workspaces.filter.all', 'All Projects')}
              </SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name || p.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Workspaces List / Grid */}
      {isLoading ? (
        <div className='grid gap-3 sm:grid-cols-2'>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className='animate-pulse h-32 bg-muted/40' />
          ))}
        </div>
      ) : filteredWorkspaces.length === 0 ? (
        <Card className='border-dashed py-12 text-center'>
          <CardContent className='flex flex-col items-center justify-center gap-2'>
            <FolderGit2 className='h-10 w-10 text-muted-foreground/60' />
            <h3 className='font-semibold text-sm'>
              {t('settings.workspaces.empty', 'No workspaces found')}
            </h3>
            <p className='text-xs text-muted-foreground max-w-sm'>
              {t(
                'settings.workspaces.empty.description',
                'Worktrees created by OpenCode will appear here.'
              )}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-3 sm:grid-cols-1 lg:grid-cols-2'>
          {filteredWorkspaces.map((item) => {
            const isCanonical = item.directory === item.projectWorktree
            return (
              <Card
                key={`${item.projectID}:${item.directory}`}
                className='overflow-hidden border-border/60 hover:border-border transition-colors'
              >
                <CardHeader className='p-4 pb-2'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold text-sm truncate'>
                          {getDirName(item.directory)}
                        </span>
                        {isCanonical && (
                          <Badge variant='secondary' className='text-[10px] h-4.5 px-1.5'>
                            Canonical
                          </Badge>
                        )}
                      </div>
                      <CardDescription className='font-mono text-[11px] truncate mt-0.5' title={item.directory}>
                        {item.directory}
                      </CardDescription>
                    </div>

                    {!isCanonical && (
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setDeleteTarget(item)}
                        className='h-7 w-7 text-muted-foreground hover:text-destructive shrink-0'
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className='p-4 pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 bg-muted/20'>
                  <div className='flex items-center gap-1.5 truncate'>
                    <FolderKanban className='h-3.5 w-3.5 text-primary shrink-0' />
                    <span className='truncate'>{item.projectName}</span>
                  </div>

                  <div className='flex items-center gap-3 shrink-0'>
                    <Badge variant='outline' className='text-[10px] font-normal'>
                      {t('settings.workspaces.sessions', { count: item.sessionCount })}
                    </Badge>
                    {item.lastSessionTime && (
                      <div className='flex items-center gap-1 text-[11px]'>
                        <Clock className='h-3 w-3' />
                        <span>
                          {new Date(item.lastSessionTime).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete Single Workspace Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-destructive'>
              <AlertTriangle className='h-5 w-5' />
              {t('settings.workspaces.delete.confirm', {
                name: deleteTarget ? getDirName(deleteTarget.directory) : '',
              })}
            </DialogTitle>
            <DialogDescription className='text-xs pt-1'>
              {t(
                'settings.workspaces.delete.warning',
                'The workspace directory and branch will be permanently removed.'
              )}
            </DialogDescription>
          </DialogHeader>

          {deleteTarget && (
            <div className='rounded-md bg-muted p-3 text-xs font-mono break-all'>
              {deleteTarget.directory}
            </div>
          )}

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button variant='outline' size='sm' onClick={() => setDeleteTarget(null)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              variant='destructive'
              size='sm'
              disabled={deleteWorkspaceMutation.isPending}
              onClick={handleDeleteConfirm}
            >
              {deleteWorkspaceMutation.isPending
                ? t('common.loading', 'Deleting...')
                : t('settings.workspaces.delete.button', 'Delete Workspace')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Unused Workspaces Dialog */}
      <Dialog open={deleteUnusedDialogOpen} onOpenChange={setDeleteUnusedDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-destructive'>
              <AlertTriangle className='h-5 w-5' />
              {t('settings.workspaces.deleteWithoutSessions', 'Delete unused workspaces')}
            </DialogTitle>
            <DialogDescription className='text-xs pt-1'>
              {t(
                'settings.workspaces.deleteWithoutSessions.confirm',
                'This will permanently remove workspaces that have no active sessions.'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className='py-2 text-xs text-muted-foreground'>
            {t('settings.workspaces.unusedTotal', 'Total unused workspaces to be deleted: {{count}}', {
              count: unusedCount,
            })}
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button variant='outline' size='sm' onClick={() => setDeleteUnusedDialogOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              variant='destructive'
              size='sm'
              disabled={deleteUnusedMutation.isPending}
              onClick={handleDeleteUnusedConfirm}
            >
              {deleteUnusedMutation.isPending
                ? t('common.loading', 'Deleting...')
                : t('settings.workspaces.deleteWithoutSessions', 'Delete unused workspaces')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
