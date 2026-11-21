import { useState, useMemo } from 'react'
import {
  Bot,
  ChevronDown,
  ChevronRight,
  BrainCircuit,
  Wrench,
  Terminal,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { MarkdownRenderer } from './markdown-renderer'
import type { SessionMessageInfo, SessionMessageAssistant, SessionMessageUser } from '../api'

interface TimelineMessageProps {
  message: SessionMessageInfo
  onRetry?: (text: string) => void
}

export function TimelineMessage({ message, onRetry }: TimelineMessageProps) {
  const { t } = useTranslation(['model-provider', 'common'])
  const [copied, setCopied] = useState(false)

  // User Message
  if (message.type === 'user') {
    const userMsg = message as SessionMessageUser

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(userMsg.text)
        setCopied(true)
        toast.success(t('common.copied', 'Copied to clipboard'))
        setTimeout(() => setCopied(false), 2000)
      } catch {
        toast.error('Failed to copy')
      }
    }

    return (
      <div className='flex flex-col items-end gap-1 max-w-2xl ml-auto group py-1'>
        {/* User Message Bubble */}
        <div className='rounded-2xl rounded-tr-xs bg-muted/80 text-foreground px-3.5 py-2 text-[13px] leading-relaxed whitespace-pre-wrap break-words border border-border/40 shadow-2xs'>
          {userMsg.text}
        </div>

        {/* Small Action Bar beneath user message */}
        <div className='flex items-center gap-1.5 pr-1 opacity-70 group-hover:opacity-100 transition-opacity'>
          {userMsg.time?.created && (
            <span className='text-[10px] text-muted-foreground/70 font-mono'>
              {new Date(userMsg.time.created).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
          <button
            type='button'
            onClick={handleCopy}
            className='flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/60 transition-colors'
            title='Copy message'
          >
            {copied ? (
              <Check className='h-3 w-3 text-emerald-500' />
            ) : (
              <Copy className='h-3 w-3' />
            )}
          </button>
        </div>
      </div>
    )
  }

  // Assistant Message
  if (message.type === 'assistant') {
    const asstMsg = message as SessionMessageAssistant
    const hasError = Boolean(asstMsg.error || asstMsg.retry?.error)
    const errorMessage =
      (asstMsg.error as { message?: string })?.message ||
      (asstMsg.retry?.error as { message?: string })?.message ||
      (typeof asstMsg.error === 'string' ? asstMsg.error : undefined)

    const contents = asstMsg.content && Array.isArray(asstMsg.content) ? asstMsg.content : []

    const fullAssistantText = useMemo(() => {
      if (!contents || contents.length === 0) return ''
      return contents
        .map((item) => {
          if ('text' in item && typeof item.text === 'string') return item.text
          if (typeof item === 'string') return item
          return ''
        })
        .filter(Boolean)
        .join('\n\n')
    }, [contents])

    const handleCopy = async () => {
      if (!fullAssistantText) return
      try {
        await navigator.clipboard.writeText(fullAssistantText)
        setCopied(true)
        toast.success(t('common.copied', 'Copied to clipboard'))
        setTimeout(() => setCopied(false), 2000)
      } catch {
        toast.error('Failed to copy')
      }
    }

    return (
      <div className='flex items-start gap-2.5 max-w-3xl mr-auto group py-1.5'>
        {/* Agent Avatar */}
        <div className='h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 shadow-2xs border border-primary/20'>
          <Bot className='h-3.5 w-3.5' />
        </div>

        <div className='flex flex-col gap-1 max-w-[94%] flex-1 min-w-0'>
          {/* Header Info */}
          <div className='flex items-center gap-2'>
            <span className='font-semibold text-xs text-foreground'>
              {asstMsg.agent || 'OpenCode Agent'}
            </span>
            {asstMsg.model && (
              <Badge variant='outline' className='text-[10px] h-4 px-1.5 font-mono text-muted-foreground'>
                {typeof asstMsg.model === 'string'
                  ? asstMsg.model
                  : (asstMsg.model as { id?: string }).id || 'model'}
              </Badge>
            )}
          </div>

          {/* Content Array */}
          <div className='space-y-2 text-foreground text-[13px] leading-relaxed'>
            {contents.length > 0 ? (
              contents.map((item, idx) => {
                // Reasoning / Thinking Block
                if ('reasoning' in item || (item as { type?: string }).type === 'reasoning') {
                  const reasoningText =
                    (item as { reasoning?: string }).reasoning ||
                    (item as { text?: string }).text ||
                    ''
                  return <ThinkingBlock key={idx} text={reasoningText} />
                }

                // Tool Execution Block
                if ('tool' in item || (item as { type?: string }).type === 'tool') {
                  return <ToolExecutionBlock key={idx} toolItem={item} />
                }

                // Plain Text Block
                const text =
                  (item as { text?: string }).text ||
                  (typeof item === 'string' ? item : '')
                if (text) {
                  return <MarkdownRenderer key={idx} content={text} />
                }

                return null
              })
            ) : hasError ? null : (
              <div className='flex items-center gap-2 text-xs text-muted-foreground animate-pulse py-1'>
                <Sparkles className='h-3.5 w-3.5 text-primary' />
                <span>{t('session.status.streaming', 'Generating response...')}</span>
              </div>
            )}

            {/* Error Banner when execution failed */}
            {hasError && (
              <div className='rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex items-start justify-between gap-3'>
                <div className='flex items-start gap-2'>
                  <AlertTriangle className='h-4 w-4 shrink-0 mt-0.5' />
                  <div>
                    <span className='font-semibold block mb-0.5'>
                      {t('session.errorTitle', 'Generation Failed')}
                    </span>
                    <span className='text-muted-foreground leading-relaxed text-[12px]'>
                      {errorMessage || t('common.error', 'An error occurred during agent execution.')}
                    </span>
                  </div>
                </div>

                {onRetry && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onRetry(errorMessage || 'Retry')}
                    className='h-7 text-xs gap-1 border-destructive/40 text-destructive hover:bg-destructive/10'
                  >
                    <RotateCcw className='h-3 w-3' />
                    <span>{t('session.retry', 'Retry')}</span>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Action bar beneath assistant response */}
          <div className='flex items-center gap-2 pt-1 opacity-75 group-hover:opacity-100 transition-opacity'>
            {asstMsg.time?.created && (
              <span className='text-[10px] text-muted-foreground/70 font-mono'>
                {new Date(asstMsg.time.created).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}

            {fullAssistantText && (
              <button
                type='button'
                onClick={handleCopy}
                className='flex items-center text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/60 transition-colors'
                title={copied ? t('common.copied', 'Copied') : t('common.copy', 'Copy response')}
              >
                {copied ? (
                  <Check className='h-3 w-3 text-emerald-500' />
                ) : (
                  <Copy className='h-3 w-3' />
                )}
              </button>
            )}

            {asstMsg.tokens && (asstMsg.tokens.output ?? 0) > 0 && (
              <span className='text-[10px] text-muted-foreground/60 font-mono ml-auto'>
                {asstMsg.tokens.output} tokens
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // System boundaries like 'idle' should not render as message bubbles
  if (message.type === 'idle') {
    return null
  }

  // Agent switch notice
  if (message.type === 'agent-switched') {
    const agentMsg = message as { agent?: string }
    return (
      <div className='flex items-center justify-center my-2 gap-2 text-[11px] text-muted-foreground/60 select-none'>
        <div className='h-px bg-border/40 flex-1 max-w-[80px]' />
        <span className='capitalize font-medium'>
          {agentMsg.agent ? `Agent switched to ${agentMsg.agent}` : 'Agent switched'}
        </span>
        <div className='h-px bg-border/40 flex-1 max-w-[80px]' />
      </div>
    )
  }

  // Model switch notice
  if (message.type === 'model-switched') {
    const modelMsg = message as { model?: { id?: string } }
    return (
      <div className='flex items-center justify-center my-2 gap-2 text-[11px] text-muted-foreground/60 select-none'>
        <div className='h-px bg-border/40 flex-1 max-w-[80px]' />
        <span className='font-mono'>
          {modelMsg.model?.id ? `Model switched to ${modelMsg.model.id}` : 'Model switched'}
        </span>
        <div className='h-px bg-border/40 flex-1 max-w-[80px]' />
      </div>
    )
  }

  // Fallback for other message types (system, shell, etc.)
  return (
    <div className='flex justify-center my-1.5'>
      <Badge variant='secondary' className='text-[10px] font-mono text-muted-foreground'>
        {(message as { type?: string }).type || 'event'}
      </Badge>
    </div>
  )
}

function ThinkingBlock({ text }: { text: string }) {
  const { t } = useTranslation(['model-provider', 'common'])
  const [open, setOpen] = useState(false)

  if (!text) return null

  return (
    <Collapsible open={open} onOpenChange={setOpen} className='my-1'>
      <CollapsibleTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='w-full justify-between h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/60 border border-border/40 rounded-lg'
        >
          <div className='flex items-center gap-1.5'>
            <BrainCircuit className='h-3.5 w-3.5 text-amber-500' />
            <span className='font-medium text-[12px]'>{t('session.thinking', 'Reasoning Process')}</span>
          </div>
          {open ? <ChevronDown className='h-3 w-3' /> : <ChevronRight className='h-3 w-3' />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className='pt-1'>
        <div className='rounded-lg bg-muted/50 border border-border/30 p-2.5 text-[12px] text-muted-foreground font-mono leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap'>
          {text}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function ToolExecutionBlock({ toolItem }: { toolItem: unknown }) {
  const item = toolItem as {
    tool?: string
    name?: string
    input?: unknown
    args?: unknown
    status?: string
    result?: unknown
  }

  const toolName = item.tool || item.name || 'tool_call'
  const isCommand = toolName.includes('bash') || toolName.includes('cmd') || toolName.includes('shell')

  return (
    <Card className='my-1 overflow-hidden border-border/60 bg-zinc-950 text-zinc-200 text-xs shadow-2xs rounded-lg'>
      <div className='flex items-center justify-between border-b border-border/40 px-3 py-1.5 bg-zinc-900/80'>
        <div className='flex items-center gap-1.5'>
          {isCommand ? (
            <Terminal className='h-3.5 w-3.5 text-emerald-400' />
          ) : (
            <Wrench className='h-3.5 w-3.5 text-primary' />
          )}
          <span className='font-mono font-medium text-[11px]'>{toolName}</span>
        </div>
        <div className='flex items-center gap-1 text-[10px] text-zinc-400'>
          <CheckCircle2 className='h-3 w-3 text-emerald-400' />
          <span>Executed</span>
        </div>
      </div>

      {Boolean(item.input || item.args) && (
        <pre className='p-2.5 overflow-x-auto font-mono text-[11px] text-zinc-300 bg-zinc-950/50 leading-relaxed max-h-48'>
          <code>{JSON.stringify(item.input || item.args, null, 2)}</code>
        </pre>
      )}
    </Card>
  )
}
