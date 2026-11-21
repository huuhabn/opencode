import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { agentPlatformClient } from '@/lib/agent-platform-client'
import type {
  SessionInfo,
  SessionMessageInfo,
  SessionMessageAssistant,
  SessionMessageUser,
} from '@opencode/client/promise'

export type { SessionInfo, SessionMessageInfo, SessionMessageAssistant, SessionMessageUser }

export interface SkillItem {
  id: string
  name?: string
  description?: string
  path?: string
  content?: string
}

export interface AgentItem {
  id: string
  name: string
  description?: string
  mode?: string
  hidden?: boolean
}

export const sessionQueryKeys = {
  all: ['session'] as const,
  list: () => ['session', 'list'] as const,
  detail: (sessionID: string) => ['session', 'detail', sessionID] as const,
  messages: (sessionID: string) => ['session', 'messages', sessionID] as const,
  skills: () => ['skills', 'list'] as const,
}

export function useSessionsList() {
  return useQuery({
    queryKey: sessionQueryKeys.list(),
    queryFn: async () => {
      const res = await agentPlatformClient.session.list({ limit: 100, order: 'desc' })
      return (Array.isArray(res) ? res : ((res?.data ?? []) as SessionInfo[])) as SessionInfo[]
    },
    staleTime: 5_000,
  })
}

export function useSessionDetails(sessionID?: string) {
  return useQuery({
    queryKey: sessionQueryKeys.detail(sessionID ?? ''),
    queryFn: async () => {
      if (!sessionID) return null
      const res = await agentPlatformClient.session.get({ sessionID })
      return (res && 'data' in res ? (res as { data: SessionInfo }).data : res) as SessionInfo
    },
    enabled: !!sessionID,
    staleTime: 5_000,
  })
}

export function useSessionMessages(sessionID?: string, isLive?: boolean) {
  return useQuery({
    queryKey: sessionQueryKeys.messages(sessionID ?? ''),
    queryFn: async () => {
      if (!sessionID) return []
      const res = await agentPlatformClient.message.list({ sessionID, limit: 100 })
      const list = (res?.data ?? (Array.isArray(res) ? res : [])) as SessionMessageInfo[]
      // Sort ascending by time.created so oldest is at top, newest at bottom
      return [...list].sort((a, b) => {
        const tA = (a.time as { created?: number })?.created ?? 0
        const tB = (b.time as { created?: number })?.created ?? 0
        return tA - tB
      })
    },
    enabled: !!sessionID,
    refetchInterval: isLive ? 800 : 2500,
  })
}

export function useSkillsList() {
  return useQuery({
    queryKey: sessionQueryKeys.skills(),
    queryFn: async () => {
      try {
        const res = await agentPlatformClient.skill.list()
        return (res?.data ?? (Array.isArray(res) ? res : [])) as SkillItem[]
      } catch {
        return [] as SkillItem[]
      }
    },
    staleTime: 60_000,
  })
}

export function useAgentsList() {
  return useQuery({
    queryKey: ['agents', 'list'] as const,
    queryFn: async () => {
      try {
        const res = await agentPlatformClient.agent.list()
        const list = (res?.data ?? (Array.isArray(res) ? res : [])) as AgentItem[]
        return list.filter((a) => !a.hidden)
      } catch {
        return [
          { id: 'build', name: 'Build', description: 'The default agent. Executes tools based on configured permissions.' },
          { id: 'plan', name: 'Plan', description: 'Read-only agent for exploring the codebase and planning work.' },
          { id: 'explore', name: 'Explore', description: 'Fast agent specialized for exploring codebases.' },
        ] as AgentItem[]
      }
    },
    staleTime: 60_000,
  })
}

export type ComposerModelRef = { id: string; providerID: string; variant?: string }

export function useCreateSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params?: {
      title?: string
      projectID?: string
      directory?: string
      agent?: string
      model?: ComposerModelRef
    }) => {
      let dir = params?.directory
      if (!dir) {
        try {
          const projectsRes = await agentPlatformClient.project.list()
          const projects = Array.isArray(projectsRes)
            ? projectsRes
            : ((projectsRes as { data?: Array<{ canonical?: string }> })?.data ?? [])
          if (projects.length > 0 && projects[0].canonical) {
            dir = projects[0].canonical
          }
        } catch {
          // fallback to undefined
        }
      }

      const location = dir ? { directory: dir } : undefined
      const res = await agentPlatformClient.session.create({
        title: params?.title,
        agent: params?.agent || 'build',
        location,
        model: params?.model,
      })
      return (res && 'data' in res ? (res as { data: SessionInfo }).data : res) as SessionInfo
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.list() })
    },
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      sessionID,
      title,
    }: {
      sessionID: string
      title: string
    }) => {
      await agentPlatformClient.session.update({
        sessionID,
        title,
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.list() })
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.detail(variables.sessionID) })
    },
  })
}

export function useForkSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (sessionID: string) => {
      const res = await agentPlatformClient.session.fork({ sessionID })
      return (res && 'data' in res ? (res as { data: SessionInfo }).data : res) as SessionInfo
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.list() })
    },
  })
}

export function useDeleteSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (sessionID: string) => {
      await agentPlatformClient.session.remove({ sessionID })
    },
    onSuccess: (_data, sessionID) => {
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.list() })
      queryClient.removeQueries({ queryKey: sessionQueryKeys.detail(sessionID) })
      queryClient.removeQueries({ queryKey: sessionQueryKeys.messages(sessionID) })
    },
  })
}

export function useSendPrompt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      sessionID,
      text,
      agent,
      model,
    }: {
      sessionID: string
      text: string
      agent?: string
      model?: ComposerModelRef
    }) => {
      // Mirror packages/app applySelection: switch only when agent/model/variant changed,
      // then admit the prompt. Core execution reads session.agent / session.model.
      const currentRes = await agentPlatformClient.session.get({ sessionID })
      const current = (
        currentRes && 'data' in currentRes ? (currentRes as { data: SessionInfo }).data : currentRes
      ) as SessionInfo | null

      if (agent && current?.agent !== agent) {
        await agentPlatformClient.session.switchAgent({ sessionID, agent })
      }

      if (model) {
        const next = `${model.providerID}/${model.id}/${model.variant ?? ''}`
        const saved =
          current?.model &&
          `${current.model.providerID}/${current.model.id}/${current.model.variant ?? ''}`
        const agentUnchanged = !agent || current?.agent === agent

        if (!agentUnchanged || saved !== next || current?.revert) {
          await agentPlatformClient.session.switchModel({
            sessionID,
            model: {
              id: model.id,
              providerID: model.providerID,
              variant: model.variant,
            },
          })
        }
      }

      const res = await agentPlatformClient.session.prompt({
        sessionID,
        text,
        delivery: 'steer',
        metadata: {
          ...(agent ? { agent } : {}),
          ...(model
            ? {
                model: {
                  modelID: model.id,
                  providerID: model.providerID,
                  ...(model.variant ? { variant: model.variant } : {}),
                },
              }
            : {}),
        },
      })
      return res
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.messages(variables.sessionID) })
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.detail(variables.sessionID) })
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.list() })
    },
  })
}

export function useInterruptSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (sessionID: string) => {
      await agentPlatformClient.session.interrupt({ sessionID })
    },
    onSuccess: (_data, sessionID) => {
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.messages(sessionID) })
    },
  })
}
