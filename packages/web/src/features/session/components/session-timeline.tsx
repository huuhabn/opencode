import { useEffect, useRef, useState } from 'react'
import {
  Bot,
  Terminal,
  Code2,
  Sparkles,
  Square,
  ArrowDown,
  BrainCircuit,
  Loader2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { TimelineMessage } from './timeline-message'
import type { SessionMessageInfo } from '../api'

interface SessionTimelineProps {
  messages: SessionMessageInfo[]
  isLoading?: boolean
  isStreaming?: boolean
  onQuickPrompt?: (prompt: string) => void
  onRetry?: (text: string) => void
  onInterrupt?: () => void
}

export function SessionTimeline({
  messages,
  isLoading,
  isStreaming,
  onQuickPrompt,
  onRetry,
  onInterrupt,
}: SessionTimelineProps) {
  const { t } = useTranslation(['model-provider', 'common'])
  const containerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const [isNearBottom, setIsNearBottom] = useState(true)

  // Track elapsed thinking time
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null
    if (isStreaming) {
      setElapsedSeconds(0)
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      setElapsedSeconds(0)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isStreaming])

  // Smart auto-scroll: only scroll down if user is near bottom
  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const atBottom = scrollHeight - scrollTop - clientHeight < 120
    setIsNearBottom(atBottom)
  }

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
    setIsNearBottom(true)
  }

  useEffect(() => {
    if (isNearBottom) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isStreaming, isNearBottom])

  if (isLoading) {
    return (
      <div className='flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex gap-3 max-w-xl ${i % 2 === 0 ? 'ml-auto justify-end' : ''}`}
          >
            <div className='h-7 w-7 rounded-lg bg-muted/60 animate-pulse shrink-0' />
            <div className='h-16 w-72 rounded-2xl bg-muted/40 animate-pulse' />
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className='flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center p-6 text-center select-text'>
        <div className='h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 shadow-2xs'>
          <Bot className='h-6 w-6' />
        </div>
        <h3 className='font-semibold text-sm tracking-tight text-foreground'>
          {t('session.title', 'AI Agent Chat')}
        </h3>
        <p className='text-xs text-muted-foreground max-w-sm mt-1 mb-6'>
          {t(
            'session.desc',
            'Collaborate with OpenCode autonomous agents across your projects and codebases.'
          )}
        </p>

        {onQuickPrompt && (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md w-full text-left'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onQuickPrompt('Explore the codebase and summarize architecture')}
              className='h-auto p-3 flex flex-col items-start gap-1 text-xs border-border/70 hover:border-primary/50 rounded-xl'
            >
              <div className='flex items-center gap-1.5 font-semibold text-foreground'>
                <Code2 className='h-3.5 w-3.5 text-primary' />
                <span>Explore Architecture</span>
              </div>
              <span className='text-[11px] text-muted-foreground'>
                Survey codebase structure and key components
              </span>
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() => onQuickPrompt('Check current git status and recent changes')}
              className='h-auto p-3 flex flex-col items-start gap-1 text-xs border-border/70 hover:border-primary/50 rounded-xl'
            >
              <div className='flex items-center gap-1.5 font-semibold text-foreground'>
                <Terminal className='h-3.5 w-3.5 text-emerald-500' />
                <span>Check Git Status</span>
              </div>
              <span className='text-[11px] text-muted-foreground'>
                Review uncommitted diffs and working branch
              </span>
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Determine if the assistant has already started outputting visible content
  const lastNonSystemMsg = messages.findLast(
    (m) => m.type === 'user' || m.type === 'assistant'
  )
  const assistantHasContent =
    lastNonSystemMsg?.type === 'assistant' &&
    Array.isArray((lastNonSystemMsg as { content?: unknown[] }).content) &&
    ((lastNonSystemMsg as { content?: unknown[] }).content?.length ?? 0) > 0

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className='flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 space-y-3.5 select-text relative'
    >
      {messages.map((message, idx) => (
        <TimelineMessage
          key={(message as { id?: string }).id || idx}
          message={message}
          onRetry={onRetry}
        />
      ))}

      {/* Live Thinking Effect while waiting for response */}
      {isStreaming && !assistantHasContent && (
        <div className='flex items-start gap-3 max-w-3xl mr-auto group py-2 animate-in fade-in-50 duration-300'>
          {/* Glowing Animated Avatar */}
          <div className='relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-primary to-rose-500 text-white shadow-sm ring-2 ring-primary/30 shrink-0 mt-0.5 animate-pulse'>
            <BrainCircuit className='h-4 w-4' />
          </div>

          <div className='flex flex-col gap-2 max-w-[92%] flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <span className='font-semibold text-xs text-foreground'>
                OpenCode Agent
              </span>
              <div className='flex items-center gap-1 text-[11px] text-muted-foreground/80 bg-muted/60 px-2 py-0.5 rounded-full'>
                <Loader2 className='h-3 w-3 animate-spin text-primary' />
                <span>{elapsedSeconds}s</span>
              </div>
              {onInterrupt && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={onInterrupt}
                  className='h-5 px-2 text-[10px] text-destructive hover:bg-destructive/10 ml-auto gap-1'
                >
                  <Square className='h-2.5 w-2.5 fill-current' />
                  <span>{t('session.stop', 'Stop')}</span>
                </Button>
              )}
            </div>

            {/* Thinking Visual Card */}
            <div className='rounded-2xl rounded-tl-sm bg-muted/30 border border-primary/20 p-3.5 shadow-2xs space-y-2.5'>
              <div className='flex items-center gap-2 text-xs font-medium text-foreground'>
                <Sparkles className='h-3.5 w-3.5 text-primary animate-spin' />
                <span>{t('session.thinkingStatus', 'Agent is reasoning & searching codebase...')}</span>
              </div>

              {/* Shimmering thinking progress bars */}
              <div className='space-y-1.5 pt-1'>
                <div className='h-2 w-3/4 rounded-full bg-gradient-to-r from-muted-foreground/20 via-primary/30 to-muted-foreground/20 animate-pulse' />
                <div className='h-2 w-1/2 rounded-full bg-gradient-to-r from-muted-foreground/15 via-primary/20 to-muted-foreground/15 animate-pulse delay-150' />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Scroll to Bottom Button (Icon only) */}
      {!isNearBottom && (
        <div className='sticky bottom-3 flex justify-center z-20 pointer-events-none'>
          <Button
            size='icon'
            variant='secondary'
            onClick={scrollToBottom}
            className='pointer-events-auto h-8 w-8 rounded-full shadow-md border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-transform hover:scale-105 active:scale-95'
            title={t('session.scrollToBottom', 'Scroll to bottom')}
          >
            <ArrowDown className='h-4 w-4' />
          </Button>
        </div>
      )}

      <div ref={endRef} className='h-1' />
    </div>
  )
}
