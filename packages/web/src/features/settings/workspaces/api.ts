import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { agentPlatformClient } from '@/lib/agent-platform-client'

export interface WorkspaceItem {
  directory: string
  projectID: string
  projectName: string
  projectWorktree: string
  sessionCount: number
  lastSessionTime?: number
}

export const workspaceQueryKeys = {
  all: ['settings', 'workspaces'] as const,
  inventory: (projectID?: string) => ['settings', 'workspaces', 'inventory', projectID ?? 'all'] as const,
}

export function useWorkspaceInventory(projectID?: string) {
  return useQuery({
    queryKey: workspaceQueryKeys.inventory(projectID),
    queryFn: async () => {
      // 1. Fetch projects
      const projectsRes = await agentPlatformClient.project.list()
      const projects = Array.isArray(projectsRes) ? projectsRes : []

      // 2. Fetch all sessions to calculate session count per workspace directory
      let sessions: Array<{ directory?: string; updatedAt?: number; createdAt?: number }> = []
      try {
        const sessionsRes = await agentPlatformClient.session.list()
        if (Array.isArray(sessionsRes)) {
          sessions = sessionsRes
        }
      } catch {
        // Fallback gracefully if session.list is cold
      }

      // Group sessions by directory
      const sessionCountMap = new Map<string, number>()
      const lastSessionTimeMap = new Map<string, number>()
      for (const s of sessions) {
        if (s.directory) {
          sessionCountMap.set(s.directory, (sessionCountMap.get(s.directory) ?? 0) + 1)
          const time = s.updatedAt ?? s.createdAt
          if (time) {
            const prev = lastSessionTimeMap.get(s.directory) ?? 0
            if (time > prev) lastSessionTimeMap.set(s.directory, time)
          }
        }
      }

      // 3. For each project, fetch its worktrees
      const filteredProjects = projectID && projectID !== 'all'
        ? projects.filter((p) => p.id === projectID)
        : projects

      const items: WorkspaceItem[] = []

      await Promise.all(
        filteredProjects.map(async (project) => {
          try {
            const worktreesRes = await agentPlatformClient.worktree.list({ projectID: project.id })
            const worktrees = Array.isArray(worktreesRes) ? worktreesRes : []

            for (const wt of worktrees) {
              const dir = typeof wt === 'string' ? wt : (wt as { directory?: string }).directory ?? ''
              if (dir) {
                items.push({
                  directory: dir,
                  projectID: project.id,
                  projectName: project.name || dir.split('/').pop() || project.id,
                  projectWorktree: project.canonical,
                  sessionCount: sessionCountMap.get(dir) ?? 0,
                  lastSessionTime: lastSessionTimeMap.get(dir),
                })
              }
            }
          } catch {
            // Include canonical worktree if worktree.list is empty
            if (project.canonical) {
              items.push({
                directory: project.canonical,
                projectID: project.id,
                projectName: project.name || project.canonical.split('/').pop() || project.id,
                projectWorktree: project.canonical,
                sessionCount: sessionCountMap.get(project.canonical) ?? 0,
                lastSessionTime: lastSessionTimeMap.get(project.canonical),
              })
            }
          }
        })
      )

      return {
        projects,
        workspaces: items,
      }
    },
    staleTime: 15_000,
  })
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectID, directory, force = true }: { projectID: string; directory: string; force?: boolean }) => {
      await agentPlatformClient.worktree.remove({
        projectID,
        directory,
        force,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.all })
    },
  })
}

export function useDeleteUnusedWorkspaces() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (workspaces: WorkspaceItem[]) => {
      const unused = workspaces.filter((w) => w.sessionCount === 0)
      for (const item of unused) {
        try {
          await agentPlatformClient.worktree.remove({
            projectID: item.projectID,
            directory: item.directory,
            force: true,
          })
        } catch (e) {
          console.error(`Failed to delete unused workspace ${item.directory}:`, e)
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.all })
    },
  })
}
