import { useQuery } from '@tanstack/react-query'
import type { ModelInfo } from '@opencode/client'
import {
  agentPlatformClient,
  getServerConfig,
} from '@/lib/agent-platform-client'

export const modelQueryKeys = {
  all: ['models'] as const,
  default: ['models', 'default'] as const,
}

/**
 * Normalizes any model payload (OpenCode format, custom JSON, OpenAI format)
 * into a ModelInfo object compatible with ModelCard.
 */
export function normalizeModelItem(item: any): ModelInfo {
  if (!item || typeof item !== 'object') {
    return {
      id: String(item || 'unknown'),
      name: String(item || 'unknown'),
      providerID: 'custom',
    } as ModelInfo
  }

  const id = item.id || item.modelID || item.name || 'unknown'
  const name = item.name || id

  // Extract providerID if missing (e.g. "openai/gpt-4o" -> "openai")
  let providerID = item.providerID || item.provider || item.owned_by
  if (!providerID && typeof id === 'string' && id.includes('/')) {
    providerID = id.split('/')[0]
  }
  if (!providerID) {
    providerID = 'custom'
  }

  // Modalities / capabilities
  const rawInput = item.capabilities?.input || item.modalities?.input
  let inputCaps: string[] = ['text']
  if (Array.isArray(rawInput)) {
    inputCaps = rawInput.map(String)
  } else if (item.multimodal || item.hasVision) {
    inputCaps = ['text', 'image']
  }

  const contextLimit =
    item.limit?.context ??
    item.context_length ??
    item.max_tokens ??
    item.context_window

  const hasTools = Boolean(
    item.capabilities?.tools ?? item.tools ?? item.function_calling
  )

  const hasReasoning = Boolean(
    item.capabilities?.reasoning ??
      item.reasoning ??
      (Array.isArray(item.variants) && item.variants.length > 0)
  )

  return {
    ...item,
    id,
    modelID: item.modelID || id,
    name,
    providerID,
    type: item.type || 'chat',
    family: item.family || '',
    limit: {
      context: contextLimit,
      output: item.limit?.output ?? item.max_output_tokens,
    },
    capabilities: {
      input: inputCaps,
      output: Array.isArray(item.capabilities?.output)
        ? item.capabilities.output
        : ['text'],
      tools: hasTools,
      reasoning: hasReasoning,
    },
    cost: Array.isArray(item.cost) ? item.cost : [],
    variants: item.variants || (hasReasoning ? [{ id: 'reasoning' }] : []),
  } as ModelInfo
}

/**
 * Transforms diverse API responses (e.g. { data: [...] }, { models: [...] }, or raw array)
 * into a clean list of ModelInfo items.
 */
export function transformModelsResponse(data: unknown): ModelInfo[] {
  if (!data) return []

  let list: any[] = []
  if (Array.isArray(data)) {
    list = data
  } else if (data && typeof data === 'object') {
    const obj = data as Record<string, any>
    if (Array.isArray(obj.data)) {
      list = obj.data
    } else if (Array.isArray(obj.models)) {
      list = obj.models
    } else if (Array.isArray(obj.items)) {
      list = obj.items
    } else {
      // Map of models: { [id]: modelObj }
      list = Object.values(obj).filter(
        (v) => v && typeof v === 'object' && ('id' in v || 'name' in v)
      )
    }
  }

  return list.map(normalizeModelItem)
}

/**
 * Fetches models from OpenCode server.
 * OpenCode protocol uses `/api/model` (singular).
 * We fetch and transform the response to ensure it matches the ModelCard component.
 */
export async function fetchModels(): Promise<ModelInfo[]> {
  const { serverUrl, serverPassword } = getServerConfig()
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (serverPassword.trim()) {
    headers['Authorization'] = `Basic ${btoa(`opencode:${serverPassword.trim()}`)}`
  }

  const cleanUrl = serverUrl.replace(/\/+$/, '')

  // 1. First try client SDK (which calls GET /api/model)
  try {
    const res = await agentPlatformClient.model.list()
    return transformModelsResponse(res.data)
  } catch {
    // 2. Direct fetch to /api/model if client call fails
    try {
      const res = await fetch(`${cleanUrl}/api/model`, { headers })
      if (res.ok) {
        const json = await res.json()
        return transformModelsResponse(json)
      }
      if (res.status === 401) {
        throw new Error('Authentication required: incorrect server password')
      }
    } catch (directErr) {
      if (directErr instanceof Error && directErr.message.includes('Authentication')) {
        throw directErr
      }
    }
    return []
  }
}

export function useModels() {
  return useQuery({
    queryKey: modelQueryKeys.all,
    queryFn: fetchModels,
    retry: 1,
    staleTime: 1000 * 30,
  })
}

function readJsonLocalStorage(key: string): unknown {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/** Resolve credential/integration id that owns this model.providerID. */
export function matchConnectedProviderId(
  providerID: string,
  connectedProviderIds: Iterable<string>
) {
  const target = providerID.toLowerCase()
  for (const id of connectedProviderIds) {
    const connected = id.toLowerCase()
    if (
      connected === target ||
      connected.includes(target) ||
      target.includes(connected)
    ) {
      return id
    }
  }
  return undefined
}

function isProviderToggleEnabled(providerId: string, connected: boolean) {
  const saved = readJsonLocalStorage(`opencode_provider_enabled_${providerId}`)
  if (typeof saved === 'boolean') return saved
  return connected
}

function isModelToggleEnabled(providerId: string, modelId: string) {
  const saved = readJsonLocalStorage(`opencode_provider_settings_${providerId}`)
  if (!saved || typeof saved !== 'object') return true
  const map = (saved as { enabledModels?: Record<string, boolean> }).enabledModels
  if (!map || typeof map !== 'object') return true
  if (Object.prototype.hasOwnProperty.call(map, modelId)) return Boolean(map[modelId])
  return true
}

/**
 * Models usable in the composer: from a connected provider that is enabled
 * in /settings/providers, and with the per-model enable toggle on.
 */
export function filterEnabledConnectedModels(
  models: ModelInfo[],
  connectedProviderIds: Iterable<string>
) {
  const connected = connectedProviderIds instanceof Set
    ? connectedProviderIds
    : new Set(connectedProviderIds)

  return models.filter((model) => {
    const providerId = matchConnectedProviderId(model.providerID, connected)
    if (!providerId) return false
    if (!isProviderToggleEnabled(providerId, true)) return false
    return isModelToggleEnabled(providerId, model.id)
  })
}

export function useDefaultModel() {
  return useQuery({
    queryKey: modelQueryKeys.default,
    queryFn: async () => {
      try {
        const res = await agentPlatformClient.model.default()
        return res.data
      } catch {
        return null
      }
    },
    retry: 1,
    staleTime: 1000 * 30,
  })
}
