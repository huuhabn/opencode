import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Mail, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DashboardPage } from '@/components/layout/dashboard-page'
import { workspaceMutations, workspaceQueries } from './api'
import { workspaceRoles, type WorkspaceRole } from './types'

type TeamPageProps = {
  workspaceId?: string
}

export function TeamPage({ workspaceId }: TeamPageProps) {
  const queryClient = useQueryClient()
  const { data: workspaces = [] } = useQuery(workspaceQueries.list())
  const workspace =
    workspaces.find((item) => item.id === workspaceId) ??
    workspaces.find((item) => item.current) ??
    workspaces[0]
  const { data: members = [] } = useQuery({
    ...workspaceQueries.members(workspace?.id ?? 'none'),
    enabled: Boolean(workspace),
  })
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Exclude<WorkspaceRole, 'owner'>>('member')
  const invite = useMutation(workspaceMutations.invite(queryClient))
  const updateRole = useMutation(workspaceMutations.updateRole(queryClient))
  const remove = useMutation(workspaceMutations.remove(queryClient))
  const assignableRoles = workspaceRoles.filter((item) => item !== 'owner')
  const { t } = useTranslation('platform')
  const activeCount = members.filter(
    (member) => member.status === 'active'
  ).length
  const invitedCount = members.filter(
    (member) => member.status === 'invited'
  ).length

  return (
    <DashboardPage
      title={t('team.title')}
      description={
        workspace
          ? t('team.description', {
              name: workspace.name,
              role: workspace.role,
            })
          : t('team.descriptionEmpty')
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('team.inviteTitle')}</CardTitle>
          <CardDescription>{t('team.inviteDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className='flex flex-col gap-2 sm:flex-row'
            onSubmit={(event) => {
              event.preventDefault()
              if (!workspace) return
              invite.mutate(
                { workspaceId: workspace.id, email, role },
                {
                  onSuccess: (member) => {
                    setEmail('')
                    toast.success(t('team.invited', { email: member.email }))
                  },
                  onError: (error) =>
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : t('team.inviteFailed')
                    ),
                }
              )
            }}
          >
            <Input
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder='name@company.com'
              aria-label={t('team.emailLabel')}
              className='sm:max-w-sm'
            />
            <Select
              value={role}
              onValueChange={(value) =>
                setRole(value as Exclude<WorkspaceRole, 'owner'>)
              }
            >
              <SelectTrigger
                className='sm:w-36'
                aria-label={t('team.roleLabel')}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assignableRoles.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type='submit' disabled={!workspace || invite.isPending}>
              <Mail />
              {t('team.invite')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('team.members')}</CardTitle>
          <CardDescription>
            {t('team.memberCounts', {
              active: activeCount,
              invited: invitedCount,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('team.name')}</TableHead>
                <TableHead>{t('team.email')}</TableHead>
                <TableHead>{t('team.role')}</TableHead>
                <TableHead>{t('team.status')}</TableHead>
                <TableHead className='w-16' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    {member.role === 'owner' ? (
                      <span className='capitalize'>{member.role}</span>
                    ) : (
                      <Select
                        value={member.role}
                        onValueChange={(value) =>
                          updateRole.mutate(
                            { id: member.id, role: value as WorkspaceRole },
                            {
                              onError: (error) =>
                                toast.error(
                                  error instanceof Error
                                    ? error.message
                                    : t('team.roleUpdateFailed')
                                ),
                            }
                          )
                        }
                      >
                        <SelectTrigger
                          className='w-32'
                          aria-label={t('team.memberRole', {
                            name: member.name,
                          })}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {assignableRoles.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {t(
                        member.status === 'active'
                          ? 'team.active'
                          : 'team.invitedStatus'
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.role !== 'owner' && (
                      <Button
                        variant='ghost'
                        size='icon'
                        aria-label={t('team.remove', { email: member.email })}
                        disabled={remove.isPending}
                        onClick={() =>
                          remove.mutate(member.id, {
                            onSuccess: () =>
                              toast.success(
                                t('team.removed', { email: member.email })
                              ),
                            onError: (error) =>
                              toast.error(
                                error instanceof Error
                                  ? error.message
                                  : t('team.removeFailed')
                              ),
                          })
                        }
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardPage>
  )
}
