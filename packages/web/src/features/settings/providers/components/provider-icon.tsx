import {
  Gemini,
  OpenAI,
  Anthropic,
  DeepSeek,
  Groq,
  Mistral,
  Together,
  OpenRouter,
  XAI,
  Cohere,
  Bedrock,
  Ollama,
  Azure,
  OpenCode,
} from '@lobehub/icons'

interface ProviderIconProps {
  providerId: string
  size?: number
  className?: string
  type?: 'color' | 'avatar' | 'mono'
}

export function ProviderIcon({
  providerId,
  size = 24,
  className = '',
}: ProviderIconProps) {
  const normalizedId = providerId?.toLowerCase().trim() || ''

  if (
    normalizedId === 'gemini' ||
    normalizedId === 'google' ||
    normalizedId.includes('gemini') ||
    normalizedId.includes('google')
  ) {
    return (
      <div className={`flex items-center justify-center shrink-0 ${className}`}>
        <Gemini.Color size={size} />
      </div>
    )
  }

  if (normalizedId.includes('openai') || normalizedId.includes('gpt')) {
    return (
      <div className={`flex items-center justify-center shrink-0 ${className}`}>
        <OpenAI size={size} />
      </div>
    )
  }

  if (normalizedId.includes('anthropic') || normalizedId.includes('claude')) {
    return (
      <div className={`flex items-center justify-center shrink-0 ${className}`}>
        <Anthropic size={size} />
      </div>
    )
  }

  if (normalizedId.includes('deepseek')) {
    return (
      <div className={`flex items-center justify-center shrink-0 ${className}`}>
        <DeepSeek.Color size={size} />
      </div>
    )
  }

  if (normalizedId.includes('groq')) {
    return (
      <div className={`flex items-center justify-center shrink-0 ${className}`}>
        <Groq size={size} />
      </div>
    )
  }

  if (normalizedId.includes('mistral')) {
    return (
      <div className={`flex items-center justify-center shrink-0 ${className}`}>
        <Mistral.Color size={size} />
      </div>
    )
  }

  if (normalizedId.includes('together')) {
    return (
      <div className={`flex items-center justify-center shrink-0 ${className}`}>
        <Together.Color size={size} />
      </div>
    )
  }

  if (normalizedId.includes('openrouter')) {
    return (
      <div className={`flex items-center justify-center shrink-0 ${className}`}>
        <OpenRouter.Color size={size} />
      </div>
    )
  }

  if (normalizedId.includes('xai') || normalizedId.includes('grok')) {
    return (
      <div className={`flex items-center justify-center shrink-0 ${className}`}>
        <XAI size={size} />
      </div>
    )
  }

  if (normalizedId.includes('cohere')) {
    return (
      <div className={`flex items-center justify-center shrink-0 ${className}`}>
        <Cohere.Color size={size} />
      </div>
    )
  }

  if (normalizedId.includes('bedrock')) {
    return (
      <div className={`flex items-center justify-center shrink-0 ${className}`}>
        <Bedrock.Color size={size} />
      </div>
    )
  }

  if (normalizedId.includes('ollama')) {
    return (
      <div className={`flex items-center justify-center shrink-0 ${className}`}>
        <Ollama size={size} />
      </div>
    )
  }

  if (normalizedId.includes('azure')) {
    return (
      <div className={`flex items-center justify-center shrink-0 ${className}`}>
        <Azure.Color size={size} />
      </div>
    )
  }

  if (normalizedId === 'opencode') {
    return (
      <div className={`flex items-center justify-center shrink-0 ${className}`}>
        <OpenCode size={size} />
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center shrink-0 ${className}`}>
      <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
        {normalizedId.slice(0, 2) || 'AI'}
      </span>
    </div>
  )
}
