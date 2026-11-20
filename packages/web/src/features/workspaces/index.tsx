import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Check, Plus, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DashboardPage } from '@/components/layout/dashboard-page'
import { workspaceMutations, workspaceQueries } from './api'

export function WorkspacesPage() {
  const queryClient = useQueryClient()
  const { data: workspaces = [] } = useQuery(workspaceQueries.list())
  const [name, setName] = useState('')
  const switchWorkspace = useMutation(workspaceMutations.switchTo(queryClient))
  const createWorkspace = useMutation(workspaceMutations.create(queryClient))
  const { t } = useTranslation('platform')
  const { t: tCommon } = useTranslation('common')

  return (
    <DashboardPage
      title={t('workspace.title')}
      description={t('workspace.description')}
    >
      <form
        className='flex max-w-md gap-2'
        onSubmit={(event) => {
          event.preventDefault()
          createWorkspace.mutate(name, {
            onSuccess: (workspace) => {
              setName('')
              toast.success(t('workspace.created', { name: workspace.name }))
            },
            onError: (error) =>
              toast.error(
                error instanceof Error
                  ? error.message
                  : t('workspace.createFailed')
              ),
          })
        }}
      >
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t('workspace.nameLabel')}
          aria-label={t('workspace.nameLabel')}
        />
        <Button type='submit' disabled={createWorkspace.isPending}>
          <Plus />
          {tCommon('operation.create')}
        </Button>
      </form>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {workspaces.map((workspace) => (
          <Card key={workspace.id}>
            <CardHeader>
              <CardTitle className='flex items-center justify-between gap-2'>
                {workspace.name}
                {workspace.current && <Badge>{t('workspace.active')}</Badge>}
              </CardTitle>
              <CardDescription className='uppercase'>
                {t('workspace.plan', { plan: workspace.plan })}
              </CardDescription>
            </CardHeader>
            <CardContent className='text-sm text-muted-foreground'>
              {t('workspace.role', { role: workspace.role })}
            </CardContent>
            <CardFooter className='gap-2'>
              <Button
                variant={workspace.current ? 'secondary' : 'default'}
                disabled={workspace.current || switchWorkspace.isPending}
                onClick={() => switchWorkspace.mutate(workspace.id)}
              >
                {workspace.current ? (
                  <>
                    <Check />
                    {t('workspace.current')}
                  </>
                ) : (
                  t('workspace.switch')
                )}
              </Button>
              <Button variant='outline' asChild>
                <Link
                  to='/workspaces/team/$workspaceId'
                  params={{ workspaceId: workspace.id }}
                >
                  <Users />
                  {t('Team')}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </DashboardPage>
  )
}
