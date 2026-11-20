import {
  mutationOptions,
  queryOptions,
  useQuery,
  type QueryClient,
} from '@tanstack/react-query'
import type { Workspace, WorkspaceMember, WorkspaceRole } from './types'

export const CURRENT_MEMBER = {
  name: 'satnaing',
  email: 'satnaingdev@gmail.com',
}

const workspaces: Workspace[] = [
  {
    id: 'ws_engineering',
    name: 'Engineering',
    plan: 'pro',
    status: 'normal',
    role: 'owner',
    created_at: 1710000000,
    current: true,
  },
  {
    id: 'ws_design',
    name: 'Design',
    plan: 'community',
    status: 'normal',
    role: 'admin',
    created_at: 1711000000,
    current: false,
  },
  {
    id: 'ws_sandbox',
    name: 'Sandbox',
    plan: 'sandbox',
    status: 'normal',
    role: 'editor',
    created_at: 1712000000,
    current: false,
  },
]

const members: WorkspaceMember[] = [
  {
    id: 'mem_eng_owner',
    workspaceId: 'ws_engineering',
    name: CURRENT_MEMBER.name,
    email: CURRENT_MEMBER.email,
    role: 'owner',
    status: 'active',
  },
  {
    id: 'mem_eng_sarah',
    workspaceId: 'ws_engineering',
    name: 'Sarah Connor',
    email: 'sarah.connor@example.com',
    role: 'admin',
    status: 'active',
  },
  {
    id: 'mem_eng_alex',
    workspaceId: 'ws_engineering',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    role: 'editor',
    status: 'invited',
  },
  {
    id: 'mem_design_owner',
    workspaceId: 'ws_design',
    name: CURRENT_MEMBER.name,
    email: CURRENT_MEMBER.email,
    role: 'admin',
    status: 'active',
  },
  {
    id: 'mem_design_jordan',
    workspaceId: 'ws_design',
    name: 'Jordan Lee',
    email: 'jordan.lee@example.com',
    role: 'member',
    status: 'active',
  },
  {
    id: 'mem_sandbox_owner',
    workspaceId: 'ws_sandbox',
    name: CURRENT_MEMBER.name,
    email: CURRENT_MEMBER.email,
    role: 'editor',
    status: 'active',
  },
]

function cloneWorkspaces() {
  return workspaces.map((workspace) => ({ ...workspace }))
}

function cloneMembers(workspaceId: string) {
  return members
    .filter((member) => member.workspaceId === workspaceId)
    .map((member) => ({ ...member }))
}

function syncCurrentRole(workspaceId: string) {
  const workspace = workspaces.find((item) => item.id === workspaceId)
  const self = members.find(
    (member) =>
      member.workspaceId === workspaceId &&
      member.email === CURRENT_MEMBER.email &&
      member.status === 'active'
  )
  if (workspace && self) workspace.role = self.role
}

export const workspaceQueries = {
  all: () => ['workspaces'] as const,
  list: () =>
    queryOptions({
      queryKey: [...workspaceQueries.all(), 'list'] as const,
      queryFn: async () => cloneWorkspaces(),
    }),
  members: (workspaceId: string) =>
    queryOptions({
      queryKey: [...workspaceQueries.all(), 'members', workspaceId] as const,
      queryFn: async () => cloneMembers(workspaceId),
    }),
}

function refresh(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: workspaceQueries.all() })
}

export const workspaceMutations = {
  switchTo: (queryClient: QueryClient) =>
    mutationOptions({
      mutationFn: async (id: string) => {
        if (!workspaces.some((workspace) => workspace.id === id)) {
          throw new Error('Workspace not found')
        }
        for (const workspace of workspaces)
          workspace.current = workspace.id === id
        return cloneWorkspaces()
      },
      onSuccess: () => refresh(queryClient),
    }),
  create: (queryClient: QueryClient) =>
    mutationOptions({
      mutationFn: async (name: string) => {
        const trimmed = name.trim()
        if (!trimmed) throw new Error('Workspace name is required')
        const workspace: Workspace = {
          id: `ws_${Date.now()}`,
          name: trimmed,
          plan: 'sandbox',
          status: 'normal',
          role: 'owner',
          created_at: Math.floor(Date.now() / 1000),
          current: false,
        }
        workspaces.push(workspace)
        members.push({
          id: `mem_${workspace.id}_owner`,
          workspaceId: workspace.id,
          name: CURRENT_MEMBER.name,
          email: CURRENT_MEMBER.email,
          role: 'owner',
          status: 'active',
        })
        return workspace
      },
      onSuccess: () => refresh(queryClient),
    }),
  invite: (queryClient: QueryClient) =>
    mutationOptions({
      mutationFn: async (input: {
        workspaceId: string
        email: string
        role: WorkspaceRole
      }) => {
        const email = input.email.trim().toLowerCase()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error('Enter a valid email')
        }
        if (input.role === 'owner')
          throw new Error('Owner is assigned at creation')
        const exists = members.some(
          (member) =>
            member.workspaceId === input.workspaceId && member.email === email
        )
        if (exists) throw new Error('That email is already on this workspace')
        const member: WorkspaceMember = {
          id: `mem_${Date.now()}`,
          workspaceId: input.workspaceId,
          name: email.split('@')[0] ?? email,
          email,
          role: input.role,
          status: 'invited',
        }
        members.push(member)
        return member
      },
      onSuccess: () => refresh(queryClient),
    }),
  updateRole: (queryClient: QueryClient) =>
    mutationOptions({
      mutationFn: async (input: { id: string; role: WorkspaceRole }) => {
        const member = members.find((item) => item.id === input.id)
        if (!member) throw new Error('Member not found')
        if (member.role === 'owner' || input.role === 'owner') {
          throw new Error('Ownership cannot be reassigned here')
        }
        member.role = input.role
        syncCurrentRole(member.workspaceId)
        return { ...member }
      },
      onSuccess: () => refresh(queryClient),
    }),
  remove: (queryClient: QueryClient) =>
    mutationOptions({
      mutationFn: async (id: string) => {
        const index = members.findIndex((member) => member.id === id)
        const member = members[index]
        if (!member) throw new Error('Member not found')
        if (member.role === 'owner')
          throw new Error('The owner cannot be removed')
        if (member.email === CURRENT_MEMBER.email) {
          throw new Error('You cannot remove yourself')
        }
        members.splice(index, 1)
        return id
      },
      onSuccess: () => refresh(queryClient),
    }),
  updatePlan: (queryClient: QueryClient) =>
    mutationOptions({
      mutationFn: async (input: { workspaceId: string; plan: string }) => {
        const workspace = workspaces.find((w) => w.id === input.workspaceId)
        if (!workspace) throw new Error('Workspace not found')
        workspace.plan = input.plan
        return { ...workspace }
      },
      onSuccess: () => refresh(queryClient),
    }),
}

export function useCurrentWorkspace() {
  const { data } = useQuery(workspaceQueries.list())
  return data?.find((workspace) => workspace.current) ?? data?.[0]
}
