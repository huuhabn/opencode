import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  Check,
  ChevronsUpDown,
  GalleryVerticalEnd,
  Settings,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { workspaceMutations, workspaceQueries } from '@/features/workspaces/api'

export function OrgSwitcher() {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: workspaces = [], isLoading } = useQuery(workspaceQueries.list())
  const current =
    workspaces.find((workspace) => workspace.current) ?? workspaces[0]
  const switchWorkspace = useMutation(workspaceMutations.switchTo(queryClient))
  const { t } = useTranslation('platform')

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                <GalleryVerticalEnd className='size-4' />
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {isLoading ? 'Loading…' : (current?.name ?? 'Workspace')}
                </span>
                <span className='truncate text-xs capitalize'>
                  {current?.role ?? 'Member'}
                </span>
              </div>
              <ChevronsUpDown className='ms-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              {t('Workspaces')}
            </DropdownMenuLabel>
            {workspaces.map((workspace) => {
              const active = workspace.id === current?.id
              return (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => {
                    if (!active) switchWorkspace.mutate(workspace.id)
                  }}
                  className='gap-2 p-2'
                >
                  <div className='flex size-6 items-center justify-center rounded-sm border'>
                    <GalleryVerticalEnd className='size-4 shrink-0' />
                  </div>
                  <div className='grid min-w-0 flex-1 leading-tight'>
                    <span className='truncate font-medium'>
                      {workspace.name}
                    </span>
                    <span className='truncate text-xs text-muted-foreground capitalize'>
                      {workspace.role}
                    </span>
                  </div>
                  {active && <Check className='ms-auto size-4' />}
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='gap-2 p-2'
              onClick={() => navigate({ to: '/workspaces' })}
            >
              <Settings />
              {t('workspace.settings')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className='gap-2 p-2'
              onClick={() => {
                if (!current) return
                navigate({
                  to: '/workspaces/team/$workspaceId',
                  params: { workspaceId: current.id },
                })
              }}
            >
              <Users />
              {t('workspace.inviteMembers')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
