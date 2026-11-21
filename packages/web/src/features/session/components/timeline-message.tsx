import { useState, useMemo, useEffect } from 'react'
import {
  ChevronDown,
  BrainCircuit,
  Wrench,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Loader2,
  Sparkles,
  FileIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { SessionMessageInfo, SessionMessageAssistant, SessionMessageUser } from '../api'
import { isAssistantFinished } from '../lib/session-busy'
import { MarkdownRenderer } from './markdown-renderer'

interface TimelineMessageProps {
  message: SessionMessageInfo
  /** True while this assistant turn is the live, in-progress one. */
  isLive?: boolean
  retryText?: string
  onRetry?: (text: string) => void
}

/** Composer embeds `[Attached files: a.md, b.md]\\n\\n` — strip for display, keep names. */
function parseAttachedFilesPrefix(text: string) {
  const match = text.match(/^\[Attached files:\s*([^\]]+)\]\s*(?:\n+|$)/)
  if (!match) return { files: [] as string[], body: text }
  const files = match[1]
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
  return { files, body: text.slice(match[0].length) }
}

function formatErrorText(value: unknown): string | undefined {
  if (value == null) return undefined
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const record = value as { message?: unknown; type?: unknown }
    if (typeof record.message === 'string') return record.message
    if (typeof record.message === 'object' && record.message) {
      return formatErrorText(record.message)
    }
    try {
      return JSON.stringify(value)
    } catch {
      return undefined
    }
  }
  return String(value)
}

type ContentPart = SessionMessageAssistant['content'][number] | Record<string, unknown>

function isReasoningPart(part: ContentPart) {
  return (
    (part as { type?: string }).type === 'reasoning' || 'reasoning' in (part as object)
  )
}

function isToolPart(part: ContentPart) {
  return (part as { type?: string }).type === 'tool' || 'tool' in (part as object)
}

function partText(part: ContentPart) {
  const record = part as { text?: string; reasoning?: string }
  if (typeof record.text === 'string') return record.text
  if (typeof record.reasoning === 'string') return record.reasoning
  return ''
}

type HeadlineKind = 'working' | 'thinking' | 'executing' | 'worked' | 'thought' | 'executed' | 'failed'

function deriveHeadline(input: {
  live: boolean
  finished: boolean
  hasError: boolean
  hasReasoning: boolean
  hasTools: boolean
  hasText: boolean
  toolsRunning: boolean
}): { kind: HeadlineKind; live: boolean } {
  if (input.hasError) return { kind: 'failed', live: false }
  if (input.live && !input.finished) {
    if (input.toolsRunning || (input.hasTools && !input.hasText && !input.hasReasoning)) {
      return { kind: 'executing', live: true }
    }
    if (input.hasReasoning && !input.hasText) return { kind: 'thinking', live: true }
    return { kind: 'working', live: true }
  }
  if (input.hasTools && !input.hasText) return { kind: 'executed', live: false }
  if (input.hasReasoning && !input.hasText && !input.hasTools) return { kind: 'thought', live: false }
  return { kind: 'worked', live: false }
}

