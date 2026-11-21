import { useState, useMemo } from 'react'
import {
  FolderKanban,
  Plus,
  Search,
  Settings2,
  RefreshCw,
  FolderGit2,
  Terminal,
  ExternalLink,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  useProjectsList,
  useAddProject,
  useUpdateProject,
  type ProjectItem,
} from './api'

export function ProjectsSettings() {
  const { t } = useTranslation(['model-provider', 'common'])
  const [search, setSearch] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newDirectory, setNewDirectory] = useState('')
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null)
  const [editName, setEditName] = useState('')
  const [editStartup, setEditStartup] = useState('')

  const { data: projects = [], isLoading, refetch, isFetching } = useProjectsList()
  const addProjectMutation = useAddProject()
  const updateProjectMutation = useUpdateProject()

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects
    const q = search.trim().toLowerCase()
    return projects.filter((p) => {
      const name = p.name || ''
      const path = p.canonical || ''
      return name.toLowerCase().includes(q) || path.toLowerCase().includes(q)
    })
  }, [projects, search])

  const handleOpenEdit = (project: ProjectItem) => {
    setEditingProject(project)
    setEditName(project.name || '')
    setEditStartup(project.commands?.start || '')
  }

  const handleSaveEdit = async () => {
    if (!editingProject) return
    try {
      await updateProjectMutation.mutateAsync({
        projectID: editingProject.id,
        name: editName.trim(),
        startup: editStartup.trim(),
      })
      toast.success(t('settings.projects.editSuccess', 'Project updated successfully'))
      setEditingProject(null)
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : t('common.error', 'An error occurred')
      )
    }
  }

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDirectory.trim()) return
    try {
      await addProjectMutation.mutateAsync(newDirectory.trim())
      toast.success(t('settings.projects.addSuccess', 'Project registered successfully'))
      setNewDirectory('')
      setAddDialogOpen(false)
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
            <FolderKanban className='h-5 w-5 text-primary' />
            <h2 className='text-lg font-bold tracking-tight'>
              {t('settings.projects.title', 'Projects')}
            </h2>
          </div>
          <p className='text-xs text-muted-foreground mt-0.5'>
            {t(
              'settings.projects.description',
              'Manage registered projects, canonical paths, and workspace environments.'
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

          <Button
            size='sm'
            onClick={() => setAddDialogOpen(true)}
            className='h-8 text-xs gap-1.5'
          >
            <Plus className='h-3.5 w-3.5' />
            {t('settings.projects.add', 'Add Project')}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className='relative w-full sm:w-80'>
        <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder={t(
            'settings.projects.search.placeholder',
            'Search projects by name or directory...'
          )}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='h-9 pl-9 text-xs'
        />
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className='grid gap-3 sm:grid-cols-2'>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className='animate-pulse h-36 bg-muted/40' />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className='border-dashed py-12 text-center'>
          <CardContent className='flex flex-col items-center justify-center gap-2'>
            <FolderKanban className='h-10 w-10 text-muted-foreground/60' />
            <h3 className='font-semibold text-sm'>
              {t('settings.projects.empty', 'No projects registered')}
            </h3>
            <p className='text-xs text-muted-foreground max-w-sm'>
              {t(
                'settings.projects.empty.description',
                'Register a directory as a project to begin running agent sessions.'
              )}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setAddDialogOpen(true)}
              className='mt-2 text-xs gap-1.5'
            >
              <Plus className='h-3.5 w-3.5' />
              {t('settings.projects.add', 'Add Project')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-3 sm:grid-cols-1 lg:grid-cols-2'>
          {filteredProjects.map((project) => {
            const displayName = project.name || getDirName(project.canonical)
            return (
              <Card
                key={project.id}
                className='overflow-hidden border-border/60 hover:border-border transition-colors'
              >
                <CardHeader className='p-4 pb-2'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold text-sm truncate'>
                          {displayName}
                        </span>
                        <Badge variant='outline' className='text-[10px] h-4.5 px-1.5'>
                          {project.worktreeCount && project.worktreeCount > 1
                            ? t('settings.projects.worktreesCount_plural', {
                                count: project.worktreeCount,
                              })
                            : t('settings.projects.worktreesCount', { count: 1 })}
                        </Badge>
                      </div>
                      <CardDescription
                        className='font-mono text-[11px] truncate mt-0.5'
                        title={project.canonical}
                      >
                        {project.canonical}
                      </CardDescription>
                    </div>

                    <div className='flex items-center gap-1 shrink-0'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleOpenEdit(project)}
                        className='h-7 w-7 text-muted-foreground hover:text-foreground'
                        title={t('settings.projects.edit', 'Edit Project')}
                      >
                        <Settings2 className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className='p-4 pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 bg-muted/20'>
                  <div className='flex items-center gap-1.5 truncate'>
                    {project.commands?.start ? (
                      <div className='flex items-center gap-1 font-mono text-[11px] text-muted-foreground truncate'>
                        <Terminal className='h-3 w-3 text-primary shrink-0' />
                        <span className='truncate'>{project.commands.start}</span>
                      </div>
                    ) : (
                      <div className='flex items-center gap-1 text-[11px] text-muted-foreground/70'>
                        <FolderGit2 className='h-3 w-3 shrink-0' />
                        <span>Git Root</span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant='ghost'
                    size='sm'
                    asChild
                    className='h-7 px-2 text-[11px] gap-1 text-primary hover:text-primary'
                  >
                    <Link to='/session' search={{ project: project.id }}>
                      <span>{t('session.newSession', 'New Session')}</span>
                      <ExternalLink className='h-3 w-3' />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Project Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <form onSubmit={handleAddProject}>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <FolderKanban className='h-5 w-5 text-primary' />
                {t('settings.projects.addDialog.title', 'Register New Project')}
              </DialogTitle>
              <DialogDescription className='text-xs pt-1'>
                {t(
                  'settings.projects.addDialog.desc',
                  'Enter the absolute filesystem path of a Git repository or directory.'
                )}
              </DialogDescription>
            </DialogHeader>

            <div className='py-4 space-y-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='project-path' className='text-xs'>
                  {t('settings.projects.addDialog.pathLabel', 'Directory Path')}
                </Label>
                <Input
                  id='project-path'
                  placeholder={t(
                    'settings.projects.addDialog.pathPlaceholder',
                    '/Users/username/dev/my-project'
                  )}
                  value={newDirectory}
                  onChange={(e) => setNewDirectory(e.target.value)}
                  className='h-9 text-xs font-mono'
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter className='gap-2 sm:gap-0'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setAddDialogOpen(false)}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                type='submit'
                size='sm'
                disabled={addProjectMutation.isPending || !newDirectory.trim()}
              >
                {addProjectMutation.isPending
                  ? t('common.loading', 'Registering...')
                  : t('settings.projects.addDialog.submit', 'Register Project')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Settings2 className='h-5 w-5 text-primary' />
              {t('settings.projects.editDialog.title', 'Project Configuration')}
            </DialogTitle>
            <DialogDescription className='text-xs pt-1 font-mono break-all'>
              {editingProject?.canonical}
            </DialogDescription>
          </DialogHeader>

          <div className='py-3 space-y-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='edit-name' className='text-xs'>
                {t('settings.projects.editDialog.nameLabel', 'Project Name')}
              </Label>
              <Input
                id='edit-name'
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder={editingProject ? getDirName(editingProject.canonical) : ''}
                className='h-9 text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='edit-startup' className='text-xs'>
                {t('settings.projects.editDialog.startupLabel', 'Worktree Startup Command')}
              </Label>
              <Input
                id='edit-startup'
                value={editStartup}
                onChange={(e) => setEditStartup(e.target.value)}
                placeholder='e.g. bun install'
                className='h-9 text-xs font-mono'
              />
              <p className='text-[11px] text-muted-foreground'>
                {t(
                  'settings.projects.editDialog.startupDesc',
                  'Runs automatically whenever a new worktree/workspace is provisioned.'
                )}
              </p>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setEditingProject(null)}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type='button'
              size='sm'
              disabled={updateProjectMutation.isPending}
              onClick={handleSaveEdit}
            >
              {updateProjectMutation.isPending
                ? t('common.loading', 'Saving...')
                : t('common.save', 'Save Changes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
