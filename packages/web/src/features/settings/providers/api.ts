import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { agentPlatformClient } from '@/lib/agent-platform-client'

export const providerQueryKeys = {
  all: ['providers'] as const,
  integrations: ['integrations'] as const,
  credentials: ['credentials'] as const,
  models: ['models'] as const,
}

export function useIntegrations() {
  return useQuery({
    queryKey: providerQueryKeys.integrations,
    queryFn: async () => {
      const res = await agentPlatformClient.integration.list()
      return res.data
    },
    retry: 1,
    staleTime: 1000 * 15,
  })
}

export function useCredentials() {
  return useQuery({
    queryKey: providerQueryKeys.credentials,
    queryFn: async () => {
      const res = await agentPlatformClient.credential.list()
      return res
    },
    retry: 1,
    staleTime: 1000 * 15,
  })
}

export function useActivateCredential() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (credentialID: string) => {
      await agentPlatformClient.credential.activate({ credentialID })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.integrations })
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.credentials })
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.models })
    },
  })
}

export function useRemoveCredential() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (credentialID: string) => {
      await agentPlatformClient.credential.remove({ credentialID })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.integrations })
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.credentials })
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.models })
    },
  })
}

export function useUpdateCredential() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      credentialID,
      label,
    }: {
      credentialID: string
      label: string
    }) => {
      await agentPlatformClient.credential.update({ credentialID, label })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.integrations })
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.credentials })
    },
  })
}

export function useConnectKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      integrationID,
      key,
      label,
    }: {
      integrationID: string
      key: string
      label?: string
    }) => {
      await agentPlatformClient.integration.connect.key({
        integrationID,
        key,
        label,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.integrations })
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.credentials })
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.models })
    },
  })
}