export function TimelineMessage({ message, isLive, retryText, onRetry }: TimelineMessageProps) {
  const { t } = useTranslation(['model-provider', 'common'])
  const [copied, setCopied] = useState(false)

  if (message.type === 'user') {
    const userMsg = message as SessionMessageUser
    const parsed = parseAttachedFilesPrefix(userMsg.text)

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(parsed.body || userMsg.text)
        setCopied(true)
        toast.success(t('common.copied', 'Copied to clipboard'))
        setTimeout(() => setCopied(false), 2000)
      } catch {
        toast.error('Failed to copy')
      }
    }

    return (
      <div className='flex flex-col items-end gap-1 max-w-2xl ml-auto group py-1 animate-in fade-in slide-in-from-bottom-1 duration-200'>
        <div className='rounded-xl rounded-tr-xs bg-muted/80 text-foreground p-2 text-[13px] leading-relaxed break-words border border-border/40 shadow-2xs space-y-1.5'>
          {parsed.files.length > 0 && (
            <div className='flex flex-wrap gap-1.5'>
              {parsed.files.map((name) => (
                <span
                  key={name}
                  className='inline-flex items-center gap-1 rounded-md border border-border/50 bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'
                >
                  <FileIcon className='h-3 w-3 shrink-0' />
                  <span className='truncate max-w-[160px]'>{name}</span>
                </span>
              ))}
            </div>
          )}
          {parsed.body ? (
            <div className='whitespace-pre-wrap'>{parsed.body}</div>
          ) : null}
        </div>
        <div className='flex items-center gap-1.5 pr-1 opacity-70 group-hover:opacity-100 transition-opacity'>
          <button
            type='button'
            onClick={handleCopy}
            className='flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/60 transition-colors'
            title='Copy message'
          >
            {copied ? <Check className='h-3 w-3 text-emerald-500' /> : <Copy className='h-3 w-3' />}
          </button>
        </div>
      </div>
    )
  }

  if (message.type === 'assistant') {
    return (
      <AssistantMessage
        message={message as SessionMessageAssistant}
        isLive={Boolean(isLive)}
        retryText={retryText}
        onRetry={onRetry}
      />
    )
  }

  if (message.type === 'idle') return null

  if (message.type === 'agent-switched') {
    const agentMsg = message as { agent?: string }
    return (
      <div className='flex items-center justify-center my-2 gap-2 text-[11px] text-muted-foreground/60 select-none animate-in fade-in duration-200'>
        <div className='h-px bg-border/40 flex-1 max-w-[80px]' />
        <span className='capitalize font-medium'>
          {agentMsg.agent ? `Agent switched to ${agentMsg.agent}` : 'Agent switched'}
        </span>
        <div className='h-px bg-border/40 flex-1 max-w-[80px]' />
      </div>
    )
  }

  if (message.type === 'model-switched') {
    const modelMsg = message as { model?: { id?: string } }
    return (
      <div className='flex items-center justify-center my-2 gap-2 text-[11px] text-muted-foreground/60 select-none animate-in fade-in duration-200'>
        <div className='h-px bg-border/40 flex-1 max-w-[80px]' />
        <span className='font-mono'>
          {modelMsg.model?.id ? `Model switched to ${modelMsg.model.id}` : 'Model switched'}
        </span>
        <div className='h-px bg-border/40 flex-1 max-w-[80px]' />
      </div>
    )
  }

  return (
    <div className='flex justify-center my-1.5 animate-in fade-in duration-200'>
      <Badge variant='secondary' className='text-[10px] font-mono text-muted-foreground'>
        {(message as { type?: string }).type || 'event'}
      </Badge>
    </div>
  )
}

