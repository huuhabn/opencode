import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { agentPlatformClient } from '@/lib/agent-platform-client'

export interface ProjectItem {
  id: string
  name?: string
  canonical: string
  sandboxes?: string[]
  commands?: {
    start?: string
  }
  icon?: {
    color?: string
    override?: string
  }
  worktreeCount?: number
}

export const projectsQueryKeys = {
  all: ['settings', 'projects'] as const,
  list: () => ['settings', 'projects', 'list'] as const,
}

export function useProjectsList() {
  return useQuery({
    queryKey: projectsQueryKeys.list(),
    queryFn: async () => {
      const res = await agentPlatformClient.project.list()
      const projects = Array.isArray(res) ? (res as unknown as ProjectItem[]) : []

      // Enhance with worktree count per project
      const enhanced = await Promise.all(
        projects.map(async (p) => {
          try {
            const wtRes = await agentPlatformClient.worktree.list({ projectID: p.id })
            const count = Array.isArray(wtRes) ? wtRes.length : 1
            return { ...p, worktreeCount: count }
          } catch {
            return { ...p, worktreeCount: 1 }
          }
        })
      )

      return enhanced
    },
    staleTime: 15_000,
  })
}

export function useAddProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (directory: string) => {
      const trimmed = directory.trim()
      if (!trimmed) throw new Error('Directory path cannot be empty')
      const location = await agentPlatformClient.location.get({
        location: { directory: trimmed },
      })
      return location
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      projectID,
      name,
      startup,
      color,
    }: {
      projectID: string
      name?: string
      startup?: string
      color?: string
    }) => {
      await agentPlatformClient.project.update({
        projectID,
        name: name || undefined,
        commands: startup !== undefined ? { start: startup || undefined } : undefined,
        icon: color ? { color } : undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all })
    },
  })
}
