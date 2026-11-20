export interface TestKeyResult {
  ok: boolean
  message: string
}

export function getDefaultProxyUrl(providerId: string): string {
  const p = providerId.toLowerCase()
  if (p.includes('google') || p.includes('gemini')) {
    return 'https://generativelanguage.googleapis.com'
  }
  if (p.includes('openai')) return 'https://api.openai.com/v1'
  if (p.includes('anthropic')) return 'https://api.anthropic.com'
  if (p.includes('groq')) return 'https://api.groq.com/openai/v1'
  if (p.includes('openrouter')) return 'https://openrouter.ai/api/v1'
  if (p.includes('deepseek')) return 'https://api.deepseek.com'
  if (p.includes('mistral')) return 'https://api.mistral.ai/v1'
  if (p.includes('together')) return 'https://api.together.xyz/v1'
  if (p.includes('xai')) return 'https://api.x.ai/v1'
  return ''
}

export async function testApiKey(
  providerId: string,
  apiKey: string,
  proxyUrl?: string,
  testModel?: string
): Promise<TestKeyResult> {
  const key = apiKey.trim()
  if (!key) {
    return { ok: false, message: 'API Key is empty' }
  }

  const pId = providerId.toLowerCase()
  const customBase = proxyUrl?.trim().replace(/\/+$/, '')

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    let url = ''
    let headers: Record<string, string> = {}
    let method = 'GET'
    let body: string | undefined = undefined

    if (pId.includes('openai')) {
      const base = customBase || 'https://api.openai.com/v1'
      url = `${base}/models`
      headers = { Authorization: `Bearer ${key}` }
    } else if (pId.includes('anthropic')) {
      const base = customBase || 'https://api.anthropic.com'
      url = `${base}/v1/messages`
      method = 'POST'
      headers = {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      }
      body = JSON.stringify({
        model: testModel || 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }],
      })
    } else if (pId.includes('google') || pId.includes('gemini')) {
      const base = customBase || 'https://generativelanguage.googleapis.com'
      if (testModel) {
        url = `${base}/v1beta/models/${testModel}?key=${key}`
      } else {
        url = `${base}/v1beta/models?key=${key}`
      }
    } else if (pId.includes('groq')) {
      const base = customBase || 'https://api.groq.com/openai/v1'
      url = `${base}/models`
      headers = { Authorization: `Bearer ${key}` }
    } else if (pId.includes('openrouter')) {
      const base = customBase || 'https://openrouter.ai/api/v1'
      url = `${base}/auth/key`
      headers = { Authorization: `Bearer ${key}` }
    } else if (pId.includes('deepseek')) {
      const base = customBase || 'https://api.deepseek.com'
      url = `${base}/models`
      headers = { Authorization: `Bearer ${key}` }
    } else if (pId.includes('mistral')) {
      const base = customBase || 'https://api.mistral.ai/v1'
      url = `${base}/models`
      headers = { Authorization: `Bearer ${key}` }
    } else if (pId.includes('together')) {
      const base = customBase || 'https://api.together.xyz/v1'
      url = `${base}/models`
      headers = { Authorization: `Bearer ${key}` }
    } else if (pId.includes('xai')) {
      const base = customBase || 'https://api.x.ai/v1'
      url = `${base}/models`
      headers = { Authorization: `Bearer ${key}` }
    } else {
      if (customBase) {
        url = `${customBase}/models`
        headers = { Authorization: `Bearer ${key}` }
      } else {
        return {
          ok: true,
          message: 'Key format saved. Direct online test is not supported for this provider yet.',
        }
      }
    }

    const res = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (res.ok) {
      return { ok: true, message: 'API Key and connectivity check succeeded!' }
    }

    if (res.status === 401 || res.status === 403) {
      return { ok: false, message: 'Invalid API Key or unauthorized access.' }
    }

    if (pId.includes('anthropic') && res.status === 400) {
      return { ok: true, message: 'Anthropic API Key is authenticated!' }
    }

    const data = await res.json().catch(() => null)
    const errorMsg =
      data?.error?.message ||
      data?.message ||
      `HTTP Error ${res.status}: ${res.statusText}`

    return { ok: false, message: errorMsg }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { ok: false, message: 'Connection timed out after 10s.' }
    }
    return {
      ok: false,
      message:
        err instanceof Error
          ? err.message
          : 'Network error or CORS restriction while checking endpoint.',
    }
  }
}
