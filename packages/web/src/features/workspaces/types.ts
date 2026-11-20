export const workspaceRoles = ['owner', 'admin', 'editor', 'member'] as const

export type WorkspaceRole = (typeof workspaceRoles)[number]

export type Workspace = {
  id: string
  name: string
  plan: string
  status: string
  role: WorkspaceRole
  created_at: number
  current: boolean
}

export type WorkspaceMember = {
  id: string
  workspaceId: string
  name: string
  email: string
  role: WorkspaceRole
  status: 'active' | 'invited'
}
