import { OpenCode, type OpenCodeClient } from '@opencode/client'

const STORAGE_KEY_URL = 'agent_platform_server_url'
const STORAGE_KEY_PASSWORD = 'agent_platform_server_password'

export interface ServerConfig {
  serverUrl: string
  serverPassword: string
}

export function getServerConfig(): ServerConfig {
  const storedUrl =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY_URL) ||
        localStorage.getItem('opencode_server_url')
      : null
  const storedPass =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY_PASSWORD) ||
        localStorage.getItem('opencode_server_password')
      : null

  let serverUrl =
    storedUrl?.trim() ||
    (import.meta.env.VITE_OPENCODE_SERVER_URL as string | undefined)?.trim() ||
    'http://127.0.0.1:49375'

  if (!/^https?:\/\//i.test(serverUrl)) {
    serverUrl = `http://${serverUrl}`
  }

  const serverPassword =
    (storedPass !== null
      ? storedPass
      : (import.meta.env.VITE_OPENCODE_SERVER_PASSWORD as string | undefined)
    )?.trim() || 'y6BBma_nwnkw9WVkiC0mBpfJKfrCHCA2KKul-mUM70c'

  return { serverUrl, serverPassword }
}

function makeClient(config: ServerConfig): OpenCodeClient {
  const headers: Record<string, string> = {}
  if (config.serverPassword) {
    headers['Authorization'] = `Basic ${btoa(`opencode:${config.serverPassword}`)}`
  }
  return OpenCode.make({
    baseUrl: config.serverUrl,
    headers,
  })
}

let currentConfig = getServerConfig()
let clientInstance = makeClient(currentConfig)

export const agentPlatformClient: OpenCodeClient = new Proxy(
  {} as unknown as OpenCodeClient,
  {
    get(_target, prop) {
      return (clientInstance as unknown as Record<string | symbol, unknown>)[prop]
    },
  }
)

/**
 * Backward compatibility alias for agentPlatformClient
 */
export const opencodeClient: OpenCodeClient = agentPlatformClient

export function setServerConfig(url: string, password: string): ServerConfig {
  let normalizedUrl = url.trim()
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `http://${normalizedUrl}`
  }
  const cleanPassword = password.trim()

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, normalizedUrl)
    localStorage.setItem(STORAGE_KEY_PASSWORD, cleanPassword)
  }

  currentConfig = { serverUrl: normalizedUrl, serverPassword: cleanPassword }
  clientInstance = makeClient(currentConfig)
  return currentConfig
}

export async function verifyServerConnection(
  url: string,
  password: string
): Promise<{ ok: boolean; message: string }> {
  let normalizedUrl = url.trim()
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `http://${normalizedUrl}`
  }
  const headers: Record<string, string> = {}
  if (password.trim()) {
    headers['Authorization'] = `Basic ${btoa(`opencode:${password.trim()}`)}`
  }
  try {
    const res = await fetch(
      `${normalizedUrl.replace(/\/+$/, '')}/api/integration`,
      {
        headers,
      }
    )
    if (res.ok) {
      return { ok: true, message: 'Connected to server successfully!' }
    }
    if (res.status === 401) {
      return {
        ok: false,
        message: 'Authentication failed: Server password is incorrect.',
      }
    }
    return {
      ok: false,
      message: `Server returned HTTP ${res.status}: ${res.statusText}`,
    }
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error
          ? err.message
          : 'Could not connect to server at this URL.',
    }
  }
}