function AssistantMessage({
  message,
  isLive,
  retryText,
  onRetry,
}: {
  message: SessionMessageAssistant
  isLive: boolean
  retryText?: string
  onRetry?: (text: string) => void
}) {
  const { t } = useTranslation(['model-provider', 'common'])
  const [copied, setCopied] = useState(false)

  const hasError = Boolean(message.error || message.retry?.error)
  const errorMessage =
    formatErrorText(message.error) || formatErrorText(message.retry?.error)

  const contents = Array.isArray(message.content) ? message.content : []
  const finished = isAssistantFinished(message) || hasError

  const parts = useMemo(() => {
    const reasoning: ContentPart[] = []
    const tools: ContentPart[] = []
    const texts: string[] = []
    for (const item of contents) {
      if (isReasoningPart(item)) {
        if (partText(item).trim()) reasoning.push(item)
        continue
      }
      if (isToolPart(item)) {
        tools.push(item)
        continue
      }
      const text = partText(item) || (typeof item === 'string' ? item : '')
      if (text.trim()) texts.push(text)
    }
    return { reasoning, tools, texts }
  }, [contents])

  const toolsRunning = parts.tools.some((tool) => {
    const status = (tool as { state?: { status?: string } }).state?.status
    return status === 'streaming' || status === 'running'
  })

  const headline = deriveHeadline({
    live: isLive,
    finished,
    hasError,
    hasReasoning: parts.reasoning.length > 0,
    hasTools: parts.tools.length > 0,
    hasText: parts.texts.length > 0,
    toolsRunning,
  })

  const expandable = parts.reasoning.length > 0 || parts.tools.length > 0
  const [activityOpen, setActivityOpen] = useState(() => isLive && expandable)

  useEffect(() => {
    if (isLive && expandable) setActivityOpen(true)
    if (finished && expandable) setActivityOpen(false)
  }, [isLive, finished, expandable])

  const headlineLabel = {
    working: t('session.timeline.working', 'Working'),
    thinking: t('session.timeline.thinking', 'Thinking'),
    executing: t('session.timeline.executing', 'Executing'),
    worked: t('session.timeline.worked', 'Worked'),
    thought: t('session.timeline.thought', 'Thought'),
    executed: t('session.timeline.executed', 'Executed'),
    failed: t('session.errorTitle', 'Generation Failed'),
  }[headline.kind]

  const fullAssistantText = parts.texts.join('\n\n')

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
    <div className='flex items-start max-w-3xl mr-auto group animate-in fade-in slide-in-from-bottom-1 duration-300'>
      <div className='flex flex-col gap-1.5 w-full min-w-0'>
        {/* Status title replaces agent/model — matches app Worked / Thought / Executed language */}
        {expandable ? (
          <button
            type='button'
            onClick={() => setActivityOpen((open) => !open)}
            className='flex items-center gap-1.5 self-start rounded-md px-1 py-0.5 -ms-1 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors'
            aria-expanded={activityOpen}
          >
            <HeadlineIcon kind={headline.kind} live={headline.live} />
            <span className={headline.live ? 'text-muted-foreground animate-pulse' : undefined}>
              {headlineLabel}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                activityOpen ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>
        ) : (
          <div className='flex items-center gap-1.5 text-xs font-semibold text-foreground px-1 -ms-1'>
            <HeadlineIcon kind={headline.kind} live={headline.live} />
            <span className={headline.live ? 'text-muted-foreground animate-pulse' : undefined}>
              {headlineLabel}
            </span>
          </div>
        )}

        {/* Activity (tools + reasoning) — height animates instead of abrupt show/hide */}
        {expandable && (
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
              activityOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-70'
            }`}
          >
            <div className='min-h-0 overflow-hidden space-y-2'>
              {parts.reasoning.map((item, idx) => (
                <div
                  key={`r-${idx}`}
                  className='rounded-lg border border-border/40 bg-muted/40 p-2.5 text-[12px] text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap animate-in fade-in duration-200'
                >
                  {partText(item)}
                </div>
              ))}
              {parts.tools.map((item, idx) => (
                <ToolExecutionBlock key={`t-${idx}`} toolItem={item} />
              ))}
            </div>
          </div>
        )}

        {/* Reply text stays visible */}
        {parts.texts.length > 0 && (
          <div className='space-y-2 text-foreground text-[13px] leading-relaxed animate-in fade-in duration-300'>
            {parts.texts.map((text, idx) => (
              <MarkdownRenderer key={idx} content={text} />
            ))}
          </div>
        )}

        {hasError && (
          <div className='w-full min-w-0 rounded-xl border border-destructive/30 bg-destructive/5 p-3 space-y-2 animate-in fade-in duration-200'>
            <div className='flex items-center gap-2 min-w-0'>
              <AlertTriangle className='h-4 w-4 shrink-0 text-destructive' />
              <span className='min-w-0 flex-1 font-semibold text-xs text-destructive truncate'>
                {t('session.errorTitle', 'Generation Failed')}
              </span>
              {onRetry && retryText && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => onRetry(retryText)}
                  className='h-7 shrink-0 text-xs gap-1 border-destructive/35 text-destructive hover:bg-destructive/10'
                >
                  <RotateCcw className='h-3 w-3' />
                  <span>{t('session.retry', 'Retry')}</span>
                </Button>
              )}
            </div>
            <p className='text-[12px] leading-relaxed text-muted-foreground whitespace-pre-wrap break-words'>
              {errorMessage || t('common.error', 'An error occurred during agent execution.')}
            </p>
          </div>
        )}

          {fullAssistantText && (
            <div className='flex items-center gap-2 pt-0.5 opacity-75 group-hover:opacity-100 transition-opacity'>
              <button
                type='button'
                onClick={handleCopy}
                className='flex items-center text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/60 transition-colors'
                title={copied ? t('common.copied', 'Copied') : t('common.copy', 'Copy response')}
              >
                {copied ? <Check className='h-3 w-3 text-emerald-500' /> : <Copy className='h-3 w-3' />}
              </button>
            </div>
          )}
      </div>
    </div>
  )
}

function HeadlineIcon({ kind, live }: { kind: HeadlineKind; live: boolean }) {
  if (live) {
    if (kind === 'thinking') return <BrainCircuit className='h-3.5 w-3.5 text-amber-500 animate-pulse' />
    if (kind === 'executing') return <Wrench className='h-3.5 w-3.5 text-primary animate-pulse' />
    return <Loader2 className='h-3.5 w-3.5 text-primary animate-spin' />
  }
  if (kind === 'failed') return <AlertTriangle className='h-3.5 w-3.5 text-destructive' />
  if (kind === 'thought') return <BrainCircuit className='h-3.5 w-3.5 text-amber-500' />
  if (kind === 'executed') return <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
  return <Sparkles className='h-3.5 w-3.5 text-muted-foreground' />
}

function ToolExecutionBlock({ toolItem }: { toolItem: unknown }) {
  const { t } = useTranslation(['model-provider', 'common'])
  const item = toolItem as {
    name?: string
    tool?: string
    state?: {
      status?: string
      input?: unknown
      content?: unknown
      error?: string
    }
    time?: { completed?: number }
  }

  const toolName = item.name || item.tool || 'tool'
  const status = item.state?.status
  const running = status === 'streaming' || status === 'running'
  const failed = status === 'error'
  const isCommand =
    toolName.includes('bash') || toolName.includes('cmd') || toolName.includes('shell') || toolName === 'execute'

  const [open, setOpen] = useState(running)
  useEffect(() => {
    if (running) setOpen(true)
    if (!running && (status === 'completed' || failed)) setOpen(false)
  }, [running, status, failed])

  const detail = item.state?.input ?? item.state?.content
  const hasDetail = detail !== undefined && detail !== null

  return (
    <div className='overflow-hidden rounded-lg border border-border/60 bg-muted/50 text-foreground text-xs shadow-2xs animate-in fade-in duration-200'>
      <button
        type='button'
        disabled={!hasDetail}
        onClick={() => hasDetail && setOpen((value) => !value)}
        className='flex w-full items-center justify-between gap-2 border-b border-border/50 px-3 py-1.5 bg-muted/70 text-left disabled:cursor-default'
      >
        <div className='flex min-w-0 items-center gap-1.5'>
          {isCommand ? (
            <Terminal className='h-3.5 w-3.5 text-emerald-500 shrink-0' />
          ) : (
            <Wrench className='h-3.5 w-3.5 text-primary shrink-0' />
          )}
          <span className='font-mono font-medium text-[11px] truncate'>{toolName}</span>
          {hasDetail && (
            <ChevronDown
              className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${
                open ? 'rotate-0' : '-rotate-90'
              }`}
            />
          )}
        </div>
        <div className='flex items-center gap-1 text-[10px] text-muted-foreground shrink-0'>
          {running ? (
            <>
              <Loader2 className='h-3 w-3 animate-spin text-primary' />
              <span>{t('session.timeline.executing', 'Executing')}</span>
            </>
          ) : failed ? (
            <>
              <AlertTriangle className='h-3 w-3 text-destructive' />
              <span>{t('session.timeline.failed', 'Failed')}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className='h-3 w-3 text-emerald-500' />
              <span>{t('session.timeline.executed', 'Executed')}</span>
            </>
          )}
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-250 ease-out ${
          open && hasDetail ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className='min-h-0 overflow-hidden'>
          {hasDetail && (
            <pre className='p-2.5 overflow-x-auto font-mono text-[11px] text-muted-foreground bg-background/40 leading-relaxed max-h-48'>
              <code>
                {typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2)}
              </code>
            </pre>
          )}
          {failed && item.state?.error != null && (
            <p className='px-2.5 pb-2.5 text-[11px] text-destructive'>
              {formatErrorText(item.state.error)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
