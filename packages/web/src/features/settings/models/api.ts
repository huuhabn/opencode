import { useQuery } from '@tanstack/react-query'
import { agentPlatformClient } from '@/lib/agent-platform-client'

export const modelQueryKeys = {
  all: ['models'] as const,
  default: ['models', 'default'] as const,
}

export function useModels() {
  return useQuery({
    queryKey: modelQueryKeys.all,
    queryFn: async () => {
      const res = await agentPlatformClient.model.list()
      return res.data
    },
    retry: 1,
    staleTime: 1000 * 30,
  })
}

export function useDefaultModel() {
  return useQuery({
    queryKey: modelQueryKeys.default,
    queryFn: async () => {
      const res = await agentPlatformClient.model.default()
      return res.data
    },
    retry: 1,
    staleTime: 1000 * 30,
  })
}
