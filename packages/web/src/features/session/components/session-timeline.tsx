import { useEffect, useRef, useState } from 'react'
import { Bot, Terminal, Code2, Loader2, ArrowDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { TimelineMessage } from './timeline-message'
import { latestTurnAssistant, shouldShowWorkingStatus } from '../lib/session-busy'
import type { SessionMessageInfo } from '../api'

interface SessionTimelineProps {
  messages: SessionMessageInfo[]
  isLoading?: boolean
  isStreaming?: boolean
  onQuickPrompt?: (prompt: string) => void
  onRetry?: (text: string) => void
}

export function SessionTimeline({
  messages,
  isLoading,
  isStreaming,
  onQuickPrompt,
  onRetry,
}: SessionTimelineProps) {
  const { t } = useTranslation(['model-provider', 'common'])
  const containerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!isStreaming) {
      setElapsedSeconds(0)
      return
    }
    setElapsedSeconds(0)
    const timer = setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [isStreaming])

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    setIsNearBottom(scrollHeight - scrollTop - clientHeight < 120)
  }

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
    setIsNearBottom(true)
  }

  useEffect(() => {
    if (isNearBottom) endRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages, isStreaming, isNearBottom])

  if (isLoading) {
    return (
      <div className='flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex gap-3 max-w-xl ${i % 2 === 0 ? 'ml-auto justify-end' : ''}`}
          >
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

  // Same role as packages/app StatusLane / showWorking: only while busy and this turn has no visible parts yet.
  // Once reasoning/text/tools appear, that UI replaces this row — never keep "Thinking…" above the reply.
  const showWorking = shouldShowWorkingStatus(Boolean(isStreaming), messages)
  const liveAssistant = isStreaming ? latestTurnAssistant(messages) : undefined

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className='flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 space-y-3.5 select-text relative'
    >
      {messages.map((message, idx) => {
        const retryText =
          message.type === 'assistant'
            ? (
                messages
                  .slice(0, idx)
                  .findLast((m) => m.type === 'user') as { text?: string } | undefined
              )?.text
            : undefined
        const isLive =
          message.type === 'assistant' &&
          liveAssistant !== undefined &&
          (message as { id?: string }).id === liveAssistant.id
        return (
          <TimelineMessage
            key={(message as { id?: string }).id || idx}
            message={message}
            isLive={isLive}
            retryText={retryText}
            onRetry={onRetry}
          />
        )
      })}

      {showWorking && (
        <div
          data-component='session-working'
          role='status'
          className='flex h-9 items-center gap-2 max-w-3xl text-[13px] text-muted-foreground animate-in fade-in slide-in-from-bottom-1 duration-200'
        >
          <Loader2 className='h-3.5 w-3.5 animate-spin text-primary shrink-0' />
          <span className='font-medium'>{t('session.timeline.working', 'Working')}</span>
          <span className='font-mono text-[11px] text-muted-foreground/70 tabular-nums'>
            {elapsedSeconds}s
          </span>
        </div>
      )}

      {!isNearBottom && (
        <div className='sticky bottom-3 flex justify-center z-20 pointer-events-none'>
          <Button
            size='icon'
            variant='secondary'
            onClick={scrollToBottom}
            className='pointer-events-auto h-8 w-8 rounded-full shadow-md border border-border/60'
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
